# Test environment

The test environment runs the real system (database, backend, website) with test data,
in the Google Cloud project `event-management-system-test`. Payments and SMS run in test
mode until the real providers are signed up. Live is a separate project, set up later the
same way.

## How it fits together

```
 Browser ──► Website (Cloud Run "ems-web", public)          africa-south1 (Johannesburg)
                 │  forwards /api/* with its own identity
                 ▼
            Backend (Cloud Run "ems-api", private: only the website and the deploy
                 │    pipeline may call it)
                 ▼
            PostgreSQL 16 + PostGIS (Cloud SQL "ems-test": no open networks,
                 encrypted connections only, daily backups, point-in-time recovery)
```

- Firebase Hosting can't forward to Cloud Run in Johannesburg, so the website moves to Cloud
  Run next to the backend. The old `event-management-system-test.web.app` address will
  redirect to it.
- For live, a load balancer with your own domain and Cloud Armor (web firewall) goes in front.
- Background jobs and ticket holds use PostgreSQL in test (no Redis needed yet); Redis is added
  when load requires it.

## One-time setup (owner, about 20 minutes)

1. **Billing:** the test project must have billing enabled (Firebase *Blaze* plan).
2. **Run the setup script in Cloud Shell.** Open https://console.cloud.google.com, select the
   project `event-management-system-test`, click the **>_** (Activate Cloud Shell) button at the
   top right, then paste:

   ```bash
   git clone https://github.com/ACSprog/event-management-system.git
   bash event-management-system/infra/test/bootstrap.sh
   ```

   It enables the services, creates the database (about 10 minutes the first time), the
   secrets, the container registry and the service accounts, and sets up keyless sign-in for
   GitHub. It's safe to run again. At the end it prints five values.
3. **Add the five values as GitHub variables** (not secrets) at
   https://github.com/ACSprog/event-management-system/settings/variables/actions:
   `GCP_PROJECT`, `GCP_REGION`, `GCP_WIF_PROVIDER`, `GCP_DEPLOY_SA`, `CLOUDSQL_INSTANCE`.
4. **Run the first deploy:** https://github.com/ACSprog/event-management-system/actions,
   choose **Deploy test backend**, click **Run workflow**. It migrates the database, creates the
   backend's restricted login, loads the sample data, runs the database tests, builds and
   deploys the backend, and checks it answers (and refuses callers without a token).

After that, every merge that changes `api/` or `db/` deploys automatically.

## What it costs (roughly, test)

| Item | Approximate monthly cost |
| --- | --- |
| Cloud SQL, smallest shared-core, 10 GB, backups | US$10–20 |
| Cloud Run (website and backend, scale to zero) | Usually within the free tier for test traffic |
| Artifact Registry, Secret Manager | Under US$1 |

Check Google's pricing calculator for `africa-south1`. The database is the only part that
costs money while idle; stop it in the console (*SQL › ems-test › Stop*) when nobody is testing.

## Day to day

- **Logs:** Cloud Run › ems-api › Logs (one JSON line per request, no personal data).
- **Database:** Cloud SQL Studio (console) or the Cloud SQL Auth Proxy from your PC
  (`db/README.md`). Never open the database to the internet.
- **Secrets:** Secret Manager. To rotate the backend's database password, add a new version of
  `db-api-password` and run the deploy again (it updates the database login and Cloud Run).
- **Sample data** is reloaded on every deploy (the same IDs, so nothing is duplicated). Data you
  create while testing stays.

## Build phases (what becomes real, in order)

1. **Foundation** (this step): database online, backend deployed privately, public event
   discovery from the database.
2. **No money yet:** sign-in by SMS code (codes shown in a test inbox in the test environment),
   organiser registration and team, venues, creating and publishing events, free registration
   and open-entry events, "I'm coming", check-in, messages and help requests, notifications;
   the website switches from sample data to the backend screen by screen.
3. **Paid tickets:** checkout with a test payment provider (simulated MTN, Airtel, Zamtel and
   card prompts), QR tickets, transfers, refunds, the gate scanner. The real aggregator plugs in
   when its account is ready.
4. **Money out:** ledger, settlements, approvals and payouts (test payouts), giving and
   contribution cashouts, invoices, ZRA Smart Invoice (test VSDC).
5. **The rest:** food and merchandise, reviews, campaigns, reports, super admin tools.
