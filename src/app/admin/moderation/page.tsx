"use client";

import { useState } from "react";
import { Badge, Button, Card, PageHeader, useToast } from "@/components/ui";
import { api } from "@/lib/api";

export default function Moderation() {
  const toast = useToast();
  const [items, setItems] = useState(api.reviews.reported());
  const decide = (id: string, msg: string) => { setItems(items.filter((i) => i.id !== id)); toast(msg); };
  return (
    <>
      <PageHeader title="Review moderation" sub="Reviews are removed only for abuse, spam, hate speech or personal data. Disagreement is not a reason to remove a review." />
      <div className="space-y-4">
        {items.map((r) => (
          <Card key={r.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="text-sm text-ink-3">{r.event}</p><p className="mt-1 text-ink">&ldquo;{r.excerpt}&rdquo;</p></div>
              <div className="flex gap-2"><Badge tone={r.reason === "Organiser disputes" ? "gold" : "red"}>{r.reason}</Badge><Badge>{r.reports} reports</Badge></div>
            </div>
            <p className="mt-2 text-xs text-ink-3">Reported by {r.by}. {r.status}.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => decide(r.id, "Review kept. Reporters notified.")}>Keep review</Button>
              <Button size="sm" variant="secondary" onClick={() => decide(r.id, "Personal details removed; review stays up.")}>Edit out personal data</Button>
              <Button size="sm" variant="danger" onClick={() => decide(r.id, "Review removed and logged in the moderation trail.")}>Remove</Button>
            </div>
          </Card>
        ))}
        {items.length === 0 && <Card className="text-center text-ink-3">Nothing left to review. Nice work.</Card>}
      </div>
    </>
  );
}
