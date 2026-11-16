import { Gift, Users } from "lucide-react";
import { Button, Card, PageHeader, Progress } from "@/components/ui";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";

export default function Rewards() {
  const tiers = api.crm.loyaltyTiers();
  const mem = api.crm.memberships()[0];
  return (
    <>
      <PageHeader title="Rewards and membership" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-ink text-canvas">
          <p className="text-sm opacity-70">Zed Live rewards</p>
          <p className="font-display mt-1 text-4xl font-bold">3,420 points</p>
          <p className="mt-1 text-sm opacity-80">Silver. 2,580 points to Gold.</p>
          <Progress value={(3420 - 2000) / 40} tone="marigold" className="mt-4 bg-white/15" />
          <div className="mt-5 flex gap-2"><Button variant="ticket" size="sm"><Gift size={14} /> Redeem K50 voucher (500 pts)</Button></div>
        </Card>
        <Card>
          <p className="text-sm text-ink-3">Membership</p>
          <p className="font-display text-2xl font-semibold">{mem.name}</p>
          <p className="text-sm text-ink-3">Renews 3 March 2027, {kwacha(mem.price)} a {mem.period}</p>
          <ul className="mt-3 space-y-1 text-sm">{mem.perks.map((x) => <li key={x}>✓ {x}</li>)}</ul>
          <div className="mt-4 rounded-lg bg-surface-2 p-3 font-mono text-sm">Member no. ZLI-004471</div>
        </Card>
      </div>
      <h2 className="mb-3 mt-8 text-lg font-semibold">Tiers</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {tiers.map((t) => <Card key={t.name}><p className="font-semibold">{t.name}</p><p className="text-sm text-ink-3">From {t.from.toLocaleString()} points</p><p className="mt-2 text-sm">{t.earn}</p><p className="text-sm">{t.perks}</p></Card>)}
      </div>
      <Card className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-3"><Users className="text-kafue" /><div><p className="font-semibold">Invite friends, get 200 points each</p><p className="text-sm text-ink-3">When they buy their first ticket. Your link: eventra.example/r/chanda</p></div></div>
        <Button variant="secondary">Copy link</Button>
      </Card>
    </>
  );
}
