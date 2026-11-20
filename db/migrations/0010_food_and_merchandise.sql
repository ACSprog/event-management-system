-- 0010 Food and merchandise. Only the organiser sells. EMS does NOT take this money:
-- buyers pay the organiser's attendant (cash, card on the organiser's machine, or mobile
-- money to the organiser's number). EMS records orders, stock and what each attendant
-- must hand in. EMS earns by a sales-tracking package or a commission on recorded sales
-- (event_commercial_terms.sales_tracking), invoiced to the organiser.

create type menu_kind as enum ('FOOD', 'DRINKS', 'MERCHANDISE');
create type pay_method as enum ('CASH', 'CARD', 'MOBILE_MONEY');
create type food_order_status as enum ('WAITING', 'PREPARING', 'READY', 'PART_COLLECTED', 'COLLECTED', 'CANCELLED');
create type stock_move as enum ('OPENING', 'RESTOCK', 'SALE', 'WRITE_OFF', 'ISSUE', 'RETURN', 'COUNT_ADJUST');

create table menu_items (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references events(id),
  name        text not null,
  kind        menu_kind not null,
  price       bigint not null check (price > 0),
  point       text not null,                    -- collection point, e.g. Food court A
  photo_path  text,                             -- Cloud Storage object (moderated upload)
  art         jsonb,                            -- placeholder picture until a photo is uploaded
  note        text,
  adults_only boolean not null default false,
  paused      boolean not null default false,
  sort        int not null default 0,
  created_at  timestamptz not null default now()
);
create index menu_items_event on menu_items (event_id);

-- Every stock change is a movement; stock left is derived (never edited by hand).
create table stock_movements (
  id            bigint generated always as identity primary key,
  item_id       uuid not null references menu_items(id),
  kind          stock_move not null,
  qty           int not null check (qty <> 0),     -- + adds to stock, − removes
  attendant_id  uuid references users(id),         -- ISSUE / RETURN / SALE by an attendant
  reason        text,                              -- required for WRITE_OFF
  food_order_id uuid,
  by_user       uuid references users(id),
  at            timestamptz not null default now(),
  check (kind <> 'WRITE_OFF' or (qty < 0 and reason is not null)),
  check (kind not in ('OPENING', 'RESTOCK', 'RETURN') or qty > 0),
  check (kind not in ('SALE', 'ISSUE') or qty < 0)
);
create index stock_movements_item on stock_movements (item_id);
create trigger stock_movements_append_only before update or delete on stock_movements for each row execute function app.forbid_change();

-- Stock left at the stand = everything except ISSUE/RETURN (stock with attendants is still stock).
create view item_stock with (security_invoker = true) as
select i.id as item_id, i.event_id, i.name,
  coalesce(sum(m.qty) filter (where m.kind = 'OPENING'), 0) as opening,
  coalesce(sum(m.qty) filter (where m.kind = 'RESTOCK'), 0) as restocked,
  -coalesce(sum(m.qty) filter (where m.kind = 'SALE'), 0) as sold,
  -coalesce(sum(m.qty) filter (where m.kind = 'WRITE_OFF'), 0) as written_off,
  coalesce(sum(m.qty) filter (where m.kind in ('OPENING', 'RESTOCK', 'SALE', 'WRITE_OFF', 'COUNT_ADJUST')), 0) as should_be_left
from menu_items i left join stock_movements m on m.item_id = i.id
group by i.id;

-- No selling below zero.
create or replace function app.check_stock() returns trigger language plpgsql as $$
begin
  if new.kind in ('SALE', 'WRITE_OFF') then
    perform pg_advisory_xact_lock(hashtext(new.item_id::text));
    if (select coalesce(sum(qty), 0) from stock_movements where item_id = new.item_id
          and kind in ('OPENING', 'RESTOCK', 'SALE', 'WRITE_OFF', 'COUNT_ADJUST')) + new.qty < 0 then
      raise exception 'Not enough stock';
    end if;
  end if;
  return new;
