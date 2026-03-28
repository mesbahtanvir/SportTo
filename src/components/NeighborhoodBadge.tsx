import { NEIGHBORHOOD_COLORS } from "@/lib/utils";

export default function NeighborhoodBadge({ neighborhood }: { neighborhood: string }) {
  const color = NEIGHBORHOOD_COLORS[neighborhood] || "#94A3B8";
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ backgroundColor: `${color}18`, color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {neighborhood}
    </span>
  );
}
