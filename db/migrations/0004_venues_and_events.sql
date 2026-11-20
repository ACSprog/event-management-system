-- 0004 Venues and events: venue records (with Google place IDs), events and their
-- entry mode, programme, ticket types, what tickets include (allowances), scanner
-- stations, seating, staff, the frozen commercial terms and event licences.

create type event_category as enum ('MUSIC', 'NIGHTLIFE', 'COMEDY', 'ARTS_AND_THEATRE', 'FILM', 'FOOD_AND_DRINK', 'FAMILY_AND_KIDS',
  'CHURCH', 'WEDDING', 'SPORTS', 'FITNESS', 'CONFERENCE', 'BUSINESS', 'TECHNOLOGY', 'EDUCATION', 'WORKSHOP', 'EXHIBITION', 'CHARITY');
create type event_format as enum ('PHYSICAL', 'VIRTUAL', 'HYBRID');
create type entry_mode as enum ('TICKETS', 'REGISTRATION', 'OPEN');
create type listing as enum ('PUBLIC', 'UNLISTED');
create type audience as enum ('ALL_AGES', 'FAMILY_FRIENDLY', 'ADULTS_18');
create type seating as enum ('GENERAL', 'RESERVED', 'TABLES');
create type event_status as enum ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ON_SALE', 'SOLD_OUT', 'POSTPONED', 'CANCELLED', 'ENDED', 'ARCHIVED');
create type sales_tracking as enum ('PACKAGE', 'COMMISSION');
create type station_kind as enum ('GATE', 'ALLOWANCE', 'ORDERS', 'HEADCOUNT');
create type arrangement as enum ('FREE_EVENT', 'TICKET_FEE', 'EVENT_LICENCE', 'SUBSCRIPTION', 'ENTERPRISE', 'PARTNERSHIP');
create type collection as enum ('CENTRAL', 'DIRECT');
create type fee_payer as enum ('ORGANISER_ABSORBS', 'BUYER_PAYS');
create type licence_status as enum ('PENDING_PAYMENT', 'ACTIVE', 'READ_ONLY', 'EXPIRED', 'REFUNDED');

