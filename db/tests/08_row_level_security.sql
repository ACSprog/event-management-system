-- Row-level security as the API sees it. IDs are looked up first (as the owner): the real
-- API gets the signed-in user from the session, not by searching users.
select set_config('t.mwila', (select id from users where name = 'Mwila Banda')::text, true),
       set_config('t.joseph', (select id from users where name = 'Joseph Banda')::text, true),
       set_config('t.chanda', (select id from users where name = 'Chanda Mulenga')::text, true),
       set_config('t.zed', (select id from organisations where slug = 'zed-live')::text, true),
       set_config('t.grace', (select id from organisations where slug = 'grace-chapel')::text, true),
       set_config('t.jam', (select id from events where slug = 'lusaka-summer-jam-2026')::text, true),
       set_config('t.std', (select id from ticket_types where name = 'Standard' and event_id = (select id from events where slug = 'lusaka-summer-jam-2026'))::text, true);
insert into tickets (number, event_id, ticket_type_id, holder_user_id) values
  ('TKT-R1', current_setting('t.jam')::uuid, current_setting('t.std')::uuid, current_setting('t.chanda')::uuid),
  ('TKT-R2', current_setting('t.jam')::uuid, current_setting('t.std')::uuid, (select id from users where name = 'Natasha Zulu'));

set local role ems_api;

-- Anonymous visitor: public events yes, drafts no, orders and ledger no.
select app.set_context(null);
select pg_temp.ok((select count(*) from events where slug = 'lusaka-summer-jam-2026') = 1, 'public event visible');
select pg_temp.ok((select count(*) from events where status = 'DRAFT') = 0, 'drafts hidden from the public');
select pg_temp.ok((select count(*) from orders) = 0, 'anonymous sees no orders');
select pg_temp.ok((select count(*) from ledger_accounts) = 0, 'anonymous sees no ledger');
select pg_temp.ok((select count(*) from tickets) = 0, 'anonymous sees no tickets');

-- Zed Live admin sees Zed Live drafts but not other organisers' drafts.
select app.set_context(current_setting('t.mwila')::uuid, current_setting('t.zed')::uuid);
select pg_temp.ok((select count(*) from events where status = 'DRAFT' and org_id = current_setting('t.zed')::uuid) > 0, 'own drafts visible');
select pg_temp.ok((select count(*) from events where status = 'DRAFT' and org_id <> current_setting('t.zed')::uuid) = 0, 'other organisers'' drafts hidden');
select pg_temp.ok((select count(*) from tickets) = 2, 'organiser sees tickets for their own event');
-- Organisers can't create settlements or change finance settings.
select pg_temp.expect_error(format($q$insert into settlements (ref, event_id, org_id) values ('ST-X', %L, %L)$q$, current_setting('t.jam'), current_setting('t.zed')), 'row-level security');
select pg_temp.expect_error(format($q$insert into finance_settings (version, proposed_by) values (99, %L)$q$, current_setting('t.mwila')), 'row-level security');

-- Claiming to work in another organisation does not help: not a member there.
select app.set_context(current_setting('t.mwila')::uuid, current_setting('t.grace')::uuid);
select pg_temp.ok((select count(*) from org_members) = 0, 'no access to another organisation''s team');
select pg_temp.ok((select count(*) from events where status = 'DRAFT') = 0, 'no access to another organisation''s drafts');

-- Gate staff can't change team roles.
select app.set_context(current_setting('t.joseph')::uuid, current_setting('t.zed')::uuid);
select pg_temp.expect_error($q$update org_roles set permissions = permissions || '{team.manage}' where key = 'gate'$q$, 'row-level security');

-- An attendee sees only their own tickets.
select app.set_context(current_setting('t.chanda')::uuid);
select pg_temp.ok((select count(*) from tickets) = 1, 'attendee sees only her own ticket');
select pg_temp.ok((select number from tickets) = 'TKT-R1', 'and it is hers');
reset role;
