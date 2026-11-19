import { givingPages } from "@/lib/mock/event-day";
import { GiveForm } from "./give-form";

/** Public giving page (tithes, offerings, funeral contributions), shared as a link and QR code. */
export function generateStaticParams() {
  return givingPages.map((g) => ({ slug: g.slug }));
}

export default async function GivePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <GiveForm slug={slug} />;
}
