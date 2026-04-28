"use client";

import { useEffect, useState } from "react";
import { CommunityCenter } from "@/lib/types";

interface MapViewProps {
  centers: CommunityCenter[];
  /** Inline pixel height. Ignored when `className` is provided. */
  height?: string;
  /** Tailwind class controlling the wrapper size (use for responsive height). */
  className?: string;
  selectedSlug?: string;
  /** Centre id currently highlighted (tints the pin, no pan). */
  highlightedCenterId?: string | null;
  /** Centre id the user actively selected (pans to it). */
  focusedCenterId?: string | null;
  /** Optional override for the colour assigned to each centre (by id). */
  colorByCenterId?: Record<string, string>;
  onHoverCenter?: (id: string | null) => void;
  onSelectCenter?: (id: string) => void;
  /** Ambient mode desaturates map tiles so the map recedes into the periphery. */
  ambient?: boolean;
}

export default function MapView({
  centers,
  height = "400px",
  className,
  selectedSlug,
  highlightedCenterId,
  focusedCenterId,
  colorByCenterId,
  onHoverCenter,
  onSelectCenter,
  ambient = false,
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
        className={`bg-primary-light/60 rounded-xl ${wrapperClass}`}
        style={wrapperStyle}
        aria-hidden="true"
      />
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

  function createIcon(color: string, size: number, emphasis: "base" | "dim" | "focus") {
    // Muted dots — a quiet ring instead of a hard white border + shadow.
    const ringOpacity = emphasis === "focus" ? 0.9 : 0.55;
    const ringWidth = emphasis === "focus" ? 2 : 1.5;
    const fillOpacity = emphasis === "dim" ? 0.55 : 1;
    return L.divIcon({
      className: "custom-marker",
      html: `<div style="background:${color};opacity:${fillOpacity};width:${size}px;height:${size}px;border-radius:50%;box-shadow:0 0 0 ${ringWidth}px rgba(255,255,255,${ringOpacity})"></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2 - 4],
    });
  }

  // Pans the map only when the user explicitly focuses a centre — never on hover.
  function PanToFocus({
    targetLat,
    targetLng,
  }: {
    targetLat: number | null;
    targetLng: number | null;
  }) {
    const map = useMap();
    useEffect(() => {
      if (targetLat != null && targetLng != null) {
        map.panTo([targetLat, targetLng], { animate: true, duration: 0.45 });
      }
    }, [map, targetLat, targetLng]);
    return null;
  }

  const focused = focusedCenterId
    ? centers.find((c) => c.id === focusedCenterId) ?? null
    : null;

  return (
    <div
      className={`${wrapperClass} ${ambient ? "map-ambient" : ""}`}
      style={wrapperStyle}
    >
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <MapContainer
        center={initialCenter}
        zoom={selectedSlug ? 15 : 13}
        style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
        scrollWheelZoom={false}
        zoomControl={!ambient}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {focused && (
          <PanToFocus
            targetLat={focused.coordinates.lat}
            targetLng={focused.coordinates.lng}
          />
        )}
        {centers.map((c) => {
          const baseColor = colorByCenterId?.[c.id] ?? "#8B93A1";
          const isHighlighted =
            highlightedCenterId === c.id || selectedSlug === c.slug;
          const isDimmed =
            highlightedCenterId != null && highlightedCenterId !== c.id;
          const emphasis = isHighlighted ? "focus" : isDimmed ? "dim" : "base";
          const size = isHighlighted ? 18 : 12;
          return (
            <Marker
              key={c.id}
              position={[c.coordinates.lat, c.coordinates.lng]}
              icon={createIcon(baseColor, size, emphasis)}
              eventHandlers={{
                mouseover: () => onHoverCenter?.(c.id),
                mouseout: () => onHoverCenter?.(null),
                click: () => onSelectCenter?.(c.id),
              }}
            >
              <Popup>
                <div className="text-sm leading-relaxed">
                  <strong className="text-text-primary font-medium">
                    {c.shortName}
                  </strong>
                  <br />
                  <span className="text-text-secondary">{c.address}</span>
                  <br />
                  <span className="text-text-secondary">
                    {c.schedules.length} session
                    {c.schedules.length !== 1 ? "s" : ""} / week
                  </span>
                  <br />
                  <a
                    href={`/centers/${c.slug}`}
                    className="text-text-primary underline decoration-text-secondary/40 underline-offset-2 hover:decoration-text-primary/60"
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
