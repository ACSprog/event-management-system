import { events, orgEventsExtra } from "@/lib/mock/data";
import { SeatPicker } from "./seat-picker";

export function generateStaticParams() {
  return [...events, ...orgEventsExtra].map((e) => ({ slug: e.slug }));
}

export default async function SeatsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SeatPicker slug={slug} />;
}
