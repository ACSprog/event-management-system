-- Food and merchandise: no selling below zero; can't give more than ordered; cash hand-in by someone else.
do $$
declare v_ev uuid := (select id from events where slug = 'lusaka-summer-jam-2026');
        v_item uuid := (select id from menu_items where event_id = v_ev and name = 'Nshima with T-bone');
        o uuid; j uuid := (select id from users where name = 'Joseph Banda');
begin
  perform pg_temp.ok((select should_be_left from item_stock where item_id = v_item) = 0, 'nshima is sold out in the sample');
  perform pg_temp.expect_error(format('insert into stock_movements (item_id, kind, qty) values (%L, ''SALE'', -1)', v_item), 'not enough stock');
  perform pg_temp.expect_error(format('insert into stock_movements (item_id, kind, qty) values (%L, ''WRITE_OFF'', -1)', (select id from menu_items where event_id = v_ev and name = 'Beef burger')), 'check constraint');  -- write-off needs a reason
  insert into food_orders (event_id, number, method, point) values (v_ev, 'A-T1', 'CASH', 'Food court B') returning id into o;
  insert into food_order_lines values (o, v_item, 2, 15000, 1);
  perform pg_temp.expect_error(format('update food_order_lines set given = 3 where order_id = %L', o), 'check constraint');
  perform pg_temp.expect_error(format('update food_orders set paid_method = ''CARD'', paid_at = now() where id = %L', o), 'check constraint');
  perform pg_temp.expect_error(format('insert into attendant_handovers (event_id, attendant_id, expected_cash, handed_in, received_by) values (%L, %L, 100, 100, %L)', v_ev, j, j), 'check constraint');
end $$;
