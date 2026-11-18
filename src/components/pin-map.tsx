"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

/**
 * A small map with one draggable pin. Tap the map to move the pin, or drag it.
 * Uses OpenStreetMap tiles: the pin belongs to EMS, so no Google charges apply.
 * Load it with next/dynamic and ssr:false (Leaflet needs the browser).
 */

const pin = L.divIcon({
  className: "",
  html: '<div style="width:28px;height:40px;transform:translate(-14px,-40px)"><svg viewBox="0 0 28 40" width="28" height="40" aria-hidden="true"><path d="M14 0C6.3 0 0 6.2 0 13.9 0 24.3 14 40 14 40s14-15.7 14-26.1C28 6.2 21.7 0 14 0z" fill="#c42539"/><circle cx="14" cy="14" r="5.5" fill="#fff"/></svg></div>',
  iconSize: [0, 0],
});

function Follow({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    const c = map.getCenter();
    if (Math.abs(c.lat - lat) > 1e-6 || Math.abs(c.lng - lng) > 1e-6) map.setView([lat, lng], Math.max(map.getZoom(), zoom));
  }, [lat, lng, zoom, map]);
  return null;
}

function Clicks({ onMove }: { onMove: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onMove(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function PinMap({ lat, lng, zoom = 15, onMove, height = 280 }: { lat: number; lng: number; zoom?: number; onMove?: (lat: number, lng: number) => void; height?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line" style={{ height }}>
      <MapContainer center={[lat, lng]} zoom={zoom} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }} attributionControl>
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' maxZoom={19} />
        <Marker
          position={[lat, lng]}
          icon={pin}
          draggable={!!onMove}
          eventHandlers={onMove ? { dragend: (e) => { const p = (e.target as L.Marker).getLatLng(); onMove(p.lat, p.lng); } } : undefined}
        />
        <Follow lat={lat} lng={lng} zoom={zoom} />
        {onMove && <Clicks onMove={onMove} />}
      </MapContainer>
    </div>
  );
}
