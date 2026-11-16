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

## Host on Firebase

The app builds to plain static files (`out/`), which Firebase Hosting serves
from its global CDN. No server is needed for the showcase.

**One-time set-up**

1. Create a project at https://console.firebase.google.com (Analytics optional).
2. Put its project ID in `.firebaserc` in place of `REPLACE-WITH-YOUR-FIREBASE-PROJECT-ID`.
3. In Firebase: Build > Hosting > Get started (just click through; the config is already here).
4. Create a deploy key: Google Cloud console > IAM > Service accounts >
   create one with the roles **Firebase Hosting Admin** and
   **API Keys Viewer**, then Keys > Add key > JSON.
5. In GitHub: Settings > Secrets and variables > Actions > New repository secret,
   name `FIREBASE_SERVICE_ACCOUNT`, paste the whole JSON file.

**After that**

- Every push to `master` builds and goes live at `https://<project-id>.web.app`.
- Every pull request gets its own preview link, posted as a comment.
- To deploy by hand instead: `npm i -g firebase-tools`, `firebase login`,
  `npm run build`, `firebase deploy --only hosting`.
- Custom domain (e.g. tickets.yourbrand.zm): Firebase > Hosting > Add custom domain.

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
