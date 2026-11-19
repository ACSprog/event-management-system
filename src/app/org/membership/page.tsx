import { Plus } from "lucide-react";
import { Badge, Button, Card, PageHeader, SectionTitle, Stat } from "@/components/ui";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";

export default function Membership() {
  return (
    <>
      <PageHeader title="Membership and loyalty" actions={<Button><Plus size={15} /> New plan</Button>} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <Stat label="Active members" value="2,722" delta="+184" hint="this month" />
        <Stat label="Membership income, year" value={kwacha(1_097_400)} />
        <Stat label="Renewals due in 30 days" value="212" hint="reminders scheduled" />
        <Stat label="Loyalty points issued" value="4.1M" hint="18% redeemed" />
      </div>
      <SectionTitle title="Membership plans" />
      <div className="grid gap-4 md:grid-cols-2">
        {api.crm.memberships().map((m) => (
          <Card key={m.name}>
            <div className="flex items-start justify-between"><div><p className="text-lg font-semibold">{m.name}</p><p className="text-sm text-ink-3">{kwacha(m.price)} a {m.period}</p></div><Badge tone="green">{m.members.toLocaleString()} members</Badge></div>
            <ul className="mt-3 space-y-1 text-sm">{m.perks.map((p) => <li key={p}>✓ {p}</li>)}</ul>
          </Card>
        ))}
      </div>
      <SectionTitle title="Member-only events and presales" sub="Set an event's visibility to Members only, or give members early access, in the create-event wizard." />
      <div className="mb-2 grid gap-4 md:grid-cols-2">
        {api.crm.memberEvents().map((m) => <Card key={m.title}><p className="font-semibold">{m.title}</p><p className="text-sm text-ink-3">{m.when}</p><p className="mt-2 text-sm">{m.access}</p><Badge tone="teal" className="mt-2">{m.plans}</Badge></Card>)}
      </div>
      <SectionTitle title="Loyalty tiers" sub="Points are earned on eligible ticket purchases, not on donations." />
      <div className="grid gap-4 md:grid-cols-3">
        {api.crm.loyaltyTiers().map((t) => <Card key={t.name}><p className="font-semibold">{t.name}</p><p className="text-sm text-ink-3">From {t.from.toLocaleString()} points</p><p className="mt-2 text-sm">{t.earn}</p><p className="text-sm text-ink-2">{t.perks}</p></Card>)}
      </div>
    </>
  );
}
