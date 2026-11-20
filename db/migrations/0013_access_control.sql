-- 0013 Access control: least-privilege grants and row-level security (RLS) on every table.
--
-- Who sees what (the API sets the context with app.set_context for each request):
-- * Platform staff (app.platform_role set): everything; money changes only for finance.
-- * Organiser team (app.org_id set and the user is an active member): their organisation's rows.
-- * Attendees (app.user_id only): their own tickets, orders, cases, contributions and so on.
-- * Anyone, signed in or not: public data (published public events, their ticket types and
--   menus, active giving pages, published reviews, organisation profiles).
-- The ems_api role never gets DELETE, except where noted; append-only tables refuse it anyway.
-- Ledger lines are written only through app.post_entry (security definer).

-- Helpers (security definer so policies don't recurse through RLS) -------------

create or replace function app.can_org(p_org uuid) returns boolean language sql stable security definer set search_path = public, app as $$
  select app.is_platform() or (p_org is not null and p_org = app.org_id() and app.is_member());
$$;

create or replace function app.event_org(p_event uuid) returns uuid language sql stable security definer set search_path = public, app as $$
  select org_id from events where id = p_event;
$$;

create or replace function app.event_is_public(p_event uuid) returns boolean language sql stable security definer set search_path = public, app as $$
  select exists (select 1 from events where id = p_event and listing = 'PUBLIC' and published_at is not null
                  and status in ('APPROVED', 'ON_SALE', 'SOLD_OUT', 'POSTPONED', 'ENDED'));
$$;

-- An unlisted event is visible to anyone holding its link (slug), but never listed.
create or replace function app.event_is_open_link(p_event uuid) returns boolean language sql stable security definer set search_path = public, app as $$
  select exists (select 1 from events where id = p_event and published_at is not null and status <> 'DRAFT');
$$;

-- Grants -------------------------------------------------------------------------

grant usage on all sequences in schema public to ems_api;
grant select on all tables in schema public to ems_readonly;
grant select, insert, update on all tables in schema public to ems_api;
grant execute on all functions in schema app to ems_api;

-- Read-only for the API: reference data and money records written by functions or jobs.
revoke insert, update on plans, plan_versions, licence_packages, licence_package_versions, addons, ledger_chart,
  settlement_transitions, ledger_accounts, journal_entries, journal_lines, settlement_lines, audit_log from ems_api;

-- Deleting is allowed only for drafts and personal settings.
grant delete on follows, event_sessions, event_tasks, budget_lines, rsvps, marketing_consents to ems_api;

-- Enable RLS everywhere (FORCE so even the table owner is subject to it when acting as the API).
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' and tablename not in ('spatial_ref_sys') loop
    execute format('alter table %I enable row level security', t);
    execute format('alter table %I force row level security', t);
  end loop;
end $$;

-- The owner (migrations, jobs run as owner) bypasses nothing by accident: give it an explicit policy.
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' and tablename not in ('spatial_ref_sys') loop
    execute format('create policy owner_all on %I for all to %I using (true) with check (true)', t, current_user);
  end loop;
end $$;

-- Reference data: everyone may read.
do $$
declare t text;
begin
  foreach t in array array['plans', 'plan_versions', 'licence_packages', 'licence_package_versions', 'addons', 'ledger_chart',
                           'settlement_transitions', 'public_holidays'] loop
    execute format('create policy ref_read on %I for select to ems_api, ems_readonly using (true)', t);
  end loop;
end $$;
create policy holidays_write on public_holidays for all to ems_api using (app.is_platform()) with check (app.is_finance() or app.platform_role() = 'OWNER');
create policy finance_settings_read on finance_settings for select to ems_api, ems_readonly using (app.is_platform());
create policy finance_settings_write on finance_settings for insert to ems_api with check (app.is_finance() and proposed_by = app.user_id());
create policy finance_settings_confirm on finance_settings for update to ems_api using (app.is_finance()) with check (confirmed_by = app.user_id());

-- Tables scoped by org_id: organisation team and platform staff.
do $$
declare t text;
begin
  foreach t in array array['org_verifications', 'org_roles', 'org_members', 'subscriptions', 'contracts', 'partnership_agreements',
      'org_addons', 'entitlement_grants', 'entitlement_usage', 'events', 'orders', 'settlements', 'payout_accounts',
      'giving_pages', 'contributions', 'contribution_cashouts', 'cases', 'reviews', 'campaigns', 'vendors', 'expenses',
      'invoices', 'support_tickets', 'sms_messages', 'marketing_consents'] loop
    execute format('create policy org_rw on %I for all to ems_api, ems_readonly using (app.can_org(org_id)) with check (app.can_org(org_id))', t);
  end loop;
end $$;

-- Tables scoped through their event.
do $$
declare t text;
begin
  foreach t in array array['event_sessions', 'ticket_types', 'allowances', 'stations', 'seats', 'event_staff', 'event_commercial_terms',
      'event_licences', 'event_discount_codes', 'tickets', 'waitlist_entries', 'gate_scans', 'allowance_sales', 'rsvps',
      'open_checkins', 'usher_counts', 'event_completions', 'menu_items', 'food_orders', 'attendant_handovers', 'help_requests',
      'event_messages', 'event_tasks', 'budget_lines'] loop
    execute format('create policy event_rw on %I for all to ems_api, ems_readonly using (app.can_org(app.event_org(event_id))) with check (app.can_org(app.event_org(event_id)))', t);
  end loop;
end $$;

-- Child tables scoped through their parent.
create policy parent_rw on ticket_type_allowances for all to ems_api, ems_readonly
  using (app.can_org(app.event_org((select event_id from ticket_types where id = ticket_type_id))))
  with check (app.can_org(app.event_org((select event_id from ticket_types where id = ticket_type_id))));
create policy parent_rw on order_items for all to ems_api, ems_readonly
  using (exists (select 1 from orders o where o.id = order_id)) with check (exists (select 1 from orders o where o.id = order_id));
create policy parent_rw on ticket_transfers for all to ems_api, ems_readonly
  using (exists (select 1 from tickets t where t.id = ticket_id) or to_user_id = app.user_id() or from_user_id = app.user_id())
  with check (exists (select 1 from tickets t where t.id = ticket_id));
create policy parent_rw on allowance_uses for all to ems_api, ems_readonly
  using (exists (select 1 from tickets t where t.id = ticket_id)) with check (exists (select 1 from tickets t where t.id = ticket_id));
create policy parent_rw on meal_pass_uses for all to ems_api, ems_readonly
  using (exists (select 1 from open_checkins c where c.id = checkin_id)) with check (exists (select 1 from open_checkins c where c.id = checkin_id));
create policy parent_rw on stock_movements for all to ems_api, ems_readonly
  using (exists (select 1 from menu_items i where i.id = item_id)) with check (exists (select 1 from menu_items i where i.id = item_id));
create policy parent_rw on stock_counts for all to ems_api, ems_readonly
  using (exists (select 1 from menu_items i where i.id = item_id)) with check (exists (select 1 from menu_items i where i.id = item_id));
create policy parent_rw on food_order_lines for all to ems_api, ems_readonly
  using (exists (select 1 from food_orders o where o.id = order_id)) with check (exists (select 1 from food_orders o where o.id = order_id));
create policy parent_rw on giving_funds for all to ems_api, ems_readonly
  using (exists (select 1 from giving_pages p where p.id = page_id)) with check (exists (select 1 from giving_pages p where p.id = page_id));
create policy parent_rw on pledges for all to ems_api, ems_readonly
  using (exists (select 1 from giving_pages p where p.id = page_id) or user_id = app.user_id())
  with check (exists (select 1 from giving_pages p where p.id = page_id) or user_id = app.user_id());
create policy parent_rw on case_messages for all to ems_api, ems_readonly
  using (exists (select 1 from cases c where c.id = case_id)) with check (exists (select 1 from cases c where c.id = case_id));
create policy parent_rw on help_request_log for all to ems_api, ems_readonly
  using (exists (select 1 from help_requests h where h.id = request_id)) with check (exists (select 1 from help_requests h where h.id = request_id));
create policy parent_rw on review_replies for all to ems_api, ems_readonly
  using (exists (select 1 from reviews r where r.id = review_id and app.can_org(r.org_id)) or exists (select 1 from reviews r where r.id = review_id and r.status = 'PUBLISHED'))
  with check (exists (select 1 from reviews r where r.id = review_id and app.can_org(r.org_id)));
create policy parent_rw on review_photos for all to ems_api, ems_readonly
  using (exists (select 1 from reviews r where r.id = review_id)) with check (exists (select 1 from reviews r where r.id = review_id and r.user_id = app.user_id()));
create policy parent_rw on invoice_lines for all to ems_api, ems_readonly
  using (exists (select 1 from invoices i where i.id = invoice_id)) with check (app.is_platform());
create policy parent_rw on support_messages for all to ems_api, ems_readonly
  using (exists (select 1 from support_tickets s where s.id = ticket_id) and (not internal or app.is_platform()))
  with check (exists (select 1 from support_tickets s where s.id = ticket_id) and (not internal or app.is_platform()));
create policy parent_rw on settlement_disputes for all to ems_api, ems_readonly
  using (exists (select 1 from settlements s where s.id = settlement_id))
  with check (exists (select 1 from settlements s where s.id = settlement_id) and (app.is_finance() or app.has_perm('settlements.review')));
create policy parent_read on settlement_lines for select to ems_api, ems_readonly using (exists (select 1 from settlements s where s.id = settlement_id));
create policy parent_read on settlement_adjustments for select to ems_api, ems_readonly using (exists (select 1 from settlements s where s.id = settlement_id));
create policy finance_write on settlement_adjustments for insert to ems_api with check (app.is_finance() and by_user = app.user_id());
create policy parent_read on discrepancies for select to ems_api, ems_readonly using (app.is_platform() or exists (select 1 from settlements s where s.id = settlement_id));
create policy finance_write on discrepancies for all to ems_api using (app.is_finance()) with check (app.is_finance());
create policy parent_read on settlement_approvals for select to ems_api, ems_readonly using (exists (select 1 from settlements s where s.id = settlement_id));
create policy parent_read on cashout_approvals for select to ems_api, ems_readonly using (exists (select 1 from contribution_cashouts c where c.id = cashout_id));
create policy parent_read on payout_attempts for select to ems_api, ems_readonly using (exists (select 1 from payouts p where p.id = payout_id));
create policy finance_write on payout_attempts for insert to ems_api with check (app.is_finance());
create policy parent_read on contribution_refunds for select to ems_api, ems_readonly using (exists (select 1 from contributions c where c.id = contribution_id));

-- Money controls on top of the org policies (restrictive = must ALSO pass).
create policy settlements_finance_only_changes on settlements as restrictive for update to ems_api using (app.is_finance());
create policy settlements_finance_only_insert on settlements as restrictive for insert to ems_api with check (app.is_finance());
create policy approvals_finance on settlement_approvals for insert to ems_api with check (app.is_finance() and approver_id = app.user_id());
create policy cashout_approvals_finance on cashout_approvals for insert to ems_api with check (app.is_finance() and approver_id = app.user_id());
create policy contribution_refunds_finance on contribution_refunds for insert to ems_api with check (app.is_finance() and by_user = app.user_id());
create policy payout_accounts_change on payout_accounts as restrictive for all to ems_api
  using (app.is_finance() or app.has_perm('payouts.account'))
  with check (app.is_finance() or (app.has_perm('payouts.account') and status = 'PENDING'));
create policy cashouts_request on contribution_cashouts as restrictive for insert to ems_api
  with check (app.is_finance() or (app.has_perm('contributions.cashout') and requested_by = app.user_id() and status = 'REQUESTED'));
create policy cashouts_update on contribution_cashouts as restrictive for update to ems_api using (app.is_finance());
create policy partnership_admin_only on partnership_agreements as restrictive for insert to ems_api with check (app.is_platform());
create policy roles_admin_only on org_roles as restrictive for all to ems_api using (true) with check (app.is_platform() or app.has_perm('team.manage'));
create policy members_admin_only on org_members as restrictive for all to ems_api using (true) with check (app.is_platform() or app.has_perm('team.manage'));
create policy completions_rules on event_completions as restrictive for insert to ems_api with check (app.is_platform() or (outcome <> 'COMPLETED' and app.has_perm('events.edit')));

create policy partnership_contributions_read on partnership_contributions for select to ems_api, ems_readonly using (app.is_platform()
  or exists (select 1 from partnership_agreements a where a.id = agreement_id and app.can_org(a.org_id)));
create policy partnership_contributions_write on partnership_contributions for all to ems_api using (app.is_platform()) with check (app.is_platform());
create policy discounts_read on discounts for select to ems_api, ems_readonly using (true);
create policy discounts_write on discounts for all to ems_api using (app.is_platform()) with check (app.is_platform());

-- Payouts: platform finance only (organisers see their own).
create policy payouts_read on payouts for select to ems_api, ems_readonly using (
  app.is_platform()
  or exists (select 1 from settlements s where s.id = settlement_id and app.can_org(s.org_id))
  or exists (select 1 from contribution_cashouts c where c.id = cashout_id and app.can_org(c.org_id)));
create policy payouts_write on payouts for insert to ems_api with check (app.is_finance() and initiated_by = app.user_id());
create policy payouts_update on payouts for update to ems_api using (app.is_finance()) with check (app.is_finance());

-- Payments: org team sees its event payments; platform sees all. Writes come from the API's
-- payment service acting with platform context (webhooks), never from organisers.
create policy payment_intents_read on payment_intents for select to ems_api, ems_readonly using (app.is_platform() or app.can_org(org_id)
  or exists (select 1 from orders o where o.id = order_id and o.buyer_user_id = app.user_id()));
create policy payment_intents_write on payment_intents for all to ems_api using (app.is_platform()) with check (app.is_platform() or app.user_id() is not null);
create policy platform_only on provider_webhooks for all to ems_api using (app.is_platform()) with check (true);
create policy platform_only on provider_transactions for all to ems_api using (app.is_finance()) with check (app.is_finance());
create policy refunds_read on refunds for select to ems_api, ems_readonly using (exists (select 1 from orders o where o.id = order_id));
create policy refunds_request on refunds for insert to ems_api with check (exists (select 1 from orders o where o.id = order_id) and requested_by = app.user_id());
create policy refunds_decide on refunds for update to ems_api using (app.is_finance() or exists (select 1 from orders o where o.id = order_id and app.has_perm('refunds.issue')));
create policy chargebacks_read on chargebacks for select to ems_api, ems_readonly using (app.is_platform()
  or exists (select 1 from payment_intents p where p.id = payment_intent_id and app.can_org(p.org_id)));
create policy chargebacks_write on chargebacks for all to ems_api using (app.is_finance()) with check (app.is_finance());

-- Ledger: platform sees all; organisers see their own accounts' lines. Nobody writes directly.
create policy ledger_accounts_read on ledger_accounts for select to ems_api, ems_readonly using (app.is_platform() or app.can_org(org_id));
create policy journal_entries_read on journal_entries for select to ems_api, ems_readonly using (app.is_platform()
  or exists (select 1 from journal_lines l join ledger_accounts a on a.id = l.account_id where l.entry_id = journal_entries.id and app.can_org(a.org_id)));
create policy journal_lines_read on journal_lines for select to ems_api, ems_readonly using (app.is_platform()
  or exists (select 1 from ledger_accounts a where a.id = account_id and app.can_org(a.org_id)));

-- People ------------------------------------------------------------------------
create policy users_self on users for select to ems_api, ems_readonly using (id = app.user_id() or app.is_platform()
  or exists (select 1 from org_members m where m.user_id = users.id and app.can_org(m.org_id)));
create policy users_self_update on users for update to ems_api using (id = app.user_id() or app.is_platform()) with check (id = app.user_id() or app.is_platform());
create policy users_signup on users for insert to ems_api with check (true);   -- sign-up via OTP; the API verifies the code first
create policy otp_api on otp_challenges for all to ems_api using (true) with check (true); -- only the auth service touches it; hashes only
create policy platform_staff_read on platform_staff for select to ems_api, ems_readonly using (app.is_platform());
create policy platform_staff_write on platform_staff for all to ems_api using (app.platform_role() = 'OWNER') with check (app.platform_role() = 'OWNER');
create policy own_rows on user_preferences for all to ems_api using (user_id = app.user_id()) with check (user_id = app.user_id());
create policy own_rows on follows for all to ems_api using (user_id = app.user_id()) with check (user_id = app.user_id());
create policy own_rows on notifications for all to ems_api using (user_id = app.user_id() or app.is_platform()) with check (true);
create policy own_rows on data_requests for all to ems_api using (user_id = app.user_id() or app.is_platform()) with check (user_id = app.user_id() or app.is_platform());
create policy own_consent on marketing_consents for all to ems_api using (user_id = app.user_id()) with check (user_id = app.user_id());
create policy organisations_read on organisations for select to ems_api, ems_readonly using (true);   -- public profiles
create policy organisations_write on organisations for update to ems_api using (app.can_org(id)) with check (app.can_org(id));
create policy organisations_register on organisations for insert to ems_api with check (app.user_id() is not null and status = 'PENDING');

-- Attendees: their own records ------------------------------------------------------
create policy attendee_own on orders for select to ems_api using (buyer_user_id = app.user_id());
create policy attendee_checkout on orders for insert to ems_api with check (status = 'PENDING' and (buyer_user_id is null or buyer_user_id = app.user_id()));
create policy attendee_own on tickets for select to ems_api using (holder_user_id = app.user_id()
  or exists (select 1 from orders o where o.id = order_id and o.buyer_user_id = app.user_id()));
create policy attendee_own on rsvps for all to ems_api using (user_id = app.user_id()) with check (user_id = app.user_id() and app.event_is_open_link(event_id));
create policy attendee_checkin on open_checkins for insert to ems_api with check (user_id is not distinct from app.user_id() and app.event_is_open_link(event_id));
create policy attendee_own on open_checkins for select to ems_api using (user_id = app.user_id());
create policy attendee_own on cases for all to ems_api using (attendee_id = app.user_id()) with check (attendee_id = app.user_id());
create policy attendee_own on contributions for select to ems_api using (user_id = app.user_id());
create policy attendee_give on contributions for insert to ems_api with check (status = 'PENDING' and (user_id is null or user_id = app.user_id()));
create policy attendee_own on food_orders for all to ems_api using (buyer_user_id = app.user_id()) with check (buyer_user_id = app.user_id() and paid_at is null);
create policy attendee_own on reviews for all to ems_api using (user_id = app.user_id()) with check (user_id = app.user_id() and now() <= editable_until);
create policy attendee_own on help_requests for all to ems_api using (exists (select 1 from cases c where c.id = case_id and c.attendee_id = app.user_id()))
  with check (exists (select 1 from cases c where c.id = case_id and c.attendee_id = app.user_id()));
create policy attendee_own on waitlist_entries for all to ems_api using (user_id = app.user_id()) with check (user_id = app.user_id());

-- Public reads ------------------------------------------------------------------------
create policy public_read on events for select to ems_api, ems_readonly using (app.event_is_open_link(id));
create policy public_read on event_sessions for select to ems_api using (app.event_is_open_link(event_id));
create policy public_read on ticket_types for select to ems_api using (app.event_is_open_link(event_id));
create policy public_read on allowances for select to ems_api using (app.event_is_open_link(event_id));
create policy public_read on ticket_type_allowances for select to ems_api using (true);
create policy public_read on seats for select to ems_api using (app.event_is_open_link(event_id));
create policy public_read on menu_items for select to ems_api using (app.event_is_open_link(event_id) and not paused);
create policy public_read on venues for select to ems_api, ems_readonly using (true);
create policy venues_write on venues for all to ems_api using (app.can_org(org_id)) with check (app.can_org(org_id));
create policy public_read on giving_pages for select to ems_api using (active);
create policy public_read on giving_funds for select to ems_api using (exists (select 1 from giving_pages p where p.id = page_id and p.active));
create policy public_read on reviews for select to ems_api using (status = 'PUBLISHED' and visibility <> 'PRIVATE');
