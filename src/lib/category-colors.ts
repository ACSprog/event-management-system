import type { Category } from "@/lib/mock/data";

/**
 * One colour per event category, used on the public site so Discover and the
 * homepage look varied at a glance: the dot on category chips, the label on
 * event cards and the "Browse by type" tiles. Organiser and super admin screens
 * keep the calm teal theme and don't use these.
 *
 * `fg` is readable on white and on the dark theme's surface; `palette` is the
 * two-colour gradient for category tiles.
 */
export const categoryColor: Record<Category, { fg: string; palette: [string, string] }> = {
  Music: { fg: "#C2410C", palette: ["#F97316", "#7C2D12"] },
  Nightlife: { fg: "#A21CAF", palette: ["#C026D3", "#3B0764"] },
  Comedy: { fg: "#B45309", palette: ["#F4A630", "#9A3412"] },
  "Arts and theatre": { fg: "#BE185D", palette: ["#DB2777", "#4C0519"] },
  Film: { fg: "#4338CA", palette: ["#6366F1", "#1E1B4B"] },
  "Food and drink": { fg: "#B91C1C", palette: ["#EF4444", "#7F1D1D"] },
  "Family and kids": { fg: "#C2410C", palette: ["#FB923C", "#C2410C"] },
  Church: { fg: "#7E22CE", palette: ["#9333EA", "#F4A630"] },
  Wedding: { fg: "#BE123C", palette: ["#FB7185", "#881337"] },
  Sports: { fg: "#15803D", palette: ["#22C55E", "#14532D"] },
  Fitness: { fg: "#0F766E", palette: ["#14B8A6", "#134E4A"] },
  Conference: { fg: "#1D4ED8", palette: ["#3B82F6", "#172554"] },
  Business: { fg: "#334155", palette: ["#475569", "#0F172A"] },
  Technology: { fg: "#0369A1", palette: ["#0EA5E9", "#0C4A6E"] },
  Education: { fg: "#0B7A75", palette: ["#0B7A75", "#172033"] },
  Workshop: { fg: "#A16207", palette: ["#EAB308", "#713F12"] },
  Exhibition: { fg: "#166534", palette: ["#16A34A", "#F4A630"] },
  Charity: { fg: "#B45309", palette: ["#F59E0B", "#78350F"] },
};

export const catColor = (c: string) => categoryColor[c as Category] ?? { fg: "#0B7A75", palette: ["#0B7A75", "#172033"] as [string, string] };
