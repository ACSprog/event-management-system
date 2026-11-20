-- Contributions: cash out only cleared money; refunds only by EMS finance for a system failure.
do $$
declare v_org uuid := (select id from organisations where slug = 'grace-chapel');
        v_page uuid := (select id from giving_pages where slug = 'grace-chapel');
        v_fund uuid := (select id from giving_funds where page_id = v_page and key = 'tithe');
        pastor uuid := (select id from users where name = 'Pastor Daniel Phiri');
        c uuid;
begin
  insert into contributions (receipt_no, page_id, fund_id, org_id, phone, amount, fee, status, cleared_at)
  values ('GV-T1', v_page, v_fund, v_org, '+260977000001', 300000, 7500, 'CLEARED', now()) returning id into c;   -- K3,000, fee K75
  perform pg_temp.ok(app.contribution_available(v_org) = 292500, 'available = cleared minus fees');
  insert into contribution_cashouts (ref, org_id, amount, route, requested_by) values ('CO-T1', v_org, 200000, 'AUTOMATIC', pastor);
  perform pg_temp.expect_error(format('insert into contribution_cashouts (ref, org_id, amount, route, requested_by) values (''CO-T2'', %L, 100000, ''FINANCE'', %L)', v_org, pastor), 'cleared contribution money');
  perform pg_temp.expect_error(format('insert into contribution_refunds (contribution_id, failure_kind, evidence, by_user, idempotency_key) values (%L, ''DUPLICATE_CHARGE'', ''x'', %L, ''r1'')', c, pastor), 'only ems finance');
end $$;
