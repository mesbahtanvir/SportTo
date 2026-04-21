import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import { CommunityCenter } from "@/lib/types";
import { DAY_ORDER, DAY_LABELS, formatTimeRange } from "@/lib/utils";
import NeighborhoodBadge from "./NeighborhoodBadge";

export default function CenterCard({ center }: { center: CommunityCenter }) {
  const scheduledDays = new Set(center.schedules.map((s) => s.dayOfWeek));
  const nextSession = center.schedules[0];
  const hasFree = center.schedules.some((s) => s.cost === 0);

  return (
    <Link
      href={`/centers/${center.slug}`}
      className="block bg-white rounded-xl border border-border hover:border-text-secondary/40 transition-colors overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium text-text-primary leading-tight">
            {center.shortName}
          </h3>
          {hasFree && (
            <span className="shrink-0 text-[11px] text-text-secondary">
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
                  ? "bg-text-primary/85 text-white"
                  : "bg-gray-50 text-gray-300"
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
