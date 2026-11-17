import { settlements } from "@/lib/mock/commerce";
import { Statement } from "./statement";

export function generateStaticParams() {
  return settlements.filter((s) => s.orgId === "org1").map((s) => ({ ref: s.ref }));
}

export default async function Page({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  return <Statement ref_={ref} />;
}
