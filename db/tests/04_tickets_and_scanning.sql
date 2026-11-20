-- Tickets: no overselling, one admission (re-entry only when allowed), extras once each.
do $$
declare v_ev uuid := (select id from events where slug = 'lusaka-summer-jam-2026');
        v_vip uuid := (select id from ticket_types where event_id = v_ev and name = 'VIP');
        v_std uuid := (select id from ticket_types where event_id = v_ev and name = 'Standard');
        v_dinner uuid := (select id from allowances where event_id = v_ev and key = 'dinner');
        t1 uuid; t2 uuid; v_small uuid;
begin
  insert into tickets (number, event_id, ticket_type_id, holder_name) values ('TKT-T1', v_ev, v_vip, 'Grace') returning id into t1;
  insert into tickets (number, event_id, ticket_type_id, holder_name) values ('TKT-T2', v_ev, v_std, 'Natasha') returning id into t2;

  -- extras need entry first (dinner is "after entry")
  perform pg_temp.expect_error(format('insert into allowance_uses (ticket_id, allowance_id) values (%L, %L)', t1, v_dinner), 'not entered');
  insert into gate_scans (event_id, ticket_id, result, scanned_at) values (v_ev, t1, 'ADMITTED', now());
  perform pg_temp.expect_error(format('insert into gate_scans (event_id, ticket_id, result, scanned_at) values (%L, %L, ''ADMITTED'', now())', v_ev, t1), 'already admitted');
  -- re-entry is on for Summer Jam: out, then in again
  insert into gate_scans (event_id, ticket_id, direction, result, scanned_at) values (v_ev, t1, 'OUT', 'ADMITTED', now() + interval '1 minute');
  insert into gate_scans (event_id, ticket_id, result, scanned_at) values (v_ev, t1, 'ADMITTED', now() + interval '2 minutes');

  insert into allowance_uses (ticket_id, allowance_id) values (t1, v_dinner);
  perform pg_temp.expect_error(format('insert into allowance_uses (ticket_id, allowance_id) values (%L, %L)', t1, v_dinner), 'already collected');
  perform pg_temp.expect_error(format('insert into allowance_uses (ticket_id, allowance_id) values (%L, %L)', t2, v_dinner), 'does not include');

  -- overselling
  insert into ticket_types (event_id, name, price, capacity) values (v_ev, 'Test tiny', 1000, 1) returning id into v_small;
  insert into tickets (number, event_id, ticket_type_id) values ('TKT-T3', v_ev, v_small);
  perform pg_temp.expect_error(format('insert into tickets (number, event_id, ticket_type_id) values (''TKT-T4'', %L, %L)', v_ev, v_small), 'sold out');
end $$;

-- Without re-entry, a second admission is refused even after an OUT scan.
do $$
declare v_ev uuid := (select id from events where slug = 'zambia-trade-and-farm-expo');
        v_tt uuid := (select id from ticket_types where event_id = v_ev order by sort limit 1); t uuid;
begin
  insert into tickets (number, event_id, ticket_type_id) values ('TKT-T5', v_ev, v_tt) returning id into t;
  insert into gate_scans (event_id, ticket_id, result, scanned_at) values (v_ev, t, 'ADMITTED', now());
  insert into gate_scans (event_id, ticket_id, direction, result, scanned_at) values (v_ev, t, 'OUT', 'ADMITTED', now() + interval '1 minute');
  perform pg_temp.expect_error(format('insert into gate_scans (event_id, ticket_id, result, scanned_at) values (%L, %L, ''ADMITTED'', now() + interval ''2 minutes'')', v_ev, t), 're-entry is not allowed');
end $$;
