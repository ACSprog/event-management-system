import { fundraising } from "@/lib/mock/data";
import { Donate } from "./donate";

export function generateStaticParams() {
  return fundraising.map((f) => ({ slug: f.slug }));
}

export default async function FundraisingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Donate slug={slug} />;
}
