import { settlements } from "@/lib/mock/commerce";
import { AdminSettlement } from "./detail";

export function generateStaticParams() {
  return settlements.map((s) => ({ ref: s.ref }));
}

export default async function Page({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  return <AdminSettlement ref_={ref} />;
}
