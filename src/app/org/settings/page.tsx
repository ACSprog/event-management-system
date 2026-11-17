"use client";

import { SelectOther } from "@/components/select-other";

import { useState } from "react";
import { Button, Card, cx, Field, Input, PageHeader, SectionTitle, Select, Textarea, Toggle, useToast } from "@/components/ui";

const swatches = ["#0B7A75", "#172033", "#5B2A86", "#D62F45", "#1F9D55", "#C77C3A"];

export default function Settings() {
  const toast = useToast();
  const [color, setColor] = useState(swatches[1]);
  const [approval, setApproval] = useState(true);
  const [mfa, setMfa] = useState(true);
  return (
    <>
      <PageHeader title="Settings" actions={<Button onClick={() => toast("Settings saved")}>Save changes</Button>} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <SectionTitle title="Organisation profile" />
          <Field label="Name"><Input defaultValue="Zed Live Entertainment" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="PACRA number"><Input defaultValue="120110034871" /></Field>
            <Field label="TPIN (for tax invoices)"><Input defaultValue="1002448810" /></Field>
          </div>
          <Field label="About"><Textarea defaultValue="Lusaka's biggest live music promoter since 2011." /></Field>
        </Card>
        <Card className="space-y-4">
          <SectionTitle title="Branding" sub="Used on your organiser page, event pages and ticket emails" />
          <Field label="Logo"><div className="rounded-lg border-2 border-dashed border-line p-5 text-center text-sm text-ink-3">Upload a square PNG or SVG</div></Field>
          <div><p className="mb-2 text-sm font-medium">Brand colour</p><div className="flex gap-2">{swatches.map((s) => <button key={s} onClick={() => setColor(s)} aria-label={`Use ${s}`} className={cx("h-9 w-9 rounded-full ring-offset-2 ring-offset-surface", color === s && "ring-2 ring-kafue")} style={{ background: s }} />)}</div></div>
          <p className="text-xs text-ink-3">Text contrast is checked automatically so pages stay readable.</p>
        </Card>
        <Card className="space-y-2">
          <SectionTitle title="Event rules" />
          <Toggle checked={approval} onChange={setApproval} label="Events need admin approval before publishing" />
          <div className="pt-2"><SelectOther label="Default refund policy" options={["Refunds until 7 days before", "Refunds until 48 hours before", "No refunds, transfers allowed"]} other="Write our own policy" prompt="Your refund policy" multiline placeholder="Used for new events unless you change it" /></div>
          <div className="pt-2"><Field label="Default time zone"><Select options={["Africa/Lusaka (CAT, UTC+2)"]} /></Field></div>
        </Card>
        <Card className="space-y-2">
          <SectionTitle title="Security" />
          <Toggle checked={mfa} onChange={setMfa} label="Require 2-step sign-in for admins and finance" />
          <p className="text-sm text-ink-3">Sessions expire after 12 hours. Scanner logins expire when the event ends.</p>
          <Button variant="secondary" size="sm" href="/admin/audit/">View activity log</Button>
        </Card>
      </div>
    </>
  );
}
