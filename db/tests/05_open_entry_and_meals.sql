-- Open entry: check-in only during the event, one per phone, meals up to the people checked in.
do $$
declare v_ev uuid := (select id from events where slug = 'funeral-joseph-mwansa'); c uuid;
        v_start timestamptz := (select starts_at from events where slug = 'funeral-joseph-mwansa');
begin
  perform pg_temp.expect_error(format('insert into open_checkins (event_id, device_hash, people, checked_in_at) values (%L, ''d1'', 2, %L::timestamptz - interval ''1 day'')', v_ev, v_start), 'only works during the event');
  insert into open_checkins (event_id, device_hash, people, checked_in_at) values (v_ev, 'd1', 3, v_start + interval '1 hour') returning id into c;
  perform pg_temp.expect_error(format('insert into open_checkins (event_id, device_hash, people, checked_in_at) values (%L, ''d1'', 1, %L::timestamptz + interval ''2 hours'')', v_ev, v_start), 'duplicate key');
  insert into meal_pass_uses (checkin_id, qty) values (c, 2);
  insert into meal_pass_uses (checkin_id, qty) values (c, 1);
  perform pg_temp.expect_error(format('insert into meal_pass_uses (checkin_id, qty) values (%L, 1)', c), 'all meals');
  -- tickets events can't use check-in codes
  perform pg_temp.expect_error(format('insert into open_checkins (event_id, device_hash, people) values ((select id from events where slug = ''lusaka-summer-jam-2026''), ''d9'', 1)'), 'open-entry');
end $$;
