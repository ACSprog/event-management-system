-- Closed cases are read-only; audit log is append-only; terms freeze at publish.
do $$
declare c uuid; v_ev uuid;
begin
  insert into cases (type, subject, org_id, attendee_id, closes_at, status)
  values ('QUESTION', 'Parking?', (select id from organisations where slug = 'zed-live'), (select id from users where name = 'Chanda Mulenga'), now() - interval '1 day', 'CLOSED') returning id into c;
  perform pg_temp.ok((select number from cases where id = c) ~ '^CS-[0-9]{4}-[0-9]{4}$', 'case number format CS-YYMM-NNNN');
  perform pg_temp.expect_error(format('insert into case_messages (case_id, sender, body) values (%L, ''ATTENDEE'', ''hello'')', c), 'read-only');

  update organisations set about = 'Changed for the audit test' where slug = 'zed-live';
  perform pg_temp.ok(exists (select 1 from audit_log where entity = 'organisations' and after ->> 'about' = 'Changed for the audit test'), 'change was audited');
  perform pg_temp.expect_error('delete from audit_log', 'append-only');

  select id into v_ev from events where slug = 'copperbelt-nights-kitwe';   -- a draft
  update event_commercial_terms set fee_bp = 350 where event_id = v_ev;    -- editable while draft
  update events set published_at = now(), status = 'ON_SALE' where id = v_ev;
  perform pg_temp.ok((select frozen_at from event_commercial_terms where event_id = v_ev) is not null, 'terms frozen at publish');
  perform pg_temp.expect_error(format('update event_commercial_terms set fee_bp = 100 where event_id = %L', v_ev), 'frozen');
end $$;
