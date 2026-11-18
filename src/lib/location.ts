/**
 * Event locations.
 *
 * An organiser can set where an event happens by pasting a map link, dropping a
 * pin, searching, using their current position or typing a plus code. Whatever
 * they use, we end up with the same EventLocation, which they confirm on a map
 * before saving. Landmark directions in their own words go with it, because in
 * Zambia "opposite Shoprite, left after the green gate" often matters more than
 * an address.
 */
import { OpenLocationCode } from "open-location-code";

export type LocationSource = "LINK" | "PIN" | "SEARCH" | "CURRENT" | "PLUS_CODE";

export interface EventLocation {
  lat: number;
  lng: number;
  /** Place or venue name, as the organiser wants it shown. */
  name: string;
  /** Town or neighbourhood, shown to everyone when the exact spot is private. */
  area: string;
  /** Google place ID when the location came from a Google link or search (the only Google field we keep). */
  placeId?: string;
  source: LocationSource;
  /** "Opposite Shoprite, turn left after the green gate" */
  directions: string;
  /** A private home: exact pin and directions only for invited guests and ticket holders, and never suggested to other organisers. */
  privateHome: boolean;
}

export const lusaka = { lat: -15.4167, lng: 28.2833 };

/** Town centres, used to find the nearest town and to complete short plus codes such as "5GJC+2X Lusaka". */
export const towns: { name: string; lat: number; lng: number }[] = [
  { name: "Lusaka", lat: -15.4167, lng: 28.2833 },
  { name: "Kitwe", lat: -12.8024, lng: 28.2132 },
  { name: "Ndola", lat: -12.9587, lng: 28.6366 },
  { name: "Livingstone", lat: -17.8419, lng: 25.8543 },
  { name: "Kabwe", lat: -14.4469, lng: 28.4464 },
  { name: "Chingola", lat: -12.5289, lng: 27.8491 },
  { name: "Mufulira", lat: -12.5498, lng: 28.2405 },
  { name: "Luanshya", lat: -13.1367, lng: 28.4166 },
  { name: "Chililabombwe", lat: -12.3672, lng: 27.8278 },
  { name: "Kalulushi", lat: -12.8417, lng: 28.0944 },
  { name: "Solwezi", lat: -12.1688, lng: 26.3894 },
  { name: "Chipata", lat: -13.6333, lng: 32.65 },
  { name: "Kasama", lat: -10.2129, lng: 31.1808 },
  { name: "Mansa", lat: -11.1998, lng: 28.8943 },
  { name: "Mongu", lat: -15.2484, lng: 23.1274 },
  { name: "Choma", lat: -16.8065, lng: 26.9531 },
  { name: "Mazabuka", lat: -15.8563, lng: 27.7482 },
  { name: "Kafue", lat: -15.7691, lng: 28.1814 },
  { name: "Siavonga", lat: -16.5383, lng: 28.7087 },
  { name: "Petauke", lat: -14.2433, lng: 31.3253 },
];

function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const r = Math.PI / 180;
  const x = (b.lng - a.lng) * r * Math.cos(((a.lat + b.lat) / 2) * r);
  const y = (b.lat - a.lat) * r;
  return Math.sqrt(x * x + y * y) * 6371;
}

/** Nearest town within 40 km, for the public "area" label. */
export function nearestTown(p: { lat: number; lng: number }): string {
  const t = [...towns].sort((a, b) => km(p, a) - km(p, b))[0];
  return km(p, t) <= 40 ? t.name : `${km(p, t).toFixed(0)} km from ${t.name}`;
}

export const validCoords = (lat: number, lng: number) => Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && !(lat === 0 && lng === 0);

const olc = new OpenLocationCode();

/** "5GJC+2X Lusaka", "5GJC+2X" or "5G8M5GJC+2X" → coordinates. */
export function parsePlusCode(text: string, near = lusaka): { lat: number; lng: number; town?: string } | null {
  const m = text.trim().toUpperCase().match(/^([23456789CFGHJMPQRVWX]{2,8}\+[23456789CFGHJMPQRVWX]{0,3})\s*,?\s*(.*)$/);
  if (!m) return null;
  let code = m[1];
  const townName = m[2].trim();
  const town = townName ? towns.find((t) => t.name.toLowerCase() === townName.toLowerCase().replace(/,.*$/, "").trim()) : undefined;
  try {
    if (!olc.isFull(code)) {
      if (!olc.isShort(code)) return null;
      const ref = town ?? near;
      code = olc.recoverNearest(code, ref.lat, ref.lng);
    }
    const a = olc.decode(code);
    return { lat: a.latitudeCenter, lng: a.longitudeCenter, town: town?.name };
  } catch {
    return null;
  }
}

