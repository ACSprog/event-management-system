"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart, Legend } from "recharts";

const axis = { stroke: "var(--ink-3)", fontSize: 12, tickLine: false, axisLine: false };
const tip = { contentStyle: { background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8, fontSize: 13, color: "var(--ink)" } };

export function AreaTrend({ data, x, y, height = 240, money }: { data: Record<string, unknown>[]; x: string; y: string; height?: number; money?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`g-${y}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--kafue)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--kafue)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--line)" />
        <XAxis dataKey={x} {...axis} minTickGap={24} />
        <YAxis {...axis} width={56} tickFormatter={(v) => (money ? `K${v >= 1e6 ? (v / 1e6).toFixed(1) + "M" : v >= 1e3 ? Math.round(v / 1e3) + "k" : v}` : v >= 1e3 ? `${Math.round(v / 1e3)}k` : v)} />
        <Tooltip {...tip} formatter={(v) => (money ? `K${Number(v).toLocaleString()}` : Number(v).toLocaleString())} />
        <Area type="monotone" dataKey={y} stroke="var(--kafue)" strokeWidth={2} fill={`url(#g-${y})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const palette = ["var(--kafue)", "var(--marigold)", "#6b5bd6", "var(--hibiscus)"];

export function Bars({ data, x, keys, height = 240, stacked, labels }: { data: Record<string, unknown>[]; x: string; keys: string[]; height?: number; stacked?: boolean; labels?: string[] }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--line)" />
        <XAxis dataKey={x} {...axis} />
        <YAxis {...axis} width={48} tickFormatter={(v) => (v >= 1e3 ? `${Math.round(v / 1e3)}k` : v)} />
        <Tooltip {...tip} cursor={{ fill: "var(--surface-2)" }} />
        {keys.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {keys.map((k, i) => (
          <Bar key={k} dataKey={k} name={labels?.[i] ?? k} stackId={stacked ? "s" : undefined} fill={palette[i]} radius={stacked && i < keys.length - 1 ? 0 : [4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Lines({ data, x, keys, height = 240, labels, yDomain }: { data: Record<string, unknown>[]; x: string; keys: string[]; height?: number; labels?: string[]; yDomain?: [number, number] }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--line)" />
        <XAxis dataKey={x} {...axis} />
        <YAxis {...axis} width={56} domain={yDomain ?? [0, "auto"]} tickFormatter={(v) => (v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${Math.round(v / 1e3)}k` : v)} />
        <Tooltip {...tip} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {keys.map((k, i) => (
          <Line key={k} dataKey={k} name={labels?.[i] ?? k} stroke={palette[i]} strokeWidth={2} dot={data.length < 10} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
