import { events, orgEvents } from "@/lib/mock/data";
import { EventManage } from "./manage";

export function generateStaticParams() {
  // The organiser's own events, plus the church service and funeral examples
  // (open entry, giving) from other workspaces so the showcase can open them.
  const extra = events.filter((e) => ["e30", "e31", "e32"].includes(e.id));
  return [...orgEvents(), ...extra].map((e) => ({ slug: e.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <EventManage slug={slug} />;
}
