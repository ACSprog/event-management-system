-- 0012 Billing, support and privacy: invoices (subscriptions, licences, add-ons,
-- direct-collection fees, sales tracking, SMS shortfall, chargeback recovery),
-- outbound SMS log, EMS support tickets, and data protection requests.

create type invoice_status as enum ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'VOID');

create sequence invoice_number_seq;
create table invoices (
  id             uuid primary key default gen_random_uuid(),
  number         text not null unique default ('INV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('invoice_number_seq')::text, 5, '0')),
  org_id         uuid not null references organisations(id),
  status         invoice_status not null default 'DRAFT',
  issued_at      timestamptz,
  due_at         timestamptz,
  paid_at        timestamptz,
  pay_token_hash text,                  -- payment link token, stored hashed
  created_at     timestamptz not null default now()
);
create trigger invoices_audit after insert or update on invoices for each row execute function app.audit_row();

create table invoice_lines (
  id          bigint generated always as identity primary key,
  invoice_id  uuid not null references invoices(id),
  kind        text not null check (kind in ('SUBSCRIPTION', 'LICENCE', 'ADDON', 'DIRECT_EVENT_FEE', 'SALES_TRACKING', 'SMS_SHORTFALL', 'CHARGEBACK_RECOVERY', 'OTHER')),
  event_id    uuid references events(id),
  label       text not null,
  qty         int not null default 1 check (qty > 0),
  unit_amount bigint not null,
  vat_bp      int not null default 0 check (vat_bp between 0 and 10000)
);

-- Lines can't change once the invoice is sent.
create or replace function app.check_invoice_lines() returns trigger language plpgsql as $$
begin
  if (select status from invoices where id = coalesce(new.invoice_id, old.invoice_id)) <> 'DRAFT' then
    raise exception 'Invoice lines are fixed once the invoice is sent';
  end if;
  return coalesce(new, old);
end $$;
create trigger invoice_lines_draft_only before insert or update or delete on invoice_lines for each row execute function app.check_invoice_lines();

-- Outbound SMS (OTP, tickets, urgent message backups). Message bodies with codes are never stored.
create table sms_messages (
  id           bigint generated always as identity primary key,
  org_id       uuid references organisations(id),
  to_phone     text not null,
  purpose      text not null check (purpose in ('OTP', 'TICKET', 'RECEIPT', 'URGENT_BACKUP', 'REMINDER', 'CAMPAIGN', 'OTHER')),
  segments     int not null default 1,
  provider_ref text,
  status       text not null default 'QUEUED' check (status in ('QUEUED', 'SENT', 'DELIVERED', 'FAILED')),
  billed_to_credits boolean not null default true,
  created_at   timestamptz not null default now()
);
create index sms_messages_org on sms_messages (org_id, created_at desc);

create table support_tickets (
  id          uuid primary key default gen_random_uuid(),
  number      text not null unique,
  org_id      uuid references organisations(id),
  subject     text not null,
  priority    text not null default 'NORMAL' check (priority in ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  status      text not null default 'OPEN' check (status in ('OPEN', 'WAITING_ON_CUSTOMER', 'RESOLVED', 'CLOSED')),
  assignee_id uuid references users(id),
  created_by  uuid references users(id),
  created_at  timestamptz not null default now()
);
create table support_messages (
  id         bigint generated always as identity primary key,
  ticket_id  uuid not null references support_tickets(id),
  user_id    uuid references users(id),
  body       text not null,
  internal   boolean not null default false,
  at         timestamptz not null default now()
);

-- Data Protection Act 2021: access, correction and deletion requests, with deadlines.
create table data_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id),
  kind        text not null check (kind in ('ACCESS', 'CORRECTION', 'DELETION', 'OBJECTION')),
  status      text not null default 'OPEN' check (status in ('OPEN', 'IN_PROGRESS', 'DONE', 'REFUSED')),
  due_at      timestamptz not null default now() + interval '30 days',
  handled_by  uuid references users(id),
  note        text,
  created_at  timestamptz not null default now()
);
create trigger data_requests_audit after insert or update on data_requests for each row execute function app.audit_row();
