# Database (PostgreSQL 16 + PostGIS)

The main database for the whole system: people and organisations, events and tickets,
check-in, giving and contributions, food and merchandise, messages, and the money side
(commercial terms, payments, double-entry ledger, settlements and payouts). It implements
`claude/database-and-financial-workflows.md` in the project docs and the rules agreed in
`claude/ems-decisions.md`.

Firestore (live screens) and backups are planned separately; this is the system of record.

## Run it locally

```bash
cd db
cp .env.example .env            # set your own local password
docker compose up -d            # PostgreSQL 16 + PostGIS on 127.0.0.1:5432
npm install
export $(grep -v '^#' .env | xargs)   # or set DATABASE_URL yourself
npm run migrate                 # apply migrations
npm run seed                    # load the showcase's sample data
npm test                        # run the database tests
npm run reset                   # local only: drop everything, migrate, seed, test
```

## Layout

| Migration | What it adds |
| --- | --- |
| `0001_foundation` | Extensions, the `ems_api` and `ems_readonly` roles, request context (`app.set_context`), append-only and audit triggers, `audit_log` |
| `0002_people_and_tenancy` | Users (E.164 phones, gender), sign-in codes (hashed), organisations, verification, team roles and members, platform staff |
| `0003_commercial` | Plans and versions, subscriptions, licence packages, contracts, partnerships, add-ons, discounts, entitlements |
| `0004_venues_and_events` | Venues (PostGIS), events (entry mode, listing, event-day settings), programme, ticket types, ticket extras, stations, seats, staff, frozen commercial terms, event licences |
| `0005_orders_tickets_payments` | Orders, tickets (QR nonce only), transfers, waitlist, discount codes, payment intents, webhook inbox, provider statements, refunds, chargebacks |
| `0006_checkin_and_attendance` | Gate scans (with re-entry), extras used and sold at stations, "I'm coming", open-entry check-ins, usher counts, meal passes |
| `0007_ledger` | Chart of accounts, ledger accounts, journal entries and lines, `app.post_entry`, derived balances |
| `0008_settlements_and_payouts` | Finance settings, holidays, event completion, settlements and their state machine, disputes, adjustments, approvals, payout accounts, payouts |
| `0009_giving_and_contributions` | Giving pages and funds, pledges, contributions, system-failure refunds, contribution cashouts and approvals |
| `0010_food_and_merchandise` | Menu items, stock movements and counts, food orders (part collection), attendant hand-ins, takings per attendant |
| `0011_engagement_and_planning` | Cases (CS numbers, calls, expiry), help requests, event messages, notifications, reviews, campaigns, tasks, vendors, budgets, expenses |
| `0012_billing_support_privacy` | Invoices, SMS log, EMS support tickets, data protection requests |
| `0013_access_control` | Grants and row-level security policies for every table |

## Rules the database enforces

Money and security rules live in the database as well as the API, so a bug or a hand-written
query can't get round them (tests in `db/tests`):

- **Money** is whole ngwee (`bigint`, K1 = 100). Rates are basis points (300 = 3%).
- **Ledger:** every journal entry balances, entries and lines can't be changed or deleted,
  and the same source can't be posted twice.
- **No early payouts:** a payout needs an approved settlement for a completed event, a
  verified payout account past its 48-hour wait, and exactly the settlement's payable.
- **Approvals:** only platform finance staff approve. Two different people above K50,000,
  and the second must be a finance manager. Finance staff can't be organiser members.
- **Settlement states** move only along allowed transitions.
- **Commercial terms** freeze when an event is published.
- **Contributions:** cashouts only from cleared money, with a daily automatic limit; refunds
  only by EMS finance for a system failure.
- **Tickets:** no overselling, one admission per ticket (re-entry only when switched on),
  each extra used at most as many times as the ticket includes, extras only after entry.
- **Open entry:** check-in only during the event, one per phone; meals up to the people checked in.
- **Food and merchandise:** no selling below zero, write-offs need a reason, part collection
  can't exceed the order, cash is handed to someone other than the attendant.
- **Cases:** closed chats are read-only; messages are purged 90 days after closing.
- **Audit:** sensitive tables write before/after rows to an append-only `audit_log`.

## Security model

- Migrations run as the owner role. The API connects as a separate login that is a member of
  `ems_api`, never as the owner. Reporting (Metabase) uses `ems_readonly`.
- **Row-level security is on and forced for every table.** Each request calls
  `app.set_context(user, organisation, platform_role)` in its transaction. Organiser staff see
  only their organisation, attendees only their own records, the public only published data.
- No secrets in this repo: connection strings come from `DATABASE_URL` (Secret Manager or
  Cloud SQL IAM auth in the cloud). Sign-in codes and payment links are stored hashed; ticket
  QR codes are signed with a key that is not in the database.
- Applied migrations are checksummed; editing one after it has run stops the next deploy.
  Changes always go in a new numbered migration.
- `npm run reset` and the seed refuse to run against production.

## Adding a migration

1. Create `db/migrations/NNNN_short_name.sql` with the next number.
2. Enable RLS and add policies for any new table (the CI test fails if a table has none).
3. Add or update a test in `db/tests/` for any rule you add.
4. `npm run reset` locally, then open a pull request: CI rebuilds the database from scratch,
   seeds it and runs the tests.
