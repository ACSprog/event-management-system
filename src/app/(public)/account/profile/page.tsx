"use client";

import { useState } from "react";
import { Download, ShieldCheck, Trash2 } from "lucide-react";
import { Avatar, Badge, Button, Card, Field, Input, Modal, PageHeader, SectionTitle, Toggle, useToast } from "@/components/ui";
import { PhoneInput } from "@/components/phone-input";
import { emptyPhone, phoneError, type Phone } from "@/lib/phone";
import { genderPurpose, genders, type Gender } from "@/lib/gender";

/**
 * Attendee profile and privacy. Phone-first: the mobile number is how the
 * attendee signs in (SMS code) and how guest orders are matched to the account.
 * GET/PUT /v1/me/profile, GET/PUT /v1/me/privacy, POST /v1/me/export, POST /v1/me/delete.
 */
export default function Profile() {
  const toast = useToast();
  const [f, setF] = useState({ name: "Chanda Mulenga", email: "chanda.m@example.com", city: "Lusaka", birthday: "1994-06-12", gender: "Female" as Gender });
  const [err, setErr] = useState<{ name?: string; email?: string }>({});
  const [phoneModal, setPhoneModal] = useState(false);
  const [phone, setPhone] = useState<Phone>(emptyPhone());
  const [phoneErr, setPhoneErr] = useState<string>();
  const [del, setDel] = useState(false);
  const [priv, setPriv] = useState({ showName: true, orgMarketing: false, recommend: true, attendance: false });
  const t = (k: keyof typeof priv) => (v: boolean) => setPriv({ ...priv, [k]: v });

  const save = () => {
    const e: typeof err = {};
    if (!f.name.trim()) e.name = "Enter your name as it should appear on tickets.";
    if (f.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) e.email = "Enter a valid email, or leave it empty.";
    setErr(e);
    if (!Object.keys(e).length) toast("Profile saved. New tickets will use this name.");
  };

  return (
    <>
      <PageHeader title="Profile and privacy" sub="How you sign in, what's on your tickets, and what organisers can see." />
      <div className="space-y-6">
        <Card>
          <div className="flex flex-wrap items-center gap-4">
            <Avatar name={f.name || "?"} size={56} />
            <div className="flex-1">
              <p className="font-display text-xl font-semibold">{f.name || "Your name"}</p>
              <p className="text-sm text-ink-3">Account since March 2025 · 14 events attended</p>
            </div>
            <Badge tone="green"><ShieldCheck size={12} /> Phone verified</Badge>
          </div>
        </Card>

        <Card className="space-y-4">
          <SectionTitle title="Your details" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name on tickets" error={err.name}><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
            <Field label="Email (optional)" hint="For receipts and ticket copies" error={err.email}><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
            <Field label="Gender" hint={genderPurpose}><select value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value as Gender })} className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm">{genders.map((g) => <option key={g}>{g}</option>)}</select></Field>
            <Field label="Home city"><Input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} /></Field>
            <Field label="Birthday (optional)" hint="Only used for age-restricted events and birthday offers you opt into"><Input type="date" value={f.birthday} onChange={(e) => setF({ ...f, birthday: e.target.value })} /></Field>
          </div>
          <Button onClick={save}>Save details</Button>
        </Card>

        <Card className="space-y-3">
          <SectionTitle title="Sign-in" />
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div><p className="font-semibold">Mobile number</p><p className="text-ink-3">🇿🇲 +260 97 ••• 567 · you sign in with a 6-digit SMS code</p></div>
            <Button size="sm" variant="secondary" onClick={() => setPhoneModal(true)}>Change number</Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 text-sm">
            <div><p className="font-semibold">Google sign-in</p><p className="text-ink-3">Not connected</p></div>
            <Button size="sm" variant="secondary" onClick={() => toast("Opens Google to connect your account")}>Connect</Button>
          </div>
          <p className="border-t border-line pt-3 text-sm text-ink-3">Tickets you bought as a guest with 0971 ••• 567 were added to this account automatically.</p>
        </Card>

        <Card>
          <SectionTitle title="Privacy" />
          <div className="divide-y divide-line">
            <Toggle checked={priv.showName} onChange={t("showName")} label="Show my first name and initial on public reviews" />
            <Toggle checked={priv.recommend} onChange={t("recommend")} label="Use my saved interests and purchases for recommendations" />
            <Toggle checked={priv.orgMarketing} onChange={t("orgMarketing")} label="Let organisers I've bought from send me offers" />
            <Toggle checked={priv.attendance} onChange={t("attendance")} label="Show my attendance on the event's public page" />
          </div>
          <p className="mt-3 text-xs text-ink-3">Organisers always receive your name and ticket details for events you attend, so they can admit you. Messages about your tickets are always sent.</p>
        </Card>

        <Card className="space-y-3">
          <SectionTitle title="Your data" />
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => toast("We'll send a download link by SMS within 24 hours")}><Download size={16} /> Download my data</Button>
            <Button variant="danger" onClick={() => setDel(true)}><Trash2 size={16} /> Delete my account</Button>
          </div>
          <p className="text-xs text-ink-3">Under Zambia&rsquo;s Data Protection Act 2021 you can ask for a copy of your data or for it to be deleted. Order records are kept for tax purposes.</p>
        </Card>
      </div>

      <Modal open={phoneModal} onClose={() => setPhoneModal(false)} title="Change mobile number" footer={<><Button variant="ghost" onClick={() => setPhoneModal(false)}>Cancel</Button><Button onClick={() => { const e = phoneError(phone); setPhoneErr(e); if (e) return; setPhoneModal(false); setPhone(emptyPhone()); toast("We sent a 6-digit code to the new number. Your tickets move once you confirm it."); }}>Send code</Button></>}>
        <Field label="New mobile number" error={phoneErr}><PhoneInput value={phone} onChange={(p) => { setPhone(p); setPhoneErr(undefined); }} invalid={!!phoneErr} /></Field>
      </Modal>
      <Modal open={del} onClose={() => setDel(false)} title="Delete your account?" footer={<><Button variant="ghost" onClick={() => setDel(false)}>Keep my account</Button><Button variant="danger" onClick={() => { setDel(false); toast("Request received. We'll confirm by SMS before anything is deleted."); }}>Delete account</Button></>}>
        <p className="text-sm text-ink-2">Your upcoming tickets stop working and can&rsquo;t be recovered. Transfer them first if someone else will use them. We confirm by SMS before deleting.</p>
      </Modal>
    </>
  );
}
