-- 0006 Check-in and attendance: gate scans (with re-entry), ticket extras used at
-- stations, extras sold at the station, "I'm coming" (RSVP), open-entry check-ins,
-- usher counts and meal passes. Scans arrive from phones that may have been offline;
-- the server is the final authority (one admission per ticket unless re-entry is on).

create type scan_result as enum ('ADMITTED', 'ALREADY_USED', 'WRONG_GATE', 'CANCELLED', 'INVALID', 'NOT_INCLUDED', 'NOT_ENTERED');

create table gate_scans (
  id           bigint generated always as identity primary key,
  event_id     uuid not null references events(id),
  ticket_id    uuid references tickets(id),       -- null when the QR was not recognised
  station_id   uuid references stations(id),
  direction    text not null default 'IN' check (direction in ('IN', 'OUT')),
  result       scan_result not null,
  scanned_by   uuid references users(id),
  device_id    text,
  scanned_at   timestamptz not null,               -- time on the device
  received_at  timestamptz not null default now()  -- time the server got it (offline sync)
);
create index gate_scans_ticket on gate_scans (ticket_id, scanned_at);
create index gate_scans_event on gate_scans (event_id, scanned_at);
create trigger gate_scans_append_only before update or delete on gate_scans for each row execute function app.forbid_change();

-- One admission per ticket; with re-entry on, a new admission needs an OUT scan after the last IN.
create or replace function app.check_admission() returns trigger language plpgsql as $$
declare v_reentry boolean; v_last text;
begin
  if new.result <> 'ADMITTED' or new.ticket_id is null then return new; end if;
  if new.direction = 'OUT' then return new; end if;
  perform pg_advisory_xact_lock(hashtext(new.ticket_id::text));
  if (select status from tickets where id = new.ticket_id) <> 'VALID' then
    raise exception 'Ticket is not valid';
  end if;
  select reentry into v_reentry from events where id = new.event_id;
  select direction into v_last from gate_scans where ticket_id = new.ticket_id and result = 'ADMITTED'
    order by scanned_at desc, id desc limit 1;
  if v_last = 'IN' then
    raise exception 'Ticket already admitted' using errcode = 'unique_violation';
  end if;
  if v_last = 'OUT' and not v_reentry then
    raise exception 'Re-entry is not allowed at this event';
  end if;
  return new;
end $$;
create trigger gate_scans_admission before insert on gate_scans for each row execute function app.check_admission();

-- Extras used at stations (dinner, drinks). Each use is final and logged.
create table allowance_uses (
  id            bigint generated always as identity primary key,
  ticket_id     uuid not null references tickets(id),
  allowance_id  uuid not null references allowances(id),
  station_id    uuid references stations(id),
  qty           int not null default 1 check (qty > 0),
  used_by       uuid references users(id),
  used_at       timestamptz not null default now()
);
create trigger allowance_uses_append_only before update or delete on allowance_uses for each row execute function app.forbid_change();

create or replace function app.check_allowance_use() returns trigger language plpgsql as $$
declare v_included int; v_used int; v_after boolean;
begin
  perform pg_advisory_xact_lock(hashtext(new.ticket_id::text || new.allowance_id::text));
  select tta.qty into v_included from tickets t join ticket_type_allowances tta on tta.ticket_type_id = t.ticket_type_id
    where t.id = new.ticket_id and tta.allowance_id = new.allowance_id;
  if v_included is null then raise exception 'This ticket does not include that extra'; end if;
  select coalesce(sum(qty), 0) into v_used from allowance_uses where ticket_id = new.ticket_id and allowance_id = new.allowance_id;
  if v_used + new.qty > v_included then raise exception 'Already collected (% of %)', v_used, v_included; end if;
  select after_entry into v_after from allowances where id = new.allowance_id;
  if v_after and not exists (select 1 from gate_scans where ticket_id = new.ticket_id and result = 'ADMITTED' and direction = 'IN') then
    raise exception 'This ticket has not entered at the gate yet';
  end if;
  return new;
end $$;
create trigger allowance_uses_check before insert on allowance_uses for each row execute function app.check_allowance_use();

