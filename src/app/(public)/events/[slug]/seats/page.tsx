import { events, orgEventsExtra } from "@/lib/mock/data";
import { SeatPicker } from "./seat-picker";

export function generateStaticParams() {
  // Open-entry events have no tickets, so no seats or checkout.
  return [...events, ...orgEventsExtra].filter((e) => e.tickets.length).map((e) => ({ slug: e.slug }));
}

export default async function SeatsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SeatPicker slug={slug} />;
}
