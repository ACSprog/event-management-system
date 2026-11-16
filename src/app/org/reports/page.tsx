"use client";

import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button, Card, PageHeader, SectionTitle } from "@/components/ui";
import { Bars } from "@/components/ui/charts";

const reports = [
  ["Sales by event and ticket type", "Money"], ["Profit and loss", "Money"], ["Refunds", "Money"], ["Tax and fees (for ZRA)", "Money"], ["Vendor liabilities", "Money"], ["Payouts and settlements", "Money"],
  ["Attendance and check-in by gate", "Events"], ["No-shows", "Events"], ["Customer growth and repeat buyers", "Audience"], ["Campaign performance", "Audience"], ["Ratings by event and area", "Audience"], ["Course enrolment and completion", "Learning"],
];
const cats = ["Music", "Comedy", "Conference", "Church"].map((c, i) => ({ c, sold: [31_160, 2_100, 1_017, 4_280][i], rating: [4.6, 4.5, 4.4, 4.9][i] * 1000 }));

export default function Reports() {
  return (
    <>
      <PageHeader title="Reports" sub="Every report downloads as PDF, Excel or CSV. Connect Metabase or Power BI for custom analysis." />
      <Card><SectionTitle title="Tickets sold by event type, this year" /><Bars data={cats} x="c" keys={["sold"]} labels={["Tickets sold"]} height={220} /></Card>
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {reports.map(([r, g]) => (
          <Card key={r} className="flex items-center justify-between gap-3">
            <div><p className="font-semibold">{r}</p><p className="text-xs text-ink-3">{g}</p></div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" aria-label={`${r} as PDF`}><FileText size={15} /></Button>
              <Button size="sm" variant="ghost" aria-label={`${r} as Excel`}><FileSpreadsheet size={15} /></Button>
              <Button size="sm" variant="ghost" aria-label={`${r} as CSV`}><Download size={15} /></Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
