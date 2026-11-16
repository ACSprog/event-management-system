import { orgEvents } from "@/lib/mock/data";
import { EventManage } from "./manage";

export function generateStaticParams() {
  return orgEvents().map((e) => ({ slug: e.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <EventManage slug={slug} />;
}
