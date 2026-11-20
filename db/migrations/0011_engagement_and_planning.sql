-- 0011 Engagement and planning: cases and chat (with calls and expiry), help requests
-- during events, event messages, notifications, reviews, campaigns, organiser tasks,
-- budgets and expenses, vendors.

create type case_type as enum ('QUESTION', 'TICKET_PROBLEM', 'COMPLAINT', 'LOST_AND_FOUND', 'HELP_REQUEST', 'OTHER');
create type case_status as enum ('OPEN', 'WAITING_FOR_ATTENDEE', 'ANSWERED', 'CLOSED', 'EXPIRED');
create type help_status as enum ('SUBMITTED', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ESCALATED');
create type message_priority as enum ('NORMAL', 'URGENT');

-- Cases: every conversation and help request has a number (CS-YYMM-NNNN).
-- Chat closes 14 days after the event (24 h after a help request is done);
-- messages and call logs are deleted 90 days after closing; the case row is kept.
create sequence case_number_seq;
create table cases (
  id            uuid primary key default gen_random_uuid(),
  number        text not null unique default ('CS-' || to_char(now(), 'YYMM') || '-' || lpad(nextval('case_number_seq')::text, 4, '0')),
  type          case_type not null,
  status        case_status not null default 'OPEN',
  subject       text not null,
  org_id        uuid not null references organisations(id),
  event_id      uuid references events(id),
  attendee_id   uuid not null references users(id),
  opened_at     timestamptz not null default now(),
  closes_at     timestamptz not null,
  closed_at     timestamptz,
  messages_deleted_at timestamptz,
  outcome       text
);
create index cases_org on cases (org_id, status);
create index cases_attendee on cases (attendee_id);

create table case_messages (
  id            bigint generated always as identity primary key,
  case_id       uuid not null references cases(id),
  sender        text not null check (sender in ('ATTENDEE', 'TEAM', 'SYSTEM')),
  user_id       uuid references users(id),
  body          text,
  call_seconds  int check (call_seconds >= 0),     -- in-app call log: 0 = missed
  call_by       text check (call_by in ('ATTENDEE', 'TEAM')),
  at            timestamptz not null default now(),
  check (body is not null or call_seconds is not null)
);
create index case_messages_case on case_messages (case_id, at);

-- No new messages once a case has closed or expired (system lines excepted).
create or replace function app.check_case_open() returns trigger language plpgsql as $$
declare c cases;
begin
  select * into c from cases where id = new.case_id;
  if new.sender <> 'SYSTEM' and (c.status in ('CLOSED', 'EXPIRED') or now() > c.closes_at) then
    raise exception 'Case % is closed; the chat is read-only', c.number;
  end if;
  return new;
end $$;
create trigger case_messages_open before insert on case_messages for each row execute function app.check_case_open();

-- Job: delete messages 90 days after a case closed, keep the case row and outcome.
create or replace function app.purge_closed_case_messages() returns int language plpgsql security definer set search_path = public, app as $$
declare v_n int;
begin
  with gone as (
    delete from case_messages m using cases c
    where m.case_id = c.id and c.closed_at is not null and c.closed_at < now() - interval '90 days' returning m.case_id)
  select count(*) into v_n from gone;
  update cases set messages_deleted_at = now() where closed_at < now() - interval '90 days' and messages_deleted_at is null;
  return v_n;
end $$;

create table help_requests (
  id           uuid primary key default gen_random_uuid(),
  case_id      uuid not null unique references cases(id),
  event_id     uuid not null references events(id),
  duty         text not null check (duty in ('security', 'usher', 'first_aid', 'access', 'lost_found', 'cleaning', 'other')),
  ticket_id    uuid references tickets(id),
  spot         text,                              -- from the ticket or the QR code on a table/pew
  note         text,
  photo_path   text,
  contact_phone text,
  status       help_status not null default 'SUBMITTED',
  assignee_id  uuid references users(id),
  created_at   timestamptz not null default now(),
  accepted_at  timestamptz,
  done_at      timestamptz,
  escalated_at timestamptz
);
create index help_requests_event on help_requests (event_id, status);

create table help_request_log (
  id          bigint generated always as identity primary key,
  request_id  uuid not null references help_requests(id),
  at          timestamptz not null default now(),
  by_user     uuid references users(id),
  what        text not null
);
create trigger help_request_log_append_only before update or delete on help_request_log for each row execute function app.forbid_change();

create table event_messages (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references events(id),
  title       text not null,
  body        text not null,
  priority    message_priority not null default 'NORMAL',
  audience    jsonb not null,                    -- conditions: ticket types, gender, check-in, area, staff team
  recipients  int not null default 0,
  opened      int not null default 0,
  sms_sent    int not null default 0,
  sent_by     uuid not null references users(id),
  sent_at     timestamptz not null default now()
);

create table notifications (
  id        bigint generated always as identity primary key,
  user_id   uuid not null references users(id),
  kind      text not null,
  title     text not null,
  body      text,
  link      text,
  created_at timestamptz not null default now(),
  read_at   timestamptz
);
create index notifications_user on notifications (user_id, created_at desc);

-- Reviews: verified only with a ticket, registration or check-in; one per attendee per event.
create table reviews (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null references events(id),
  org_id         uuid not null references organisations(id),
  user_id        uuid not null references users(id),
  rating         smallint not null check (rating between 1 and 5),
  body           text,
  visibility     text not null default 'PUBLIC' check (visibility in ('PUBLIC', 'ANONYMOUS', 'PRIVATE')),
  verified       boolean not null default false,
  status         text not null default 'PUBLISHED' check (status in ('PUBLISHED', 'REPORTED', 'HIDDEN')),
  editable_until timestamptz not null default now() + interval '14 days',
  created_at     timestamptz not null default now(),
  unique (event_id, user_id)
);
create table review_replies (
  review_id  uuid primary key references reviews(id),
  body       text not null,
  public     boolean not null default true,
  by_user    uuid not null references users(id),
  at         timestamptz not null default now()
);
create table review_photos (
  id          uuid primary key default gen_random_uuid(),
  review_id   uuid not null references reviews(id),
  path        text not null,
  status      text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  moderated_by uuid references users(id)
);

create table campaigns (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organisations(id),
  name        text not null,
  channel     text not null check (channel in ('SMS', 'EMAIL', 'WHATSAPP', 'PUSH')),
  segment     jsonb not null default '{}',
  body        text not null,
  status      text not null default 'DRAFT' check (status in ('DRAFT', 'SCHEDULED', 'SENT', 'CANCELLED')),
  send_at     timestamptz,
  sent        int not null default 0,
  created_by  uuid references users(id),
  created_at  timestamptz not null default now()
);

create table event_tasks (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references events(id),
  title       text not null,
  owner_id    uuid references users(id),
  due_at      timestamptz,
  done_at     timestamptz,
  checklist   text
);

create table vendors (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organisations(id),
  name       text not null,
  service    text,
  phone      text,
  email      citext,
  notes      text
);

create table budget_lines (
  id        uuid primary key default gen_random_uuid(),
  event_id  uuid not null references events(id),
  category  text not null,
  planned   bigint not null check (planned >= 0)
);

-- Organiser expenses (their own money, not EMS-held funds). Approval by the organiser's own role.
create table expenses (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references organisations(id),
  event_id     uuid references events(id),
  vendor_id    uuid references vendors(id),
  category     text not null,
  amount       bigint not null check (amount > 0),
  receipt_path text,
  status       text not null default 'SUBMITTED' check (status in ('SUBMITTED', 'APPROVED', 'REJECTED', 'PAID')),
  submitted_by uuid not null references users(id),
  approved_by  uuid references users(id),
  created_at   timestamptz not null default now(),
  check (approved_by is null or approved_by <> submitted_by)
);
create trigger expenses_audit after insert or update on expenses for each row execute function app.audit_row();
