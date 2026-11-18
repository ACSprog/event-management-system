"use client";

import dynamic from "next/dynamic";

/** Read-only map with the event's pin, for server-rendered pages. */
const PinMap = dynamic(() => import("@/components/pin-map"), { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-surface-2" /> });

export function LocationMap({ lat, lng, height = 240 }: { lat: number; lng: number; height?: number }) {
  return <PinMap lat={lat} lng={lng} zoom={15} height={height} />;
}
