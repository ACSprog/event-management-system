import { events } from "@/lib/mock/data";
import { setupFor } from "@/lib/mock/event-day";
import { MenuOrder } from "./menu-order";

/** Food, drinks and merchandise menu, opened from the event page or a menu QR code. */
export function generateStaticParams() {
  return events.filter((e) => setupFor(e.id).menu).map((e) => ({ slug: e.slug }));
}

export default async function MenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <MenuOrder slug={slug} />;
}
