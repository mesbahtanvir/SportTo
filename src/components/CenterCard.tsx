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
          <MapPin size={13} strokeWidth={1.75} />
          <span>{center.address}</span>
        </div>

        {nextSession && (
          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-text-secondary">
            <Clock size={13} strokeWidth={1.75} />
            <span>{formatTimeRange(nextSession.startTime, nextSession.endTime)}</span>
          </div>
        )}

        {/* Day rhythm — quiet dots, scheduled days inked, others hushed */}
        <div className="mt-4 flex gap-1">
          {DAY_ORDER.map((day) => {
            const on = scheduledDays.has(day);
            return (
              <span
                key={day}
                title={DAY_LABELS[day]}
                className={`flex-1 h-1 rounded-full ${
                  on ? "bg-text-primary/50" : "bg-border"
                }`}
                aria-label={`${DAY_LABELS[day]}: ${on ? "scheduled" : "none"}`}
              />
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-2.5 text-xs text-text-secondary">
          <span>{center.numberOfCourts} court{center.numberOfCourts > 1 ? "s" : ""}</span>
          {center.racketsAvailable && (
            <>
              <span className="opacity-40">·</span>
              <span>Rackets available</span>
            </>
          )}
          <span className="opacity-40">·</span>
          <span className="capitalize">{center.operator}</span>
        </div>
      </div>
    </Link>
  );
}