-- The organiser's own venue records. Google content is limited to the place ID and
-- what the organiser confirms; capacity and prices are never inferred from Google.
create table venues (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid references organisations(id),   -- null = shared public venue record
  google_place_id text,
  name           text not null,
  address        text,
  city           text,
  location       geography(point, 4326),
  plus_code      text,
  capacity       int check (capacity > 0),
  contact_name   text,
  contact_phone  text,
  notes          text,
  accessibility  jsonb not null default '{}',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index venues_location on venues using gist (location);
create unique index venues_org_place on venues (org_id, google_place_id) where google_place_id is not null;
create trigger venues_touch before update on venues for each row execute function app.touch_updated_at();

create table events (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organisations(id),
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title           text not null,
  subtitle        text,
  description     text,
  category        event_category not null,
  format          event_format not null default 'PHYSICAL',
  entry           entry_mode not null default 'TICKETS',
  listing         listing not null default 'PUBLIC',
  audience        audience not null default 'ALL_AGES',
  seating         seating not null default 'GENERAL',
  status          event_status not null default 'DRAFT',
  venue_id        uuid references venues(id),
  location        geography(point, 4326),        -- copied from the venue or dropped pin, for "near me"
  location_link   text,                          -- shared Google Maps link, if given
  online_url      text,
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  timezone        text not null default 'Africa/Lusaka',
  -- Event-day settings (rules in src/lib/event-day.ts)
  rsvp            boolean not null default false,
  checkin_qr      boolean not null default false,
  meal_pass       boolean not null default false,
  reentry         boolean not null default false,
  menu_enabled    boolean not null default false,
  sales_tracking  sales_tracking,
  transfers_close_at timestamptz,
  palette         text[],
  recurring_parent_id uuid references events(id),
  published_at    timestamptz,
  created_by      uuid references users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (ends_at > starts_at),
  check (format = 'VIRTUAL' or venue_id is not null or location is not null or status = 'DRAFT'),
  check (menu_enabled = false or sales_tracking is not null)
);
create index events_org on events (org_id);
create index events_starts on events (starts_at);
create index events_location on events using gist (location);
create index events_public on events (status, starts_at) where listing = 'PUBLIC';
create trigger events_touch before update on events for each row execute function app.touch_updated_at();
create trigger events_audit after insert or update on events for each row execute function app.audit_row();

-- Programme: sessions, line-up, stages.
create table event_sessions (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references events(id) on delete cascade,
  title      text not null,
  stage      text,
  starts_at  timestamptz not null,
  ends_at    timestamptz,
  people     text[] not null default '{}',
  sort       int not null default 0
);

create table ticket_types (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid not null references events(id),
  name            text not null,
  price           bigint not null check (price >= 0),
  currency        char(3) not null default 'ZMW',
  capacity        int not null check (capacity > 0),
  admits          int not null default 1 check (admits between 1 and 50),  -- table of 8 = 8
  sales_start     timestamptz,
  sales_end       timestamptz,
  max_per_order   int not null default 10 check (max_per_order between 1 and 100),
  transferable    boolean not null default true,
  refundable      boolean not null default true,
  who_can_buy     text not null default 'Everyone',
  sort            int not null default 0,
  unique (event_id, name)
);

-- What a ticket can include (dinner, drinks, lunch). Used at ALLOWANCE stations.
create table allowances (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references events(id),
  key           text not null check (key ~ '^[a-z_]+$'),
  label         text not null,
  window_start  time,
  window_end    time,
  per_day       boolean not null default false,
  after_entry   boolean not null default true,
  sell_price    bigint check (sell_price > 0),   -- null = can't be bought at the station
  unique (event_id, key)
);

create table ticket_type_allowances (
  ticket_type_id  uuid not null references ticket_types(id),
  allowance_id    uuid not null references allowances(id),
  qty             int not null check (qty > 0),
  primary key (ticket_type_id, allowance_id)
);

create table stations (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references events(id),
  kind          station_kind not null,
  label         text not null,
  allowance_id  uuid references allowances(id),
  point         text,                  -- collection point name for ORDERS stations
  ticket_types  uuid[],                -- GATE: which ticket types may enter here (null = all)
  check ((kind = 'ALLOWANCE') = (allowance_id is not null))
);

-- Reserved seating and tables.
create table seats (
  id        uuid primary key default gen_random_uuid(),
  event_id  uuid not null references events(id),
  section   text not null,
  row_label text,
  number    text not null,
  ticket_type_id uuid references ticket_types(id),
  unique (event_id, section, row_label, number)
);

create table event_staff (
  event_id  uuid not null references events(id),
  user_id   uuid not null references users(id),
  duty      text not null check (duty in ('usher', 'security', 'first_aid', 'access', 'cleaning', 'lost_found', 'gate', 'attendant', 'kitchen', 'manager')),
  area      text,
  status    text not null default 'off' check (status in ('available', 'busy', 'off')),
  shift_start timestamptz,
  shift_end   timestamptz,
  primary key (event_id, user_id, duty)
);

-- The commercial terms snapshot: editable while the event is a draft, frozen at publish.
create table event_commercial_terms (
  event_id          uuid primary key references events(id),
  arrangement       arrangement not null,
  collection        collection not null default 'CENTRAL',
  fee_payer         fee_payer not null default 'ORGANISER_ABSORBS',
  fee_bp            int not null default 0 check (fee_bp between 0 and 10000),
  fee_fixed         bigint not null default 0 check (fee_fixed >= 0),
  booking_fee_bp    int not null default 0 check (booking_fee_bp between 0 and 10000),
  booking_fee_fixed bigint not null default 0 check (booking_fee_fixed >= 0),
  plan_version_id   uuid references plan_versions(id),
  licence_id        uuid,
  agreement_id      uuid references partnership_agreements(id),
  sales_tracking    sales_tracking,
  sales_tracking_price bigint check (sales_tracking_price >= 0),     -- PACKAGE: up front
  sales_tracking_bp int check (sales_tracking_bp between 0 and 10000), -- COMMISSION: on recorded sales
  frozen_at         timestamptz,
  check (arrangement <> 'PARTNERSHIP' or (agreement_id is not null and collection = 'CENTRAL')),
  check (sales_tracking is null or (sales_tracking = 'PACKAGE' and sales_tracking_price is not null) or (sales_tracking = 'COMMISSION' and sales_tracking_bp is not null))
);
create trigger event_commercial_terms_audit after insert or update on event_commercial_terms for each row execute function app.audit_row();

create or replace function app.check_commercial_terms() returns trigger language plpgsql as $$
declare v_org uuid;
begin
  if tg_op = 'UPDATE' and old.frozen_at is not null then
    raise exception 'Commercial terms are frozen since %; create an adjustment instead', old.frozen_at;
  end if;
  select org_id into v_org from events where id = new.event_id;
  if new.arrangement = 'PARTNERSHIP' and not exists (
      select 1 from partnership_agreements a where a.id = new.agreement_id and a.status = 'ACTIVE' and a.org_id = v_org) then
    raise exception 'A partnership event needs an ACTIVE agreement with this organisation';
  end if;
  if new.arrangement = 'EVENT_LICENCE' and exists (
      select 1 from subscriptions s where s.org_id = v_org and s.status in ('TRIAL', 'ACTIVE', 'GRACE')) then
    raise exception 'An organisation with a live subscription cannot use an event licence (R1.1)';
  end if;
  if new.collection = 'DIRECT' and not exists (
      select 1 from contracts c where c.org_id = v_org and c.kind in ('DIRECT_COLLECTION', 'ENTERPRISE')
        and c.signed_at is not null and (c.valid_to is null or c.valid_to > now())) then
    raise exception 'Direct collection needs a signed direct-collection or enterprise contract';
  end if;
  return new;
end $$;
create trigger event_commercial_terms_check before insert or update on event_commercial_terms for each row execute function app.check_commercial_terms();

-- Freeze the terms when the event is published.
create or replace function app.freeze_terms_on_publish() returns trigger language plpgsql as $$
begin
  if new.published_at is not null and old.published_at is null then
    if not exists (select 1 from event_commercial_terms where event_id = new.id) then
      raise exception 'An event needs commercial terms before it is published';
    end if;
    update event_commercial_terms set frozen_at = now() where event_id = new.id and frozen_at is null;
  end if;
  return new;
end $$;
create trigger events_freeze_terms after update of published_at on events for each row execute function app.freeze_terms_on_publish();

create table event_licences (
  id                  uuid primary key default gen_random_uuid(),
  event_id            uuid not null unique references events(id),
  package_version_id  uuid not null references licence_package_versions(id),
  status              licence_status not null default 'PENDING_PAYMENT',
  guests_allowed      int not null check (guests_allowed > 0),
  active_until        timestamptz,
  read_only_until     timestamptz,
  paid_by             uuid references users(id),
  credited_to_subscription_id uuid references subscriptions(id),
  created_at          timestamptz not null default now()
);
alter table event_commercial_terms add constraint event_commercial_terms_licence_fk foreign key (licence_id) references event_licences(id);