end $$;
create trigger stock_movements_check before insert on stock_movements for each row execute function app.check_stock();

-- End-of-event physical counts entered by the organiser.
create table stock_counts (
  item_id    uuid not null references menu_items(id),
  counted    int not null check (counted >= 0),
  by_user    uuid not null references users(id),
  at         timestamptz not null default now(),
  primary key (item_id, at)
);

create table food_orders (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references events(id),
  number        text not null,                     -- A-0229 (per event)
  buyer_user_id uuid references users(id),
  buyer_label   text,                              -- "Walk-up" for quick sales
  method        pay_method not null,               -- how the buyer said they'd pay
  status        food_order_status not null default 'WAITING',
  point         text not null,
  table_label   text,
  quick         boolean not null default false,
  attendant_id  uuid references users(id),
  paid_method   pay_method,                        -- how it was actually paid
  pay_ref       text,                              -- card receipt or mobile money reference
  paid_at       timestamptz,
  created_at    timestamptz not null default now(),
  expires_at    timestamptz,                       -- unpaid orders cancel after 30 minutes
  unique (event_id, number),
  check (paid_method is null or paid_method = 'CASH' or pay_ref is not null),
  check ((paid_method is null) = (paid_at is null))
);
create index food_orders_event_status on food_orders (event_id, status);
create trigger food_orders_audit after update on food_orders for each row execute function app.audit_row();
alter table stock_movements add constraint stock_movements_order_fk foreign key (food_order_id) references food_orders(id);

-- At most 3 unpaid orders open per buyer per event.
create or replace function app.check_open_orders() returns trigger language plpgsql as $$
begin
  if new.buyer_user_id is not null and (select count(*) from food_orders where event_id = new.event_id
      and buyer_user_id = new.buyer_user_id and paid_at is null and status in ('WAITING', 'PREPARING', 'READY')) >= 3 then
    raise exception 'Collect your open orders first';
  end if;
  return new;
end $$;
create trigger food_orders_open_limit before insert on food_orders for each row execute function app.check_open_orders();

create table food_order_lines (
  order_id  uuid not null references food_orders(id),
  item_id   uuid not null references menu_items(id),
  qty       int not null check (qty > 0),
  price     bigint not null check (price > 0),     -- price at the time of ordering
  given     int not null default 0,                -- handed over so far (part collection)
  primary key (order_id, item_id),
  check (given between 0 and qty)
);

-- Cash handed in by attendants at the end of a shift.
create table attendant_handovers (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references events(id),
  attendant_id  uuid not null references users(id),
  expected_cash bigint not null check (expected_cash >= 0),
  handed_in     bigint not null check (handed_in >= 0),
  received_by   uuid not null references users(id),
  at            timestamptz not null default now(),
  note          text,
  check (received_by <> attendant_id)
);
create trigger attendant_handovers_append_only before update or delete on attendant_handovers for each row execute function app.forbid_change();

-- What each attendant must hand in, by method (from paid orders and extras sold at stations).
create view attendant_takings with (security_invoker = true) as
select o.event_id, o.attendant_id,
  count(*) as orders,
  coalesce(sum(t.total) filter (where o.paid_method = 'CASH'), 0) as cash,
  coalesce(sum(t.total) filter (where o.paid_method = 'CARD'), 0) as card,
  count(*) filter (where o.paid_method = 'CARD') as card_receipts,
  coalesce(sum(t.total) filter (where o.paid_method = 'MOBILE_MONEY'), 0) as mobile_money,
  count(*) filter (where o.paid_method = 'MOBILE_MONEY') as mobile_refs
from food_orders o
join lateral (select sum(qty * price) as total from food_order_lines l where l.order_id = o.id) t on true
where o.paid_at is not null and o.attendant_id is not null
group by o.event_id, o.attendant_id;
