import { events, orgEventsExtra } from "@/lib/mock/data";
import { HelpDesk } from "./help-desk";

export function generateStaticParams() {
  return [...events, ...orgEventsExtra].map((e) => ({ slug: e.slug }));
}

export default async function HelpPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <HelpDesk slug={slug} />;
}
