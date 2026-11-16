// One place to rename the platform. Everything visible reads from here.
export const brand = {
  name: "Eventra",
  tagline: "Find it. Book it. Walk straight in.",
  country: "Zambia",
  currency: "ZMW",
  currencySymbol: "K",
  supportEmail: "support@eventra.example",
  demo: true,
};

export function kwacha(amount: number, opts: { decimals?: boolean } = {}) {
  const v = opts.decimals
    ? amount.toLocaleString("en-ZM", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : Math.round(amount).toLocaleString("en-ZM");
  return `${brand.currencySymbol}${v}`;
}

export function compact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return String(n);
}

export function fmtDate(iso: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) {
  return new Date(iso).toLocaleDateString("en-GB", { ...opts, timeZone: "Africa/Lusaka" });
}

export function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lusaka" });
}
