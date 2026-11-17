"use client";

import { useState } from "react";
import { Button, Card, cx, Field, Input, PageHeader, Textarea, useToast } from "@/components/ui";

const templates = [
  ["Registration confirmation", "You're registered for {{event}}", "Hi {{first_name}}, you're registered for {{event}} on {{date}} at {{venue}}. Your entry code: {{ticket_link}}"],
  ["Ticket purchase", "Your tickets for {{event}}", "Hi {{first_name}}, you're going to {{event}} on {{date}}! Your tickets: {{ticket_link}}"],
  ["Payment confirmation", "Payment received: {{amount}}", "We received {{amount}} via {{method}}. Booking {{reference}}."],
  ["Event reminder", "{{event}} is tomorrow", "Gates open {{time}} at {{venue}}. Have your QR code ready: {{ticket_link}}"],
  ["Event changed", "Update: {{event}}", "{{organiser}} changed {{change}}. Your tickets still work. Need a refund? {{refund_link}}"],
  ["Cancellation", "{{event}} has been cancelled", "We're sorry. Your refund of {{amount}} is on its way to {{method}}."],
  ["Refund update", "Refund {{status}}", "Your refund of {{amount}} is {{status}}."],
  ["Classroom enrolment", "Welcome to {{course}}", "Your first lesson is {{date}}. Your personal Zoom link: {{join_link}}"],
  ["Course reminder", "{{course}}: lesson {{lesson_number}} starts soon", "Your lesson '{{lesson_title}}' starts at {{time}}. Join with your personal link: {{join_link}}"],
  ["Certificate", "Your certificate for {{course}}", "Congratulations! Download it here: {{certificate_link}}"],
  ["Review request", "How was {{event}}?", "Tell others what it was like. It takes a minute: {{review_link}}"],
];

export default function Templates() {
  const toast = useToast();
  const [i, setI] = useState(0);
  return (
    <>
      <PageHeader title="Notification templates" sub="Platform defaults. Organisations can override wording but not remove legal or unsubscribe text." />
      <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
        <Card pad={false}><ul className="p-2">{templates.map(([n], j) => <li key={n}><button onClick={() => setI(j)} className={cx("w-full rounded-lg px-3 py-2 text-left text-sm", i === j ? "bg-kafue-soft font-semibold text-kafue-ink" : "hover:bg-surface-2")}>{n}</button></li>)}</ul></Card>
        <Card className="space-y-4" key={i}>
          <Field label="Email subject"><Input defaultValue={templates[i][1]} /></Field>
          <Field label="Message (email, SMS and push)"><Textarea rows={5} defaultValue={templates[i][2]} /></Field>
          <p className="text-xs text-ink-3">Placeholders in double braces are filled in automatically. Transactional messages ignore marketing opt-outs; promotional ones never do.</p>
          <div className="flex justify-end"><Button onClick={() => toast("Template saved")}>Save template</Button></div>
        </Card>
      </div>
    </>
  );
}
