-- Settlements and payouts: the no-early-payout rule, approvals and payout accounts.
do $$
declare v_org uuid := (select id from organisations where slug = 'zed-live');
        v_ev uuid; v_st uuid; v_acct uuid;
        nat uuid := (select id from users where name = 'Natasha Zulu');        -- finance manager
        bw uuid := (select id from users where name = 'Bwalya Phiri');         -- finance officer
        mw uuid := (select id from users where name = 'Mwila Banda');          -- organiser admin
begin
  insert into events (org_id, slug, title, category, status, venue_id, starts_at, ends_at)
  values (v_org, 'test-past-event', 'Past event', 'MUSIC', 'ENDED', (select id from venues limit 1), now() - interval '3 days', now() - interval '2 days') returning id into v_ev;
  insert into settlements (ref, event_id, org_id, payable) values ('ST-TEST-1', v_ev, v_org, 6000000) returning id into v_st;   -- K60,000
  insert into payout_accounts (org_id, method, number_masked, holder_name) values (v_org, 'MTN', '****4821', 'Zed Live') returning id into v_acct;

  -- can't skip steps
  perform pg_temp.expect_error(format('update settlements set status = ''APPROVED'' where id = %L', v_st), 'cannot move');
  -- can't start reconciliation before the event is completed
  perform pg_temp.expect_error(format('update settlements set status = ''RECONCILIATION_PENDING'' where id = %L', v_st), 'not been completed');
  insert into event_completions (event_id, outcome, by_system) values (v_ev, 'COMPLETED', true);
  update settlements set status = 'RECONCILIATION_PENDING' where id = v_st;
  update settlements set status = 'ORGANISER_REVIEW' where id = v_st;
  update settlements set status = 'UNDER_FINANCE_REVIEW' where id = v_st;
  -- no payout before approval
  update payout_accounts set status = 'VERIFIED' where id = v_acct;
  update payout_accounts set usable_from = now() - interval '1 minute' where id = v_acct;
  update organisations set verified_at = now() where id = v_org and verified_at is null;
  perform pg_temp.expect_error(format('insert into payouts (settlement_id, payout_account_id, amount, idempotency_key, initiated_by) values (%L, %L, 6000000, ''p1'', %L)', v_st, v_acct, nat), 'not approved');

  update settlements set status = 'AWAITING_APPROVAL' where id = v_st;
  perform pg_temp.ok((select required_approvals from settlements where id = v_st) = 2, 'K60,000 needs two approvals');
  -- organiser can't approve; a second approval needs a different finance manager
  perform pg_temp.expect_error(format('insert into settlement_approvals values (%L, 1, %L)', v_st, mw), 'only active platform finance');
  insert into settlement_approvals values (v_st, 1, nat);
  perform pg_temp.expect_error(format('update settlements set status = ''APPROVED'' where id = %L', v_st), 'needs 2 approval');
  update settlements set status = 'AWAITING_SECOND_APPROVAL' where id = v_st;
  perform pg_temp.expect_error(format('insert into settlement_approvals values (%L, 2, %L)', v_st, nat), 'different person');
  perform pg_temp.expect_error(format('insert into settlement_approvals values (%L, 2, %L)', v_st, bw), 'finance manager');
end $$;
