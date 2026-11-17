"use client";

import { useState } from "react";
import { Badge, Button, Card, PageHeader, useToast } from "@/components/ui";
import { api } from "@/lib/api";

export default function Moderation() {
  const toast = useToast();
  const [items, setItems] = useState(api.reviews.reported());
  const [photos, setPhotos] = useState(api.reviews.pendingPhotos());
  const decidePhoto = (id: string, msg: string) => { setPhotos(photos.filter((p) => p.id !== id)); toast(msg); };
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
        {items.length === 0 && <Card className="text-center text-ink-3">No reported reviews left.</Card>}
      </div>
      <h2 className="mb-3 mt-8 text-lg font-semibold">Photos waiting for approval</h2>
      <p className="mb-4 text-sm text-ink-3">Attendee photos only appear on reviews after approval. Reject photos showing children, other people&rsquo;s private details or anything offensive.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {photos.map((p) => (
          <Card key={p.id} className="flex gap-4">
            <div className="flex h-24 w-32 shrink-0 items-end rounded-lg p-2 text-[11px] font-medium text-white" style={{ background: p.tint }} role="img" aria-label={p.label}>{p.label}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink-3">{p.event}, by {p.by}</p>
              <Badge tone="gold" className="mt-1">{p.note}</Badge>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => decidePhoto(p.id, "Photo approved and shown on the review")}>Approve</Button>
                <Button size="sm" variant="secondary" onClick={() => decidePhoto(p.id, "Faces and plates blurred, photo approved")}>Blur and approve</Button>
                <Button size="sm" variant="danger" onClick={() => decidePhoto(p.id, "Photo rejected; the reviewer has been told why")}>Reject</Button>
              </div>
            </div>
          </Card>
        ))}
        {photos.length === 0 && <Card className="text-center text-ink-3 md:col-span-2">No photos waiting.</Card>}
      </div>
    </>
  );
}
