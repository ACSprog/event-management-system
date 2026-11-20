# Security policy

## Reporting a vulnerability

Please **don't open a public issue** for security problems. This repository is public.

Report privately through GitHub: **Security › Report a vulnerability** on this repository
(private vulnerability reporting). Include what you found, how to reproduce it and what it
could affect. We aim to:

- acknowledge within **2 business days**,
- give a first assessment within **5 business days**,
- fix critical issues (money, personal data, sign-in) within **7 days** of confirming them.

Please don't access other people's data, move money, or run tests that could disrupt the
service while investigating. Good-faith reports are welcome and will be credited if you wish.

## What's in scope

- The web app (public site, attendee account, organiser workspace, super admin)
- The database schema, migrations and access rules in `db/`
- The CI/CD workflows in `.github/workflows/`
- The test site `event-management-system-test.web.app`

The live site is hosted by the owner; report issues with it the same way.

## How the project stays secure

See [docs/devsecops.md](docs/devsecops.md): secret scanning, dependency and code scanning,
database access rules, security headers, environments and incident steps.
