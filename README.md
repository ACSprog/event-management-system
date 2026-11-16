# Eventra: web interfaces (partner showcase)

Every web portal of the Event Management System, built as one real Next.js app
with sample data. "Eventra" is a working name: change it in `src/lib/brand.ts`.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to ./out (what the preview link serves)
```

Node 20 or newer.

## Hosting

The app builds to plain static files (`out/`).

| Environment | Hosted by | Where | Updated when |
|---|---|---|---|
| Test | Us, on Firebase Hosting | Firebase project `event-management-system-test`, `https://event-management-system-test.web.app` | Every push to `master`. Pull requests get a 7-day preview link. |
| Live | The owner, on their own hosting | Owner's choice (their Firebase project, own server, any static host) | When a GitHub release is published, a ready-to-host package `event-management-system-web-<tag>.zip` is attached to the release. The owner downloads it and follows `HOSTING.md` inside. |

Firebase
project IDs are unique worldwide, so use the exact ID Firebase gives you in
`.firebaserc` and in the workflow's `projectId:` line.

**One-time set-up for test**

1. Create a Firebase project for test at https://console.firebase.google.com.
2. Put its project ID in `.firebaserc` and `.github/workflows/firebase-hosting.yml`.
3. In the project: Build > Hosting > Get started (click through; the config is already here).
4. In its Google Cloud console: IAM > Service accounts > create one with the roles
   **Firebase Hosting Admin** and **API Keys Viewer**, then Keys > Add key > JSON.
5. In GitHub: Settings > Secrets and variables > Actions > new secret
   `FIREBASE_SERVICE_ACCOUNT_TEST`, paste the JSON.

**Firebase web config**

The site reads its Firebase settings (used for Analytics now, sign-in and push
later) from `NEXT_PUBLIC_FIREBASE_*` variables at build time; see `.env.example`.

- Test: the values for `event-management-system-test` are in the workflow.
- Live: the owner sends their Firebase web-app config, and we store it as GitHub
  repository **variables** named `LIVE_FIREBASE_API_KEY`, `LIVE_FIREBASE_AUTH_DOMAIN`,
  `LIVE_FIREBASE_PROJECT_ID`, `LIVE_FIREBASE_STORAGE_BUCKET`,
  `LIVE_FIREBASE_MESSAGING_SENDER_ID`, `LIVE_FIREBASE_APP_ID` and
  `LIVE_FIREBASE_MEASUREMENT_ID`. Release packages are built with them.
- Locally, copy `.env.example` to `.env.local` and fill it in, or leave it empty
  to run without Firebase.

These values identify a project; they are not passwords. Restrict each API key
to its own domains: Google Cloud console > APIs and Services > Credentials.

**Handing a version to the owner for live**

1. Check it on the test address.
2. GitHub > Releases > Draft a new release, tag it (for example `v0.2.0`), publish.
3. The release gets `event-management-system-web-v0.2.0.zip`. Send the owner the release link.

Deploying test by hand: `npm i -g firebase-tools && firebase login && npm run build && firebase deploy --only hosting -P test`.

## What's inside

| Portal | Path | Screens |
|---|---|---|
| Public site | `/` | Home, discovery with distance filter and map, event page, seat selection, checkout (MoMo, Airtel, Zamtel, card, bank), confirmation with QR tickets, organiser page, donation page, pricing, sign in, organisation registration |
| Customer | `/account/` | Ticket wallet with transfer, orders and refunds, courses, verified review form, rewards and membership, notifications, location and alert preferences |
| Organiser | `/org/` | Dashboard, AI planner, events, create-event wizard (event profiles), event management (overview, tickets, attendees, check-in, tasks, budget, staff), live check-in, venues and floor-plan editor, vendors and quote comparison, customers (CRM), reviews and responses, membership and loyalty, classrooms, reports, team and permissions, integrations, settings |
| Finance | `/org/finance/` | Overview and P&L, transactions and refunds, budgets and expenses, payouts and settlements, fundraising and sponsors |
| Marketing | `/org/marketing/` | Campaigns, discount codes, automations, referrals, campaign composer with preview |
| Gate scanner | `/scan/` | Shift set-up, offline ticket download, scanning (real camera where the browser supports it), valid / used / wrong gate / cancelled / fake results, name lookup, sync status |
| Instructor | `/instructor/` | Today, classroom (lessons and Zoom, students, materials, assessments, certificates), grading, new course |
| Vendor and venue | `/vendor/` | Dashboard, quote requests, venue calendar, services, contracts and invoices |
| Super admin | `/admin/` | Platform overview, organisations (approve and suspend), plans, payments and fees, review moderation, support, notification templates, system health, audit and security |

## How it connects to the backend later

- Screens never import mock data. They call `src/lib/api/index.ts`.
- Each function there is commented with the NestJS endpoint that replaces it,
  for example `/** GET /v1/events/:slug */`.
- To connect a service, change those function bodies to use `http()` and set
  `NEXT_PUBLIC_API_URL`. The screens stay the same.
- Sample data lives only in `src/lib/mock/data.ts`, separate from production code.
- Remove `output: "export"` from `next.config.ts` when the app moves to a server
  (Firebase App Hosting or Cloud Run), so server rendering and authentication
  middleware can be used.

## Design system

- Tokens in `src/app/globals.css`: Kafue teal (primary), marigold (tickets),
  hibiscus (errors and rejected scans), leaf (success), light and dark themes.
- Type: Bricolage Grotesque (headings) and Public Sans (text), self-hosted.
- Shared components in `src/components/ui`: buttons, badges, cards, tables,
  tabs, forms, modals, toasts, charts.
- Event posters are generated from the category until organisers upload images.

## Showcase only

- The dark "View as" bar at the top switches between portals.
  Remove `<DemoBar />` from `src/app/layout.tsx` for production.
- Payments, Zoom, SMS and sign-in are simulated in the browser. Nothing is charged or sent.