/** Plus code for a point, shown on the confirmation so organisers can share it. */
export function plusCodeFor(lat: number, lng: number): string {
  const full = olc.encode(lat, lng, 10);
  const t = [...towns].sort((a, b) => km({ lat, lng }, a) - km({ lat, lng }, b))[0];
  // Drop the first four characters near a town, the way Google shows codes ("5GJC+2X Lusaka").
  return km({ lat, lng }, t) < 30 ? `${full.slice(4)} ${t.name}` : full;
}

export type LinkResult =
  | { kind: "ok"; lat: number; lng: number; name?: string; placeId?: string }
  | { kind: "short"; url: string }
  | { kind: "name-only"; name: string }
  | { kind: "invalid" };

const shortHosts = ["maps.app.goo.gl", "goo.gl", "g.co"];

/**
 * Reads a map link or pasted coordinates.
 * Handles full Google Maps links (/place/Name/@lat,lng and !3d!4d), ?q= and ?ll=
 * links, Apple Maps links, geo: links and plain "lat, lng". Short links
 * (maps.app.goo.gl) only say where to go, so the server opens them.
 */
export function parseMapLink(input: string): LinkResult {
  const text = input.trim();
  if (!text) return { kind: "invalid" };

  const plain = text.match(/^(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)$/);
  if (plain) return validCoords(+plain[1], +plain[2]) ? { kind: "ok", lat: +plain[1], lng: +plain[2] } : { kind: "invalid" };

  const geo = text.match(/^geo:(-?\d+\.?\d*),(-?\d+\.?\d*)/i);
  if (geo) return validCoords(+geo[1], +geo[2]) ? { kind: "ok", lat: +geo[1], lng: +geo[2] } : { kind: "invalid" };

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return { kind: "invalid" };
  }
  const host = url.hostname.replace(/^www\./, "");
  if (shortHosts.includes(host) && (host !== "goo.gl" || url.pathname.startsWith("/maps"))) return { kind: "short", url: url.toString() };
  const isMaps = /(^|\.)google\.[a-z.]+$/.test(host) || host === "maps.apple.com" || host === "maps.google.com";
  if (!isMaps) return { kind: "invalid" };

  const decoded = decodeURIComponent(url.href);
  const name = decoded.match(/\/maps\/place\/([^/@]+)/)?.[1]?.replace(/\+/g, " ").trim();
  const placeId = url.searchParams.get("query_place_id") ?? decoded.match(/!1s(ChIJ[\w-]+)/)?.[1] ?? undefined;

  // The pin itself (!3d!4d) is more precise than the map's centre (@lat,lng).
  const pin = decoded.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  const centre = decoded.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  const params = ["q", "query", "ll", "sll", "destination", "daddr", "center"].map((k) => url.searchParams.get(k)).filter((v): v is string => !!v);
  const q = params.map((v) => v.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/)).find(Boolean);
  const qParam = params.find((v) => !/^-?\d/.test(v));
  const hit = pin ?? q ?? centre;
  const appleLabel = host === "maps.apple.com" ? qParam : undefined;
  if (hit && validCoords(+hit[1], +hit[2])) return { kind: "ok", lat: +hit[1], lng: +hit[2], name: name ?? appleLabel, placeId };

  const searchName = name ?? qParam;
  return searchName ? { kind: "name-only", name: searchName } : { kind: "invalid" };
}

/** Links for the attendee's Directions buttons. */
export const directionsLinks = (p: { lat: number; lng: number }) => ({
  google: `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`,
  apple: `https://maps.apple.com/?daddr=${p.lat},${p.lng}`,
  waze: `https://waze.com/ul?ll=${p.lat},${p.lng}&navigate=yes`,
});
