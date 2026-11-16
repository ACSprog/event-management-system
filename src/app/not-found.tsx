import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="font-display text-6xl font-bold text-marigold">404</p>
      <h1 className="mt-4 text-2xl font-semibold">This page doesn&rsquo;t exist</h1>
      <p className="mt-2 text-ink-3">The link may be old, or the event may have ended.</p>
      <Link href="/" className="mt-6 inline-block rounded-lg bg-kafue px-4 py-2.5 font-semibold text-white">Go to the home page</Link>
    </div>
  );
}