-- Extras bought at the station by people whose ticket doesn't include them.
-- Paid to the organiser's attendant (outside EMS), counted in their cash.
create table allowance_sales (
  id            bigint generated always as identity primary key,
  event_id      uuid not null references events(id),
  allowance_id  uuid not null references allowances(id),
  ticket_id     uuid references tickets(id),
  price         bigint not null check (price > 0),
  pay_method    text not null check (pay_method in ('CASH', 'CARD', 'MOBILE_MONEY')),
  pay_ref       text,
  attendant_id  uuid not null references users(id),
  sold_at       timestamptz not null default now(),
  check (pay_method = 'CASH' or pay_ref is not null)
);
create trigger allowance_sales_append_only before update or delete on allowance_sales for each row execute function app.forbid_change();

-- "I'm coming", with the number of people (for planning seating and food).
create table rsvps (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references events(id),
  user_id      uuid references users(id),
  phone        text check (phone ~ '^\+[1-9][0-9]{6,14}$'),
  people       int not null check (people between 1 and 20),
  reminded_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  check (user_id is not null or phone is not null)
);
create unique index rsvps_user on rsvps (event_id, user_id) where user_id is not null;
create unique index rsvps_phone on rsvps (event_id, phone) where user_id is null;

-- Open-entry check-ins ("I'm here"). One per phone (device) per event.
create table open_checkins (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references events(id),
  user_id      uuid references users(id),
  device_hash  text not null,                       -- hashed device identifier, not the raw ID
  people       int not null check (people between 1 and 15),
  code_window  text,                                -- which rotating QR code was scanned
  checked_in_at timestamptz not null default now(),
  unique (event_id, device_hash)
);
create index open_checkins_event on open_checkins (event_id, checked_in_at);

-- Only while the event is on (with 2 hours' grace before the start).
create or replace function app.check_open_checkin_window() returns trigger language plpgsql as $$
declare v_start timestamptz; v_end timestamptz; v_entry entry_mode;
begin
  select starts_at, ends_at, entry into v_start, v_end, v_entry from events where id = new.event_id;
  if v_entry <> 'OPEN' then raise exception 'Check-in codes are only for open-entry events'; end if;
  if new.checked_in_at < v_start - interval '2 hours' or new.checked_in_at > v_end then
    raise exception 'The check-in code only works during the event';
  end if;
  return new;
end $$;
create trigger open_checkins_window before insert on open_checkins for each row execute function app.check_open_checkin_window();

-- Ushers count people without a smartphone (+1, +5, −1).
create table usher_counts (
  id         bigint generated always as identity primary key,
  event_id   uuid not null references events(id),
  user_id    uuid not null references users(id),
  delta      int not null check (delta between -50 and 50 and delta <> 0),
  purpose    text not null default 'HEADCOUNT' check (purpose in ('HEADCOUNT', 'MEAL_SERVED')),
  at         timestamptz not null default now()
);
create trigger usher_counts_append_only before update or delete on usher_counts for each row execute function app.forbid_change();

-- Meals collected with a meal pass (the open check-in), at most one per person checked in.
create table meal_pass_uses (
  id          bigint generated always as identity primary key,
  checkin_id  uuid not null references open_checkins(id),
  qty         int not null check (qty > 0),
  served_by   uuid references users(id),
  served_at   timestamptz not null default now()
);
create trigger meal_pass_uses_append_only before update or delete on meal_pass_uses for each row execute function app.forbid_change();

create or replace function app.check_meal_pass() returns trigger language plpgsql as $$
begin
  perform pg_advisory_xact_lock(hashtext(new.checkin_id::text));
  if (select coalesce(sum(qty), 0) from meal_pass_uses where checkin_id = new.checkin_id) + new.qty
     > (select people from open_checkins where id = new.checkin_id) then
    raise exception 'All meals on this pass have been collected';
  end if;
  return new;
end $$;
create trigger meal_pass_uses_check before insert on meal_pass_uses for each row execute function app.check_meal_pass();

-- Live attendance for an open-entry event: app check-ins + usher counts.
-- security_invoker: the view runs with the caller's rights, so row-level security still applies.
create view event_attendance with (security_invoker = true) as
select e.id as event_id,
  coalesce((select sum(people) from open_checkins c where c.event_id = e.id), 0) as checked_in_by_phone,
  coalesce((select sum(delta) from usher_counts u where u.event_id = e.id and u.purpose = 'HEADCOUNT'), 0) as counted_by_ushers,
  coalesce((select sum(people) from rsvps r where r.event_id = e.id), 0) as expected
from events e;
