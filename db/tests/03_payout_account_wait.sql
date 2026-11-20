-- A newly verified payout account can't be paid for 48 hours.
do $$
declare v_org uuid := (select id from organisations where slug = 'grace-chapel'); v_acct uuid;
begin
  insert into payout_accounts (org_id, method, number_masked, holder_name) values (v_org, 'AIRTEL', '****1190', 'Grace Chapel') returning id into v_acct;
  update payout_accounts set status = 'VERIFIED' where id = v_acct;
  perform pg_temp.ok((select usable_from from payout_accounts where id = v_acct) > now() + interval '47 hours', 'usable_from is 48 h after verification');
  perform pg_temp.expect_error(format($q$insert into contribution_cashouts (ref, org_id, amount, route, requested_by) values ('CO-T', %L, 999999999, 'FINANCE', (select id from users where name = 'Pastor Daniel Phiri'))$q$, v_org), 'cleared contribution money');
end $$;
