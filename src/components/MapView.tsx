"use client";

import { useEffect, useState } from "react";
import { CommunityCenter } from "@/lib/types";
import { NEIGHBORHOOD_COLORS } from "@/lib/utils";

interface MapViewProps {
  centers: CommunityCenter[];
  /** Inline pixel height. Ignored when `className` is provided. */
  height?: string;
  /** Tailwind class controlling the wrapper size (use for responsive height). */
  className?: string;
  selectedSlug?: string;
  /** Centre id to highlight / pan to (from shared calendar+map state). */
  highlightedCenterId?: string | null;
  /** Optional override for the colour assigned to each centre (by id). */
  colorByCenterId?: Record<string, string>;
  onHoverCenter?: (id: string | null) => void;
  onSelectCenter?: (id: string) => void;
}

export default function MapView({
  centers,
  height = "400px",
  className,
  selectedSlug,
  highlightedCenterId,
  colorByCenterId,
  onHoverCenter,
  onSelectCenter,
}: MapViewProps) {
  const [leaflet, setLeaflet] = useState<{
    MapContainer: typeof import("react-leaflet").MapContainer;
    TileLayer: typeof import("react-leaflet").TileLayer;
    Marker: typeof import("react-leaflet").Marker;
    Popup: typeof import("react-leaflet").Popup;
    useMap: typeof import("react-leaflet").useMap;
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
          useMap: rl.useMap,
          L: L.default || L,
        });
      }
    );
  }, []);

  const wrapperStyle = className ? undefined : { height };
  const wrapperClass = className ?? "";

  if (!leaflet) {
    return (
      <div
        className={`bg-gray-100 rounded-xl flex items-center justify-center text-text-secondary ${wrapperClass}`}
        style={wrapperStyle}
      >
        <span className="text-sm">Loading map…</span>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, useMap, L } = leaflet;

  const defaultCenter: [number, number] = [43.6545, -79.3835];
  const initialCenter: [number, number] = selectedSlug
    ? (() => {
        const c = centers.find((c) => c.slug === selectedSlug);
        return c ? [c.coordinates.lat, c.coordinates.lng] : defaultCenter;
      })()
    : defaultCenter;

  function createIcon(color: string, size: number) {
    const border = size >= 30 ? 4 : 3;
    return L.divIcon({
      className: "custom-marker",
      html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:${border}px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2 - 4],
    });
  }

  // Child component that re-pans the map when the highlighted centre changes.
  function PanToHighlight({
    targetLat,
    targetLng,
  }: {
    targetLat: number | null;
    targetLng: number | null;
  }) {
    const map = useMap();
    useEffect(() => {
      if (targetLat != null && targetLng != null) {
        map.flyTo([targetLat, targetLng], Math.max(map.getZoom(), 14), {
          duration: 0.6,
        });
      }
    }, [map, targetLat, targetLng]);
    return null;
  }

  const highlighted = highlightedCenterId
    ? centers.find((c) => c.id === highlightedCenterId) ?? null
    : null;

  return (
    <div className={wrapperClass} style={wrapperStyle}>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <MapContainer
        center={initialCenter}
        zoom={selectedSlug ? 15 : 13}
        style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {highlighted && (
          <PanToHighlight
            targetLat={highlighted.coordinates.lat}
            targetLng={highlighted.coordinates.lng}
          />
        )}
        {centers.map((c) => {
          const baseColor =
            colorByCenterId?.[c.id] ??
            NEIGHBORHOOD_COLORS[c.neighborhood] ??
            "#0D7377";
          const isHighlighted =
            highlightedCenterId === c.id || selectedSlug === c.slug;
          const isDimmed =
            highlightedCenterId != null && highlightedCenterId !== c.id;
          const color = isHighlighted ? "#E85D4A" : baseColor;
          const size = isHighlighted ? 32 : 22;
          return (
            <Marker
              key={c.id}
              position={[c.coordinates.lat, c.coordinates.lng]}
              icon={createIcon(color, size)}
              opacity={isDimmed ? 0.4 : 1}
              eventHandlers={{
                mouseover: () => onHoverCenter?.(c.id),
                mouseout: () => onHoverCenter?.(null),
                click: () => onSelectCenter?.(c.id),
              }}
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
                  <br />
                  <a
                    href={`/centers/${c.slug}`}
                    className="text-primary underline"
                  >
                    View centre
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
