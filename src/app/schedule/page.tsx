"use client";

import { useMemo } from "react";
import Link from "next/link";
import { centers } from "@/data/centers";
import { DayOfWeek } from "@/lib/types";
import {
  DAY_FULL_LABELS,
  DAY_ORDER,
  NEIGHBORHOOD_COLORS,
  colorForCenter,
  formatTimeRange,
  getTodayDayOfWeek,
} from "@/lib/utils";

interface SessionWithCenter {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  skillLevel: string;
  cost: number;
  centerName: string;
  centerSlug: string;
  neighborhood: string;
  color: string;
}

export default function SchedulePage() {
  const today = getTodayDayOfWeek();

  const allSessions: SessionWithCenter[] = useMemo(() => {
    return centers.flatMap((center, ci) =>
      center.schedules.map((s) => ({
        id: `${center.id}-${s.id}`,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        skillLevel: s.skillLevel,
        cost: s.cost,
        centerName: center.shortName,
        centerSlug: center.slug,
        neighborhood: center.neighborhood,
        color: colorForCenter(ci),
      })),
    );
  }, []);

  const byDay = useMemo(() => {
    return DAY_ORDER.map((day) => ({
      day,
      sessions: allSessions
        .filter((s) => s.dayOfWeek === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    }));
  }, [allSessions]);

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 pt-4 sm:pt-8 pb-6">
      <div className="mb-5 sm:mb-6">
        <h1 className="text-xl sm:text-3xl font-bold leading-tight">
          Weekly agenda
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-0.5 sm:mt-1">
          All sessions across {centers.length} centres — scannable list. For a
          time-grid view with the map,{" "}
          <Link href="/" className="text-primary underline">
            try the home page
          </Link>
          .
        </p>
      </div>

      <div className="space-y-6">
        {byDay.map(({ day, sessions }) => (
          <div key={day}>
            <h2
              className={`text-base sm:text-lg font-bold mb-2 sm:mb-3 sticky top-14 md:top-16 bg-background/85 backdrop-blur py-1 z-10 ${
                day === today ? "text-primary" : ""
              }`}
            >
              {DAY_FULL_LABELS[day]}
              {day === today && (
                <span className="ml-2 text-xs font-medium bg-primary-light text-primary px-2 py-0.5 rounded-full">
                  Today
                </span>
              )}
            </h2>
            {sessions.length === 0 ? (
              <p className="text-sm text-gray-400 italic pl-4">
                No sessions scheduled
              </p>
            ) : (
              <div className="space-y-2">
                {sessions.map((s) => (
                  <Link
                    key={s.id}
                    href={`/centers/${s.centerSlug}`}
                    className="flex items-center gap-4 bg-white rounded-xl border border-border p-4 hover:shadow-sm transition-shadow"
                  >
                    <div
                      className="w-1 h-12 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">
                          {s.centerName}
                        </span>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: `${
                              NEIGHBORHOOD_COLORS[s.neighborhood] || "#94A3B8"
                            }18`,
                            color:
                              NEIGHBORHOOD_COLORS[s.neighborhood] || "#94A3B8",
                          }}
                        >
                          {s.neighborhood}
                        </span>
                      </div>
                      <div className="text-sm text-text-secondary mt-0.5">
                        {formatTimeRange(s.startTime, s.endTime)}
                        <span className="mx-2">·</span>
                        <span className="capitalize">
                          {s.skillLevel === "all"
                            ? "All levels"
                            : s.skillLevel}
                        </span>
                        <span className="mx-2">·</span>
                        <span
                          className={
                            s.cost === 0 ? "text-success font-medium" : ""
                          }
                        >
                          {s.cost === 0 ? "Free" : `$${s.cost}`}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
