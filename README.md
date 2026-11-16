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
  (Cloud Run), so server rendering and authentication middleware can be used.

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
