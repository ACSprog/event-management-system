# Feature scope (agreed 18 Nov 2026)

Source: review of the competitor feature prompt against the decisions, spec and database design. The prompt's phases, its ten separate portals and its "decimal" money type are not followed. The three user types, integer ngwee and the settlement rules stay as they are.

### Extend what exists
- Scanner result states: valid, already used, wrong event, wrong session, not yet valid, expired, cancelled, refunded, revoked, invalid, offline pending sync. Scanning is still never blocked by plan or licence limits.
- Finance dashboard breakdowns by ticket type, channel and promoter.

### Ticketing and buyers
- Guest checkout. Tickets delivered by SMS, WhatsApp and email.
- Ticket wallet that works without the app. Claim by phone or email verification. SMS and email OTP login.
- Ticket types and pricing rules: early bird, regular, late, VIP, group, student, promo codes, purchase limits, sales windows. No BOGO, buy-X-get-Y or bundles.
- Ticket transfer and attendee assignment. Buyer and attendee are separate. The old QR is invalidated and a new one issued.
- Buyer choices on cancellation or postponement: refund, keep the ticket for the new date, or transfer.
- Waitlist for sold-out ticket types.
- Abandoned-checkout and event-reminder messages.
- Referral discount codes (no points).

### Organiser tools (inside /org, no new user types)
- Promoters: tracked links and codes. Commission is paid from the organiser's share and payouts go through the settlement controls. Not the same as revenue-share partnerships. Promoters are an organiser-assigned or invited role, not a fourth user type.
- Celebration management: weddings, kitchen parties, send-offs, funerals. Guest lists, RSVP, tables, linked functions.
- Contributions and pledges (rule below).
- Event checklists, tasks and staff assignments from templates per event type.
- Simple registration form builder: fields, required, conditional logic, per-ticket forms.
- Recurring events.
- Basic reserved seating and table packages.
- Embeddable ticket widget.
- Basic organiser reputation: verified status, events completed, ratings.

### Public site
- Discovery basics: search, category, city, date and price filters, "near me" (PostGIS), saved events, followed organisers.
- Accessibility fields on event pages.

### Contribution money rule (decided)
1. Contribution money (paid pledges, donations, family contributions) is separate from ticket money. R5.1 (no early payouts) applies to ticket money only.
2. Contributions are non-refundable, except for a system failure on EMS's side. Wording shown at payment: "Contributions are non-refundable, except where a system error occurs." The wording and the no-refund status are frozen in the event's terms snapshot before the first contribution is accepted.
3. System failure means only: duplicate charge, wrong amount charged, payment taken but not recorded, or contribution recorded against the wrong event or organiser by a platform error. Organiser decisions, contributor mistakes and cancelled occasions are not system failures.
4. Only finance can issue a system-failure refund, after checking the provider statement and ledger. Dual approval applies above K50,000. It is a ledger reversal with reason code `SYSTEM_FAILURE` and evidence. EMS absorbs the cost, and the fee and provider charge are returned.
5. **Decided 18 Nov: small cashouts are released automatically.** The organiser may initiate a cashout of cleared contribution funds at any time. Organisers still cannot approve anything. Release is automatic only if all checks pass (verified organisation and payout account, 48-hour wait after any account change, amount within the daily limit, MFA, funds cleared). Anything above the limit goes to finance review.
6. New permission `contributions.cashout`, held by organisation admin and finance officer only.
7. Mixed events (for example a wedding with a ticketed after-party) keep two balances. Cashout draws only from the contribution balance.
8. Pledges are records only. Only paid amounts can be cashed out.
9. EMS's fee is taken at collection with the provider charge.
10. Card contributions clear after about 3 business days. Mobile money clears on confirmation. Chargebacks after cashout go to the organiser receivable (account 1200).
11. Organisers who are families or individuals, not registered companies, verify by NRC plus a test payment. New organisers get a low cap or a delay on their first cashout.

### Documents to update
- Spec section 5: scope R5.1 to ticket money; add the contribution cashout rule; replace `payouts.approve` with `settlements.review` (already planned) and add `contributions.cashout`.
- Database design: liability account 2600 "Contribution funds held" (per event); table `contribution_cashouts` (idempotency key, amount at most cleared balance, audit entry); refund reason `SYSTEM_FAILURE`; the payout-before-completion trigger stays on ticket settlements only.
- `src/lib/roles.ts` for the new permission.

### Still open
- Cash and agent sales at the gate or through resellers: EMS does not hold the cash, so probably an EMS fee invoice as for `DIRECT` events. Needs a rule before design.
- The daily automatic cashout limit (placeholder K5,000 in the screens).
- Prices, commission rates and brand name (unchanged).

### Questions for the lawyer and aggregator (added)
- Holding contribution money and releasing it early on EMS's instruction.
- Whether a blanket non-refundable term for contributions is allowed under consumer-protection law.
- Loyalty points, credits and any stored value (not built until answered).
- Whether the aggregator can release held balances at any time, as well as the delayed release already asked about.

### Deferred
- Dynamic pricing, forecasting and predictive attendance.
- AI planner and AI support assistant. Marketing copy generation may come later.
- Vendor quotation marketplace (vendors stay records).
- Full classroom LMS (classes keep enrolment, attendance, certificates).
- Exhibitors, booths, networking and matchmaking.
- White-label storefronts and custom domains.
- Cashless wallets, RFID/NFC, vendor POS, USSD, badge printing.
- Loyalty points and event wallets (legal review first).

### Dashboards (agreed 18 Nov 2026)
- The super admin, organiser and attendee homes share one layout: key figures, needs your attention, right now, money and status, trends and lists, recent activity.
- Every queue count and sidebar badge comes from `src/lib/queues.ts`, so the home and the navigation always agree. Each queue item lists the permissions it needs, and each role sees only what it can act on.
- The organiser home has an event-day view where the live panel leads. Settlements show as "with EMS finance"; organisers never see an approve button.
- The attendee overview is `/account/`; My tickets moved to `/account/tickets/`.
- Contribution cashouts: `/org/finance/contributions/` (organiser) and `/admin/cashouts/` (EMS finance).
