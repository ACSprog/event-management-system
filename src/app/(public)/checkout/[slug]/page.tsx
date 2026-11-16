import { events, orgEventsExtra } from "@/lib/mock/data";
import { Checkout } from "./checkout";

export function generateStaticParams() {
  return [...events, ...orgEventsExtra].map((e) => ({ slug: e.slug }));
}

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Checkout slug={slug} />;
}
