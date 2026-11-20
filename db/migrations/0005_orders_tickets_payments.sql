-- 0005 Orders, tickets and payments: orders (guest checkout allowed), issued tickets,
-- transfers, waitlist, discount codes, payment intents, provider webhooks (inbox),
-- provider statements, refunds and chargebacks. (Design 2.4.)
-- Idempotency keys are unique wherever money moves.

create type order_status as enum ('PENDING', 'PAID', 'EXPIRED', 'CANCELLED', 'PARTLY_REFUNDED', 'REFUNDED');
create type ticket_status as enum ('VALID', 'CANCELLED', 'REFUNDED', 'TRANSFERRED');
create type provider as enum ('MTN', 'AIRTEL', 'ZAMTEL', 'CARD', 'BANK');
create type intent_status as enum ('PENDING', 'SUCCEEDED', 'FAILED', 'EXPIRED');
create type payment_purpose as enum ('ORDER', 'CONTRIBUTION', 'INVOICE', 'LICENCE', 'PARTNERSHIP_DOWN_PAYMENT');

create table event_discount_codes (
  id        uuid primary key default gen_random_uuid(),
  event_id  uuid not null references events(id),
  code      citext not null,
  kind      text not null check (kind in ('PERCENT_BP', 'FIXED')),
  value     bigint not null check (value > 0),
  max_uses  int,
  used      int not null default 0,
  referrer_user_id uuid references users(id),      -- referral codes
  valid_to  timestamptz,
  unique (event_id, code),
  check (max_uses is null or used <= max_uses)
);

create table orders (
  id               uuid primary key default gen_random_uuid(),
  number           text not null unique,                   -- shown to buyers, e.g. EVT-8K2Q9M
  org_id           uuid not null references organisations(id),
  event_id         uuid not null references events(id),
  buyer_user_id    uuid references users(id),              -- null for guest checkout
  buyer_name       text not null,
  buyer_phone      text not null check (buyer_phone ~ '^\+[1-9][0-9]{6,14}$'),
  buyer_email      citext,
  status           order_status not null default 'PENDING',
  subtotal         bigint not null check (subtotal >= 0),
  booking_fee      bigint not null default 0 check (booking_fee >= 0),
  discount         bigint not null default 0 check (discount >= 0),
  total            bigint not null check (total >= 0),
  discount_code_id uuid references event_discount_codes(id),
  hold_expires_at  timestamptz,                            -- stock is held in Redis until then
  idempotency_key  text not null unique,
  created_at       timestamptz not null default now(),
  paid_at          timestamptz,
  check (total = subtotal + booking_fee - discount)
);
create index orders_event on orders (event_id);
create index orders_buyer on orders (buyer_user_id);
create trigger orders_audit after update on orders for each row execute function app.audit_row();

create table order_items (
  order_id        uuid not null references orders(id),
  ticket_type_id  uuid not null references ticket_types(id),
  qty             int not null check (qty > 0),
  unit_price      bigint not null check (unit_price >= 0),
  primary key (order_id, ticket_type_id)
);

-- Issued tickets. The QR code is "ticket id + nonce" signed with a server key held in
-- Secret Manager; the database stores only the nonce, so a database copy cannot mint tickets.
-- Changing the nonce (transfer, reissue) makes old QR codes stop working.
create table tickets (
  id              uuid primary key default gen_random_uuid(),
  number          text not null unique,                    -- e.g. TKT-002210-A
  order_id        uuid references orders(id),              -- null for free registration passes
  event_id        uuid not null references events(id),
  ticket_type_id  uuid not null references ticket_types(id),
  holder_user_id  uuid references users(id),
  holder_name     text,
  holder_gender   gender not null default 'PREFER_NOT_TO_SAY',   -- chosen by the buyer per ticket
  holder_phone    text check (holder_phone ~ '^\+[1-9][0-9]{6,14}$'),
  seat_id         uuid unique references seats(id),
  qr_nonce        bytea not null default gen_random_bytes(16),
  status          ticket_status not null default 'VALID',
  issued_at       timestamptz not null default now()
);
create index tickets_event on tickets (event_id);
create index tickets_holder on tickets (holder_user_id);
create trigger tickets_audit after update on tickets for each row execute function app.audit_row();

-- Final guard against overselling (the API also holds stock in Redis).
create or replace function app.check_ticket_capacity() returns trigger language plpgsql as $$
declare v_cap int; v_used int;
begin
  select capacity into v_cap from ticket_types where id = new.ticket_type_id for update;
  select count(*) into v_used from tickets where ticket_type_id = new.ticket_type_id and status in ('VALID', 'TRANSFERRED') and id <> new.id;
  if v_used >= v_cap then
    raise exception 'Ticket type % is sold out', new.ticket_type_id using errcode = 'check_violation';
  end if;
  return new;
end $$;
create trigger tickets_capacity before insert on tickets for each row execute function app.check_ticket_capacity();

