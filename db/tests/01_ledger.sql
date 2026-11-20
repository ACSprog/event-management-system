-- Ledger: entries must balance, can't be changed, and can't be posted twice.
do $$
declare a uuid := app.ledger_account(1100, p_provider => 'MTN');
        b uuid := app.ledger_account(2100, (select id from organisations where slug = 'zed-live'), (select id from events where slug = 'lusaka-summer-jam-2026'));
        e1 uuid; e2 uuid;
begin
  -- balanced entry posts
  e1 := app.post_entry('TICKET_PAID', 'test', 't1', 'test-key-1', jsonb_build_array(jsonb_build_object('account', a, 'amount', 20000), jsonb_build_object('account', b, 'amount', -20000)));
  set constraints all immediate;
  set constraints all deferred;
  perform pg_temp.ok((select balance from account_balances where account_id = b) = -20000, 'organiser funds held show K200 credit');
  -- posting the same thing again returns the same entry (idempotent)
  e2 := app.post_entry('TICKET_PAID', 'test', 't1', 'test-key-1', '[]');
  perform pg_temp.ok(e1 = e2, 'second post with the same key is a no-op');
  -- unbalanced entry is rejected at commit
  perform pg_temp.expect_error(format($q$select app.post_entry('X', 'test', 't2', 'k2', '[{"account": "%s", "amount": 100}]')$q$, a), 'does not balance');
  -- journal is append-only
  perform pg_temp.expect_error(format('update journal_lines set amount = 1 where entry_id = %L', e1), 'append-only');
  perform pg_temp.expect_error(format('delete from journal_entries where id = %L', e1), 'append-only');
end $$;

-- The API role cannot write ledger lines directly.
set local role ems_api;
select app.set_context((select id from users where name = 'Natasha Zulu'), null, 'FINANCE_MANAGER');
select pg_temp.expect_error('insert into journal_entries (kind, source_type, source_id, idempotency_key) values (''X'',''x'',''x'',''x'')', 'permission denied');
reset role;
