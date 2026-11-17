"use client";

import { useState } from "react";
import { Button, Card, Field, Input, PageHeader, SectionTitle, Select, Toggle, useToast } from "@/components/ui";

export default function PlatformSettings() {
  const toast = useToast();
  const [s, setS] = useState({ signups: true, approval: true, mfa: true, discovery: true, maintenance: false, reviews: true, photos: true });
  const t = (k: keyof typeof s) => (v: boolean) => setS({ ...s, [k]: v });
  return (
    <>
      <PageHeader title="Platform settings" sub="Apply to every organisation and attendee." actions={<Button onClick={() => toast("Platform settings saved and logged")}>Save changes</Button>} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <SectionTitle title="Platform details" />
          <Field label="Platform name"><Input defaultValue="Event Management System" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Support email"><Input defaultValue="support@eventra.example" /></Field>
            <Field label="Support phone"><Input defaultValue="+260 211 000 000" /></Field>
            <Field label="Default currency"><Select options={["ZMW (K)", "USD ($)"]} /></Field>
            <Field label="Default time zone"><Select options={["Africa/Lusaka (CAT, UTC+2)"]} /></Field>
          </div>
        </Card>
        <Card className="space-y-1">
          <SectionTitle title="Organisers" />
          <Toggle checked={s.signups} onChange={t("signups")} label="Allow new organisations to register" />
          <Toggle checked={s.approval} onChange={t("approval")} label="Check each organisation before its first paid event" />
          <Toggle checked={s.mfa} onChange={t("mfa")} label="Require 2-step sign-in for organisation admins and finance" />
          <div className="pt-2"><Field label="Hold payouts until" hint="Protects buyers if an event is cancelled"><Select options={["3 days after the event", "7 days after the event", "Weekly for courses"]} /></Field></div>
        </Card>
        <Card className="space-y-1">
          <SectionTitle title="Attendees and discovery" />
          <Toggle checked={s.discovery} onChange={t("discovery")} label="Show events from all organisers in platform-wide discovery" />
          <div className="py-2"><Field label="Most promotional alerts per person per week" hint="Ticket and payment messages are never limited"><Select options={["2", "3", "5"]} defaultValue="3" /></Field></div>
          <div className="py-2"><Field label="Quiet hours (no promotional alerts)"><Select options={["21:00 to 07:00", "22:00 to 07:00"]} /></Field></div>
        </Card>
        <Card className="space-y-1">
          <SectionTitle title="Reviews" />
          <Toggle checked={s.reviews} onChange={t("reviews")} label="Allow reviews from people without a verified ticket (labelled Not verified)" />
          <Toggle checked={s.photos} onChange={t("photos")} label="Allow photos on reviews (moderated before showing)" />
          <div className="py-2"><Field label="Reviewers can edit for"><Select options={["7 days", "14 days", "30 days"]} defaultValue="14 days" /></Field></div>
        </Card>
        <Card className="space-y-2 xl:col-span-2">
          <SectionTitle title="Data protection" sub="Zambia Data Protection Act No. 3 of 2021" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Delete inactive attendee accounts after"><Select options={["3 years", "5 years", "Never"]} /></Field>
            <Field label="Keep financial records for"><Select options={["7 years", "10 years"]} /></Field>
            <Field label="Answer data requests within"><Select options={["30 days", "14 days"]} /></Field>
          </div>
          <Toggle checked={s.maintenance} onChange={t("maintenance")} label="Maintenance mode: show a notice and pause new purchases" />
        </Card>
      </div>
    </>
  );
}
