import Link from "next/link";
import { Bell, CalendarClock, MapPin, UtensilsCrossed, Wallet } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { api } from "@/lib/api";

export default function Notifications() {
  const icons = { ticket: Bell, nearby: MapPin, money: Wallet, order: UtensilsCrossed, reminder: CalendarClock } as const;
  // Where tapping a notification goes.
  const links: Record<string, string> = { order: "/account/orders/#food", reminder: "/events/funeral-joseph-mwansa/" };
  return (
    <>
      <PageHeader title="Notifications" />
      <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
        {api.me.notifications().map((n) => {
          const I = icons[n.kind as keyof typeof icons];
          return (
            <li key={n.id} className="flex gap-4 px-5 py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kafue-soft text-kafue"><I size={16} /></span>
              <div className="min-w-0 flex-1"><p className="font-semibold">{links[n.kind] ? <Link href={links[n.kind]} className="hover:text-kafue">{n.title}</Link> : n.title}</p><p className="text-sm text-ink-2">{n.body}</p></div>
              <span className="shrink-0 text-xs text-ink-3">{n.time}</span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