create table ticket_transfers (
  id            uuid primary key default gen_random_uuid(),
  ticket_id     uuid not null references tickets(id),
  from_user_id  uuid references users(id),
  to_phone      text not null check (to_phone ~ '^\+[1-9][0-9]{6,14}$'),
  to_user_id    uuid references users(id),
  status        text not null default 'PENDING' check (status in ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED')),
  expires_at    timestamptz not null,
  created_at    timestamptz not null default now(),
  decided_at    timestamptz
);
create unique index ticket_transfers_one_pending on ticket_transfers (ticket_id) where status = 'PENDING';

create or replace function app.check_transfer_allowed() returns trigger language plpgsql as $$
declare v_ok boolean; v_close timestamptz;
begin
  select tt.transferable, e.transfers_close_at into v_ok, v_close
  from tickets t join ticket_types tt on tt.id = t.ticket_type_id join events e on e.id = t.event_id where t.id = new.ticket_id;
  if not v_ok then raise exception 'This ticket type cannot be transferred'; end if;
  if v_close is not null and now() > v_close then raise exception 'Transfers for this event are closed'; end if;
  return new;
end $$;
create trigger ticket_transfers_allowed before insert on ticket_transfers for each row execute function app.check_transfer_allowed();

create table waitlist_entries (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid not null references events(id),
  ticket_type_id  uuid references ticket_types(id),
  user_id         uuid references users(id),
  phone           text not null,
  qty             int not null default 1 check (qty between 1 and 10),
  status          text not null default 'WAITING' check (status in ('WAITING', 'OFFERED', 'BOUGHT', 'EXPIRED', 'LEFT')),
  offer_expires_at timestamptz,
  created_at      timestamptz not null default now()
);

-- Payments ----------------------------------------------------------------------

create table payment_intents (
  id               uuid primary key default gen_random_uuid(),
  purpose          payment_purpose not null,
  order_id         uuid references orders(id),
  org_id           uuid references organisations(id),
  provider         provider not null,
  amount           bigint not null check (amount > 0),
  currency         char(3) not null default 'ZMW',
  status           intent_status not null default 'PENDING',
  provider_ref     text unique,
  payer_phone      text,
  idempotency_key  text not null unique,
  created_at       timestamptz not null default now(),
  succeeded_at     timestamptz,
  check (purpose <> 'ORDER' or order_id is not null)
);
create index payment_intents_order on payment_intents (order_id);
create trigger payment_intents_audit after update on payment_intents for each row execute function app.audit_row();

-- A succeeded or failed intent never changes status again.
create or replace function app.check_intent_transition() returns trigger language plpgsql as $$
begin
  if old.status <> 'PENDING' and new.status <> old.status then
    raise exception 'Payment intent % is final (%)', old.id, old.status;
  end if;
  if new.amount <> old.amount then raise exception 'Payment amounts cannot change'; end if;
  return new;
end $$;
create trigger payment_intents_transition before update on payment_intents for each row execute function app.check_intent_transition();

-- Webhook inbox: store first, verify the signature, then process exactly once.
create table provider_webhooks (
  id            bigint generated always as identity primary key,
  provider      provider not null,
  external_id   text not null,
  payload       jsonb not null,
  signature_ok  boolean not null,
  received_at   timestamptz not null default now(),
  processed_at  timestamptz,
  error         text,
  unique (provider, external_id)
);

-- Imported from daily provider statements for reconciliation.
create table provider_transactions (
  id                 bigint generated always as identity primary key,
  provider           provider not null,
  provider_ref       text not null,
  kind               text not null check (kind in ('COLLECTION', 'REFUND', 'PAYOUT', 'CHARGEBACK', 'FEE')),
  gross              bigint not null,
  charge             bigint not null default 0,
  net                bigint not null,
  value_date         date not null,
  matched_intent_id  uuid references payment_intents(id),
  imported_at        timestamptz not null default now(),
  unique (provider, provider_ref, kind)
);

create table refunds (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references orders(id),
  amount           bigint not null check (amount > 0),
  reason           text not null,
  status           text not null default 'REQUESTED' check (status in ('REQUESTED', 'APPROVED', 'REJECTED', 'SENT', 'FAILED')),
  requested_by     uuid references users(id),
  decided_by       uuid references users(id),
  idempotency_key  text not null unique,
  created_at       timestamptz not null default now()
);
create trigger refunds_audit after insert or update on refunds for each row execute function app.audit_row();

-- Refunds can never exceed what was paid for the order.
create or replace function app.check_refund_total() returns trigger language plpgsql as $$
begin
  if (select coalesce(sum(amount), 0) from refunds where order_id = new.order_id and status in ('APPROVED', 'SENT', 'REQUESTED'))
     > (select total from orders where id = new.order_id) then
    raise exception 'Refunds would exceed the order total';
  end if;
  return new;
end $$;
create constraint trigger refunds_total after insert or update on refunds deferrable initially deferred for each row execute function app.check_refund_total();

create table chargebacks (
  id                 uuid primary key default gen_random_uuid(),
  payment_intent_id  uuid not null references payment_intents(id),
  amount             bigint not null check (amount > 0),
  received_at        timestamptz not null default now(),
  status             text not null default 'OPEN' check (status in ('OPEN', 'ACCEPTED', 'WON')),
  evidence_due_at    timestamptz,
  recovered_in_settlement_id uuid,
  recovery_invoice_id uuid
);
