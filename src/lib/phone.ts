/**
 * Phone numbers with country codes.
 *
 * Every country in the world is available (from libphonenumber-js, the same
 * rules Google uses on Android). Each field stores the country and the national
 * number separately and sends E.164 (+260964123456) to the API. Zambia is the
 * default and is also checked against the MTN, Airtel and Zamtel prefixes.
 */
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, getExampleNumber, type CountryCode } from "libphonenumber-js/min";
import examples from "libphonenumber-js/mobile/examples";

export interface Country {
  iso: string;
  name: string;
  dial: string;
  example: string;
}

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    return null;
  }
})();

/** Names people in the region actually use, where the standard name differs. */
const nameOverrides: Record<string, string> = { CD: "DR Congo", CG: "Congo (Brazzaville)", CI: "Côte d'Ivoire", MM: "Myanmar", HK: "Hong Kong", MO: "Macau", PS: "Palestine" };

/** Countries shown at the top of the list, in this order. */
export const pinned = ["ZM", "ZA", "ZW", "BW", "MW", "TZ", "CD", "MZ", "NA", "AO", "KE"];

export const countries: Country[] = getCountries()
  .map((iso) => {
    const ex = getExampleNumber(iso, examples);
    return { iso, name: nameOverrides[iso] ?? regionNames?.of(iso) ?? iso, dial: getCountryCallingCode(iso), example: ex ? ex.formatNational() : "" };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export const defaultCountry = "ZM";

export interface Phone {
  country: string;
  number: string;
}

export const emptyPhone = (country = defaultCountry): Phone => ({ country, number: "" });

const byIso = new Map(countries.map((c) => [c.iso, c]));
export const countryOf = (iso: string): Country => byIso.get(iso) ?? byIso.get(defaultCountry)!;

/** Flag image, copied from country-flag-icons into /flags/ at build time. */
export const flagSrc = (iso: string) => `/flags/${iso}.svg`;

const parse = (p: Phone) => parsePhoneNumberFromString(p.number, p.country as CountryCode);

/** National digits without the trunk 0. */
export function nationalDigits(p: Phone): string {
  const n = parse(p);
  return n ? String(n.nationalNumber) : p.number.replace(/\D/g, "").replace(/^0+/, "");
}

/** Returns an error message, or undefined when the number is valid. */
export function phoneError(p: Phone): string | undefined {
  const c = countryOf(p.country);
  if (!p.number.replace(/\D/g, "")) return "Enter a mobile number.";
  const n = parse(p);
  if (n?.country && n.country !== p.country && n.isValid()) return `That's a ${countryOf(n.country).name} number. Change the country code to +${countryOf(n.country).dial}.`;
  if (p.country === "ZM") {
    const d = nationalDigits(p);
    return n?.isValid() && /^(9[5-7]|7[5-7])\d{7}$/.test(d) ? undefined : "Enter a Zambian mobile number, for example 096 412 3456.";
  }
  return n?.isValid() ? undefined : `Enter a ${c.name} mobile number${c.example ? `, for example ${c.example}` : ""}.`;
}

/** +260964123456, the form the API receives. */
export const toE164 = (p: Phone) => parse(p)?.number ?? `+${countryOf(p.country).dial}${nationalDigits(p)}`;

/** +260 96 4123456 style, for display. */
export const formatPhone = (p: Phone) => parse(p)?.formatInternational() ?? `+${countryOf(p.country).dial} ${p.number}`;

/** Zambian mobile network from the prefix, used to suggest a mobile money provider. */
export function zambianNetwork(p: Phone): "MTN" | "Airtel" | "Zamtel" | undefined {
  if (p.country !== "ZM") return undefined;
  const d = nationalDigits(p);
  if (/^(96|76)/.test(d)) return "MTN";
  if (/^(97|77)/.test(d)) return "Airtel";
  if (/^(95|75)/.test(d)) return "Zamtel";
  return undefined;
}

/** Parse a stored number such as "0966 120 448" or "+27 82 123 4567". */
export function parsePhone(raw: string): Phone {
  if (raw.trim().startsWith("+")) {
    const n = parsePhoneNumberFromString(raw);
    if (n?.country) return { country: n.country, number: n.formatNational() };
  }
  return { country: defaultCountry, number: raw };
}

/** Matches a search for the country picker: name, ISO code or dialling code. */
export function matchesCountry(c: Country, q: string): boolean {
  const s = q.trim().toLowerCase().replace(/^\+/, "");
  if (!s) return true;
  return c.name.toLowerCase().includes(s) || c.iso.toLowerCase() === s || c.dial.startsWith(s);
}
