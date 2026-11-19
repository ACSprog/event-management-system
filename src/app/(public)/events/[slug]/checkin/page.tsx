import { events } from "@/lib/mock/data";
import { setupFor } from "@/lib/mock/event-day";
import { CheckIn } from "./checkin";

/** Check-in page opened by scanning the event's check-in QR code (open-entry events). */
export function generateStaticParams() {
  return events.filter((e) => setupFor(e.id).checkinQr).map((e) => ({ slug: e.slug }));
}

export default async function CheckInPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CheckIn slug={slug} />;
}
