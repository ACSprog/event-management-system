"use client";

import { Badge, Button, Card, PageHeader, SectionTitle, useToast } from "@/components/ui";

const groups = [
  { g: "Payments", items: [["MTN MoMo", "Collections and payouts", "Connected"], ["Airtel Money", "Collections", "Connected"], ["Zamtel Kwacha", "Collections", "Not connected"], ["Card acquirer", "Visa and Mastercard", "Connected"]] },
  { g: "Virtual events and classes", items: [["Zoom", "Meetings, registrants, attendance", "Connected"], ["YouTube Live", "Stream links", "Connected"], ["Facebook Live", "Stream links", "Not connected"]] },
  { g: "Messaging", items: [["SMS gateway", "Tickets and campaigns", "Connected"], ["WhatsApp Business", "Through an approved provider", "Not connected"], ["Email", "Transactional and campaigns", "Connected"], ["Push notifications", "Firebase Cloud Messaging", "Connected"]] },
  { g: "Data", items: [["Metabase", "Dashboards on your data", "Not connected"], ["Power BI", "Reporting", "Not connected"], ["QuickBooks or Pastel", "Accounting export", "Not connected"], ["Webhooks", "Send events to your systems", "2 endpoints"]] },
];

export default function Integrations() {
  const toast = useToast();
  return (
    <>
      <PageHeader title="Integrations" sub="Credentials are stored encrypted and never shown again after you save them." />
      {groups.map((g) => (
        <div key={g.g}>
          <SectionTitle title={g.g} />
          <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {g.items.map(([n, d, s]) => (
              <Card key={n} className="flex flex-col">
                <div className="flex items-start justify-between gap-2"><p className="font-semibold">{n}</p><Badge tone={s === "Not connected" ? "grey" : "green"}>{s}</Badge></div>
                <p className="mt-1 flex-1 text-sm text-ink-3">{d}</p>
                <Button size="sm" variant="secondary" className="mt-4" onClick={() => toast(s === "Not connected" ? `Connecting ${n}…` : `${n} settings opened`, "info")}>{s === "Not connected" ? "Connect" : "Manage"}</Button>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
