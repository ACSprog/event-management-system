"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Clock, Copy, MapPin, Plus, Printer, Trash2, User } from "lucide-react";
import { Badge, Button, cx, Input, Select } from "@/components/ui";
import { programmeKinds, type ProgrammeItem } from "@/lib/api";

const sortItems = (items: ProgrammeItem[], days: string[]) =>
  [...items].sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day) || a.start.localeCompare(b.start));

const kindTone: Record<string, "teal" | "gold" | "grey" | "green"> = { Performance: "gold", Match: "gold", Ceremony: "teal", Worship: "teal", Talk: "teal", Panel: "teal", Session: "teal", Break: "grey", Meal: "green", Networking: "green", Activity: "grey" };

/* ------------------------------------------------------------------ */
/* Public view                                                         */
/* ------------------------------------------------------------------ */

/** The running order on the event page: one tab per day, filter by stage or room. */
export function ProgrammeView({ items, title = "Programme" }: { items: ProgrammeItem[]; title?: string }) {
  const days = useMemo(() => [...new Set(items.map((x) => x.day))], [items]);
  const [day, setDay] = useState(days[0]);
  const places = [...new Set(items.filter((x) => x.day === day && x.where).map((x) => x.where!))];
  const [place, setPlace] = useState("Everywhere");
  const [all, setAll] = useState(false);
  if (!items.length) return null;
  const list = sortItems(items, days).filter((x) => x.day === day && (place === "Everywhere" || x.where === place));
  const shown = all ? list : list.slice(0, 8);

  return (
    <section id="programme" className="mt-10 scroll-mt-20">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-medium hover:bg-surface-2"><Printer size={15} /> Print or save as PDF</button>
      </div>
      {days.length > 1 && (
        <div className="mt-4 flex gap-1 overflow-x-auto border-b border-line" role="tablist" aria-label="Programme days">
          {days.map((d) => (
            <button key={d} role="tab" aria-selected={d === day} onClick={() => { setDay(d); setPlace("Everywhere"); }} className={cx("-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium", d === day ? "border-kafue text-ink" : "border-transparent text-ink-3 hover:text-ink")}>{d}</button>
          ))}
        </div>
      )}
      {places.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["Everywhere", ...places].map((p) => (
            <button key={p} onClick={() => setPlace(p)} aria-pressed={place === p} className={cx("rounded-full border px-3 py-1 text-xs font-medium", place === p ? "border-kafue bg-kafue-soft text-kafue-ink" : "border-line text-ink-2 hover:border-ink-3")}>{p}</button>
          ))}
        </div>
      )}
      <ol className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface">
        {shown.map((x) => (
          <li key={x.id} className="grid grid-cols-[84px_1fr] gap-4 px-4 py-3 sm:grid-cols-[110px_1fr]">
            <div className="font-display text-sm font-semibold tabular-nums text-kafue">
              {x.start}{x.end && <span className="block text-xs font-normal text-ink-3">to {x.end}</span>}
            </div>
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 font-semibold">{x.title} {x.kind !== "Activity" && <Badge tone={kindTone[x.kind] ?? "grey"}>{x.kind}</Badge>}</p>
              {(x.who || x.where) && (
                <p className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-sm text-ink-3">
                  {x.who && <span className="flex items-center gap-1"><User size={13} />{x.who}</span>}
                  {x.where && <span className="flex items-center gap-1"><MapPin size={13} />{x.where}</span>}
                </p>
              )}
              {x.detail && <p className="mt-1 text-sm text-ink-2">{x.detail}</p>}
            </div>
          </li>
        ))}
      </ol>
      {list.length > 8 && <button onClick={() => setAll(!all)} className="mt-2 text-sm font-semibold text-kafue">{all ? "Show less" : `Show all ${list.length} items`}</button>}
      <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-3"><Clock size={12} /> Times are Lusaka time and may change. Ticket holders are told about changes by SMS or email.</p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Organiser editor                                                    */
/* ------------------------------------------------------------------ */

