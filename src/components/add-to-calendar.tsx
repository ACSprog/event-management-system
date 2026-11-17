"use client";

import { CalendarPlus } from "lucide-react";
import { useState } from "react";
import { cx } from "@/components/ui";

const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Add-to-calendar menu: Google, Outlook and a standard .ics file (Apple Calendar and others). */
export function AddToCalendar({ title, start, end, location, details, className }: { title: string; start: string; end: string; location: string; details?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${stamp(start)}/${stamp(end)}&location=${encodeURIComponent(location)}&details=${encodeURIComponent(details ?? "")}&ctz=Africa/Lusaka`;
  const outlook = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${encodeURIComponent(new Date(start).toISOString())}&enddt=${encodeURIComponent(new Date(end).toISOString())}&location=${encodeURIComponent(location)}`;
  const ics = () => {
    const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//EMS//EN", "BEGIN:VEVENT", `UID:${stamp(start)}-${title.replace(/\W/g, "")}@ems`, `DTSTAMP:${stamp(new Date().toISOString())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`, `SUMMARY:${title}`, `LOCATION:${location}`, `DESCRIPTION:${(details ?? "").replace(/\n/g, "\\n")}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const url = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url; a.download = `${title.replace(/[^\w ]/g, "").trim() || "event"}.ics`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setOpen(false);
  };
  return (
    <div className={cx("relative", className)}>
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-medium hover:bg-surface-2">
        <CalendarPlus size={15} /> Add to calendar
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-52 rounded-lg border border-line bg-surface p-1 shadow-lg">
          <a href={google} target="_blank" rel="noopener noreferrer" className="block rounded-md px-3 py-2 text-sm hover:bg-surface-2">Google Calendar</a>
          <a href={outlook} target="_blank" rel="noopener noreferrer" className="block rounded-md px-3 py-2 text-sm hover:bg-surface-2">Outlook</a>
          <button onClick={ics} className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-surface-2">Apple or other (.ics file)</button>
        </div>
      )}
    </div>
  );
}
