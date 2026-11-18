/**
 * Phone numbers with country codes.
 *
 * Every phone field stores the country and the national number separately and
 * sends E.164 (+260964123456) to the API. Zambia is the default and is checked
 * strictly (MTN, Airtel and Zamtel prefixes); other countries get a length check.
 */

export interface Country {
  iso: string;
  name: string;
  flag: string;
  dial: string;
  /** Allowed national number lengths, without the leading 0. */
  len: [number, number];
  example: string;
}

export const countries: Country[] = [
  { iso: "ZM", name: "Zambia", flag: "🇿🇲", dial: "260", len: [9, 9], example: "96 412 3456" },
  { iso: "ZA", name: "South Africa", flag: "🇿🇦", dial: "27", len: [9, 9], example: "82 123 4567" },
  { iso: "ZW", name: "Zimbabwe", flag: "🇿🇼", dial: "263", len: [9, 9], example: "77 123 4567" },
  { iso: "BW", name: "Botswana", flag: "🇧🇼", dial: "267", len: [8, 8], example: "71 123 456" },
  { iso: "MW", name: "Malawi", flag: "🇲🇼", dial: "265", len: [9, 9], example: "99 123 4567" },
  { iso: "TZ", name: "Tanzania", flag: "🇹🇿", dial: "255", len: [9, 9], example: "71 234 5678" },
  { iso: "KE", name: "Kenya", flag: "🇰🇪", dial: "254", len: [9, 9], example: "712 345 678" },
  { iso: "CD", name: "DR Congo", flag: "🇨🇩", dial: "243", len: [9, 9], example: "81 234 5678" },
  { iso: "MZ", name: "Mozambique", flag: "🇲🇿", dial: "258", len: [9, 9], example: "82 123 4567" },
  { iso: "NA", name: "Namibia", flag: "🇳🇦", dial: "264", len: [9, 9], example: "81 123 4567" },
  { iso: "AO", name: "Angola", flag: "🇦🇴", dial: "244", len: [9, 9], example: "923 123 456" },
  { iso: "UG", name: "Uganda", flag: "🇺🇬", dial: "256", len: [9, 9], example: "712 345 678" },
  { iso: "NG", name: "Nigeria", flag: "🇳🇬", dial: "234", len: [10, 10], example: "802 123 4567" },
  { iso: "GB", name: "United Kingdom", flag: "🇬🇧", dial: "44", len: [10, 10], example: "7400 123456" },
  { iso: "US", name: "United States", flag: "🇺🇸", dial: "1", len: [10, 10], example: "201 555 0123" },
];

export const defaultCountry = "ZM";

export interface Phone {
  country: string;
  number: string;
}

export const emptyPhone = (country = defaultCountry): Phone => ({ country, number: "" });

export const countryOf = (iso: string) => countries.find((c) => c.iso === iso) ?? countries[0];

/** National digits without a trunk 0 or a repeated country code. */
export function nationalDigits(p: Phone): string {
  const c = countryOf(p.country);
  let d = p.number.replace(/\D/g, "");
  if (d.startsWith(c.dial) && d.length > c.len[1]) d = d.slice(c.dial.length);
  return d.replace(/^0+/, "");
}

/** Returns an error message, or undefined when the number is valid. */
export function phoneError(p: Phone): string | undefined {
  const c = countryOf(p.country);
  const d = nationalDigits(p);
  if (!d) return "Enter a mobile number.";
  if (c.iso === "ZM") return /^(9[5-7]|7[5-7])\d{7}$/.test(d) ? undefined : "Enter a Zambian mobile number, for example 096 412 3456.";
  return d.length >= c.len[0] && d.length <= c.len[1] ? undefined : `Enter a ${c.name} mobile number, for example ${c.example}.`;
}

/** +260964123456, the form the API receives. */
export const toE164 = (p: Phone) => `+${countryOf(p.country).dial}${nationalDigits(p)}`;

/** +260 96 412 3456, for display. */
export function formatPhone(p: Phone): string {
  const d = nationalDigits(p);
  const groups = d.length === 9 ? [d.slice(0, 2), d.slice(2, 5), d.slice(5)] : [d.slice(0, 3), d.slice(3, 6), d.slice(6)];
  return `+${countryOf(p.country).dial} ${groups.filter(Boolean).join(" ")}`;
}

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
  const d = raw.replace(/\D/g, "");
  if (raw.trim().startsWith("+")) {
    const c = [...countries].sort((a, b) => b.dial.length - a.dial.length).find((x) => d.startsWith(x.dial));
    if (c) return { country: c.iso, number: d.slice(c.dial.length) };
  }
  return { country: defaultCountry, number: raw };
}