const blank = (day: string): ProgrammeItem => ({ id: `n${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, day, start: "", end: "", title: "", kind: "Session", who: "", where: "", detail: "" });

/** Problems worth flagging: missing names, end before start, two things at once on the same stage. */
export function programmeIssues(items: ProgrammeItem[]) {
  const out: string[] = [];
  items.forEach((x) => {
    if (!x.title.trim()) out.push("Every item needs a title.");
    if (!x.start) out.push(`"${x.title || "An item"}" needs a start time.`);
    if (x.end && x.start && x.end <= x.start && !(x.end < "06:00")) out.push(`"${x.title}" ends before it starts.`);
  });
  items.forEach((a, i) => items.slice(i + 1).forEach((b) => {
    if (a.day === b.day && a.where && a.where === b.where && a.start && b.start && a.end && b.end && a.start < b.end && b.start < a.end && a.end > a.start && b.end > b.start)
      out.push(`"${a.title}" and "${b.title}" overlap at ${a.where}.`);
  }));
  return [...new Set(out)];
}

export function ProgrammeEditor({ items, onChange, defaultDay, templates, templateFor }: {
  items: ProgrammeItem[];
  onChange: (items: ProgrammeItem[]) => void;
  defaultDay: string;
  templates?: Record<string, Omit<ProgrammeItem, "id" | "day">[]>;
  templateFor?: string;
}) {
  const days = [...new Set([defaultDay, ...items.map((x) => x.day)])];
  const [newDay, setNewDay] = useState("");
  const issues = programmeIssues(items);
  const kinds = [...programmeKinds];
  const set = (id: string, patch: Partial<ProgrammeItem>) => onChange(items.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const move = (id: string, dir: -1 | 1) => {
    const i = items.findIndex((x) => x.id === id);
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const template = templateFor && templates?.[templateFor];

  return (
    <div className="space-y-4">
      {!items.length && (
        <div className="rounded-lg border-2 border-dashed border-line p-5 text-center text-sm text-ink-3">
          <p>No programme yet. Add items one by one{template ? ", or start from a typical running order and change it" : ""}.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {template && <Button size="sm" variant="secondary" onClick={() => onChange(template.map((t, i) => ({ ...blank(defaultDay), ...t, id: `t${i}${Date.now().toString(36)}` })))}>Use a typical {templateFor!.split(" or ")[0].toLowerCase()} programme</Button>}
            <Button size="sm" onClick={() => onChange([blank(defaultDay)])}><Plus size={14} /> Add the first item</Button>
          </div>
        </div>
      )}

      {days.map((d) => {
        const list = items.filter((x) => x.day === d);
        if (!list.length) return null;
        return (
          <div key={d} className="rounded-lg border border-line">
            <div className="flex items-center justify-between gap-2 border-b border-line bg-surface-2 px-3 py-2">
              <div className="w-56"><Input aria-label="Day name" className="h-8 text-sm font-semibold" value={d} onChange={(e) => onChange(items.map((x) => (x.day === d ? { ...x, day: e.target.value } : x)))} /></div>
              <Button size="sm" variant="ghost" onClick={() => onChange([...items, blank(d)])}><Plus size={14} /> Add to {d}</Button>
            </div>
            <ul className="divide-y divide-line">
              {list.map((x) => (
                <li key={x.id} className="grid gap-2 p-3 sm:grid-cols-8">
                  <div className="sm:col-span-2"><Input aria-label="Starts" type="time" value={x.start} onChange={(e) => set(x.id, { start: e.target.value })} /></div>
                  <div className="sm:col-span-2"><Input aria-label="Ends" type="time" value={x.end ?? ""} onChange={(e) => set(x.id, { end: e.target.value })} /></div>
                  <div className="sm:col-span-4"><Input aria-label="What happens" placeholder="What happens, e.g. Keynote, First dance" value={x.title} onChange={(e) => set(x.id, { title: e.target.value })} /></div>
                  <div className="space-y-2 sm:col-span-2">
                    <Select aria-label="Type" value={kinds.includes(x.kind as never) ? x.kind : "Other"} onChange={(e) => set(x.id, { kind: e.target.value === "Other" ? "" : e.target.value })} options={[...kinds, "Other"]} />
                    {!kinds.includes(x.kind as never) && <Input aria-label="Type of item" placeholder="Type, e.g. Raffle, Fashion show" value={x.kind} onChange={(e) => set(x.id, { kind: e.target.value })} />}
                  </div>
                  <div className="sm:col-span-3"><Input aria-label="Who" placeholder="Speaker, performer or host" value={x.who ?? ""} onChange={(e) => set(x.id, { who: e.target.value })} /></div>
                  <div className="sm:col-span-3"><Input aria-label="Where" placeholder="Stage, room or area" value={x.where ?? ""} onChange={(e) => set(x.id, { where: e.target.value })} /></div>
                  <div className="sm:col-span-6"><Input aria-label="Details" placeholder="Details for guests (optional)" value={x.detail ?? ""} onChange={(e) => set(x.id, { detail: e.target.value })} /></div>
                  <div className="flex items-center justify-end sm:col-span-2">
                    <Button size="sm" variant="ghost" aria-label="Move up" onClick={() => move(x.id, -1)}><ArrowUp size={14} /></Button>
                    <Button size="sm" variant="ghost" aria-label="Move down" onClick={() => move(x.id, 1)}><ArrowDown size={14} /></Button>
                    <Button size="sm" variant="ghost" aria-label="Duplicate" onClick={() => onChange([...items, { ...x, id: blank(d).id }])}><Copy size={14} /></Button>
                    <Button size="sm" variant="ghost" aria-label="Remove" onClick={() => onChange(items.filter((y) => y.id !== x.id))}><Trash2 size={14} /></Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      {items.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => onChange([...items, blank(days[days.length - 1])])}><Plus size={14} /> Add an item</Button>
          <div className="w-52"><Input aria-label="New day name" className="h-8 text-sm" placeholder="e.g. Day 2, Sat 13 Dec" value={newDay} onChange={(e) => setNewDay(e.target.value)} /></div>
          <Button size="sm" variant="ghost" disabled={!newDay.trim() || days.includes(newDay.trim())} onClick={() => { onChange([...items, blank(newDay.trim())]); setNewDay(""); }}>Add a day</Button>
          <Button size="sm" variant="ghost" onClick={() => onChange(sortItems(items, days))}>Sort by time</Button>
        </div>
      )}
      {issues.length > 0 && (
        <ul className="list-disc space-y-0.5 rounded-lg bg-marigold-soft px-6 py-2 text-sm">{issues.slice(0, 5).map((m) => <li key={m}>{m}</li>)}</ul>
      )}
    </div>
  );
}
