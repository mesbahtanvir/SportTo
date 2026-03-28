"use client";

import { useEffect, useState } from "react";
import { CommunityCenter } from "@/lib/types";
import { NEIGHBORHOOD_COLORS } from "@/lib/utils";

interface MapViewProps {
  centers: CommunityCenter[];
  height?: string;
  selectedSlug?: string;
}

export default function MapView({
  centers,
  height = "400px",
  selectedSlug,
}: MapViewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="bg-gray-100 rounded-xl flex items-center justify-center text-text-secondary"
        style={{ height }}
      >
        Loading map...
      </div>
    );
  }

  return <MapInner centers={centers} height={height} selectedSlug={selectedSlug} />;
}

function MapInner({
  centers,
  height,
  selectedSlug,
}: MapViewProps) {
  const [leaflet, setLeaflet] = useState<{
    MapContainer: typeof import("react-leaflet").MapContainer;
    TileLayer: typeof import("react-leaflet").TileLayer;
    Marker: typeof import("react-leaflet").Marker;
    Popup: typeof import("react-leaflet").Popup;
    L: typeof import("leaflet");
  } | null>(null);

  useEffect(() => {
    Promise.all([import("react-leaflet"), import("leaflet")]).then(
      ([rl, L]) => {
        // Fix default marker icon
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });
        setLeaflet({
          MapContainer: rl.MapContainer,
          TileLayer: rl.TileLayer,
          Marker: rl.Marker,
          Popup: rl.Popup,
          L: L.default || L,
        });
      }
    );
  }, []);

  if (!leaflet) {
    return (
      <div
        className="bg-gray-100 rounded-xl flex items-center justify-center text-text-secondary"
        style={{ height }}
      >
        Loading map...
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, L } = leaflet;

  const defaultCenter: [number, number] = [43.6545, -79.3835];
  const center: [number, number] = selectedSlug
    ? (() => {
        const c = centers.find((c) => c.slug === selectedSlug);
        return c ? [c.coordinates.lat, c.coordinates.lng] : defaultCenter;
      })()
    : defaultCenter;

  function createIcon(color: string) {
    return L.divIcon({
      className: "custom-marker",
      html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -16],
    });
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <MapContainer
        center={center}
        zoom={selectedSlug ? 15 : 13}
        style={{ height, width: "100%", borderRadius: "0.75rem" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {centers.map((c) => {
          const color = NEIGHBORHOOD_COLORS[c.neighborhood] || "#0D7377";
          return (
            <Marker
              key={c.id}
              position={[c.coordinates.lat, c.coordinates.lng]}
              icon={createIcon(
                selectedSlug === c.slug ? "#E85D4A" : color
              )}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{c.shortName}</strong>
                  <br />
                  {c.address}
                  <br />
                  <span className="text-text-secondary">
                    {c.schedules.length} session
                    {c.schedules.length !== 1 ? "s" : ""}/week
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </>
  );
}
