# DevSecOps

Security is part of every change, not a step at the end. This page lists what runs
automatically, the rules everyone follows, and the settings the repository owner keeps on.

## 1. What runs automatically

| When | Check | Blocks the merge? |
| --- | --- | --- |
| Every pull request and push | **Build and deploy**: type check, build; PR preview link | Yes |
| Every pull request and push | **Secret scan** (gitleaks, whole history) | Yes |
| Every pull request and push | **Dependency audit** (`npm audit`, high and critical) for the web app and `db/` | Yes |
| Every pull request | **Dependency review**: no newly added vulnerable packages | Yes |
| Every pull request and push | **CodeQL** static analysis (TypeScript, workflows); results in the Security tab | Yes, for high-severity alerts |
| Changes to `db/` or sample data | **Database**: rebuild from scratch, check migrations are unchanged and idempotent, seed, run the database tests (access rules, money rules) | Yes |
| Push to master | **SBOM** (CycloneDX) kept 90 days as a build artifact | No |
| Weekly (Monday) | Security workflow again, plus **Dependabot** update PRs | No |
| Merge to master | Deploy to the **test** site only | — |
| GitHub release | Packaged build for the owner to host **live** | — |

## 2. Rules for every change

1. **No secrets in the repository.** Passwords, service-account keys, payment-provider keys,
   the ticket-signing key and SMS credentials live in GitHub secrets (CI) and Google Secret
   Manager (cloud). Local values go in git-ignored `.env` files; examples in `.env.example`.
2. **Least privilege everywhere.** Workflows default to read-only. The API connects to the
   database as `ems_api` (never the owner), with row-level security forced on every table.
   Reporting uses `ems_readonly`. Platform finance powers exist only for platform staff.
3. **Money and security rules are enforced in the database too**, with a test that tries to
   break each one (`db/tests`). New tables need row-level security policies, or CI fails.
4. **Migrations are append-only.** An applied migration is never edited (checksums stop the
   run); changes go in a new numbered file. Reset and seed refuse to run on production.
5. **Personal data is minimised.** Sign-in codes, payment links and device IDs are stored
   hashed. Gender is shown to organisers only as totals. Chat messages are deleted 90 days
   after a case closes. Data requests (access, correction, deletion) have 30-day deadlines.
6. **Everything sensitive is audited.** Changes to organisations, roles, payouts, settlements,
   refunds and more are written to an append-only audit log with before and after values.
7. **Pull requests only.** Nothing goes to master without the checks above passing.

## 3. Security headers (test and live hosting)

Set in `firebase.json` for every page:

- **Content-Security-Policy**: scripts, styles, images and connections only from the site
  itself and the services it uses (OpenStreetMap tiles, Google Analytics); no framing, no
  plugins, forms post only to the site.
- **Strict-Transport-Security**: HTTPS only, two years.
- **X-Frame-Options: DENY**, **X-Content-Type-Options: nosniff**, **Referrer-Policy**.
- **Permissions-Policy**: camera (QR scanning), microphone (in-app calls) and location
  (near me, check-in) only for the site itself; payment, USB and others off.

The policy still allows inline scripts, which the static Next.js export needs. When the app
moves to a server (App Hosting or Cloud Run), switch to nonces and remove `'unsafe-inline'`.

## 4. Environments

| | Test | Live |
| --- | --- | --- |
| Firebase project | `event-management-system-test` | `event-management-system` (owner) |
| Deployed by | GitHub Actions on merge to master | The owner, from the release package |
| Credentials | `FIREBASE_SERVICE_ACCOUNT_TEST` secret (Hosting deploy roles only) | Owner's own accounts, never in this repo |
| Data | Sample data only | Real data |

Production data is never copied to test. Test credentials can't reach live.

## 5. Settings the repository owner keeps on

In GitHub **Settings**:

- **Branches › master › branch protection:** require a pull request; require the checks
  *Deploy to test*, *Secret scan (gitleaks)*, *Dependency audit*, *Dependency review*,
  *CodeQL* and *Database* (*test*) to pass; block force pushes and deletion.
- **Code security:** turn on *Dependabot alerts*, *Dependabot security updates*,
  *Secret scanning* and *Push protection* (blocks a push that contains a secret),
  *Private vulnerability reporting*, and *Code scanning* (CodeQL results).
- **Actions › General:** *Workflow permissions: Read repository contents* (the default for
  the token); allow GitHub Actions to create pull requests only if Dependabot needs it.
- Two-factor authentication on every account with access to this repository, Firebase and
  Google Cloud.

In **Google Cloud** (test and live projects):

- Restrict the Firebase **web API key**: *APIs & Services › Credentials*. Under
  *Application restrictions* choose *Websites* and add the site's addresses (for test:
  `event-management-system-test.web.app/*`, `event-management-system-test.firebaseapp.com/*`,
  `localhost/*`). Under *API restrictions* allow only the Firebase APIs the app uses.
  The key is public by design; these restrictions stop others using it.
- The deploy service account has only the four roles listed in the README. Rotate its key
  every 90 days, or move to keyless Workload Identity Federation.

## 6. Backend (when it is built)

- Cloud SQL with private IP only, IAM database authentication, automatic backups and
  point-in-time recovery, and a standby in a second zone.
- Secrets from Secret Manager; no keys in environment files on servers.
- Rate limits on sign-in codes, checkout and webhooks; webhook signatures verified before
  anything is processed; idempotency keys on every money operation.
- Multi-factor sign-in for organiser admins and all platform staff; a fresh check before
  approving settlements or payouts.
- Logs without personal data or secrets; alerts on failed sign-ins, payout changes and
  ledger integrity checks.
- Penetration test before launch; the data protection and payment-law questions with the
  lawyer (see the decisions doc).

## 7. If something goes wrong

1. **Contain:** revoke the leaked key or token, rotate the service account, pause payouts
   (finance settings) or take the affected feature offline.
2. **Assess:** use the audit log and Cloud logs to see what was accessed or changed.
3. **Fix** in a pull request with a test that would have caught it.
4. **Tell** affected organisers and attendees, and the Data Protection Commissioner where the
   Data Protection Act 2021 requires it.
5. **Write up** what happened and what changes, in the project docs.
