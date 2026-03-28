import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import { CommunityCenter } from "@/lib/types";
import { DAY_ORDER, DAY_LABELS, formatTimeRange, NEIGHBORHOOD_COLORS } from "@/lib/utils";
import NeighborhoodBadge from "./NeighborhoodBadge";

export default function CenterCard({ center }: { center: CommunityCenter }) {
  const scheduledDays = new Set(center.schedules.map((s) => s.dayOfWeek));
  const nextSession = center.schedules[0];
  const borderColor = NEIGHBORHOOD_COLORS[center.neighborhood] || "#94A3B8";
  const hasFree = center.schedules.some((s) => s.cost === 0);

  return (
    <Link
      href={`/centers/${center.slug}`}
      className="block bg-white rounded-xl border border-border hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="border-l-4 p-5" style={{ borderLeftColor: borderColor }}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-text-primary leading-tight">
            {center.shortName}
          </h3>
          {hasFree && (
            <span className="shrink-0 text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              Free
            </span>
          )}
        </div>

        <NeighborhoodBadge neighborhood={center.neighborhood} />

        <div className="mt-3 flex items-center gap-1.5 text-sm text-text-secondary">
          <MapPin size={14} />
          <span>{center.address}</span>
        </div>

        {nextSession && (
          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-text-secondary">
            <Clock size={14} />
            <span>{formatTimeRange(nextSession.startTime, nextSession.endTime)}</span>
          </div>
        )}

        {/* Day dots */}
        <div className="mt-3 flex gap-1">
          {DAY_ORDER.map((day) => (
            <span
              key={day}
              className={`w-7 h-6 flex items-center justify-center text-[10px] font-medium rounded ${
                scheduledDays.has(day)
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {DAY_LABELS[day]}
            </span>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-text-secondary">
          <span>{center.numberOfCourts} court{center.numberOfCourts > 1 ? "s" : ""}</span>
          {center.racketsAvailable && <span>Rackets available</span>}
          <span className="capitalize">{center.operator}</span>
        </div>
      </div>
    </Link>
  );
}
