"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";
import { centers } from "@/data/centers";
import { DayOfWeek } from "@/lib/types";
import {
  DAY_ORDER,
  DAY_LABELS,
  DAY_FULL_LABELS,
  formatTimeRange,
  getTodayDayOfWeek,
  NEIGHBORHOOD_COLORS,
} from "@/lib/utils";

const CENTER_COLORS = [
  "#0D7377",
  "#E85D4A",
  "#8B5CF6",
  "#F59E0B",
  "#10B981",
  "#EC4899",
  "#6366F1",
  "#0EA5E9",
  "#F97316",
];

type ViewMode = "list" | "calendar";

export default function SchedulePage() {
  const [view, setView] = useState<ViewMode>("list");
  const today = getTodayDayOfWeek();

  // Flatten all sessions with center info
  const allSessions = useMemo(() => {
    return centers.flatMap((center, ci) =>
      center.schedules.map((session) => ({
        ...session,
        centerName: center.shortName,
        centerSlug: center.slug,
        neighborhood: center.neighborhood,
        color: CENTER_COLORS[ci % CENTER_COLORS.length],
      }))
    );
  }, []);

  // Group by day for list view
  const byDay = useMemo(() => {
    return DAY_ORDER.map((day) => ({
      day,
      sessions: allSessions
        .filter((s) => s.dayOfWeek === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    }));
  }, [allSessions]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Weekly Schedule</h1>
          <p className="text-text-secondary mt-1">
            All badminton sessions across {centers.length} centres
          </p>
        </div>
        <div className="flex bg-gray-100 rounded-lg overflow-hidden">
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
              view === "list"
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <List size={16} />
            <span className="hidden sm:inline">List</span>
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
              view === "calendar"
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <LayoutGrid size={16} />
            <span className="hidden sm:inline">Calendar</span>
          </button>
        </div>
      </div>

      {view === "list" ? (
        <ListView byDay={byDay} today={today} />
      ) : (
        <CalendarView byDay={byDay} today={today} />
      )}
    </div>
  );
}

interface SessionWithCenter {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  sessionType: string;
  ageGroup: string;
  skillLevel: string;
  cost: number;
  costNote?: string;
  notes?: string;
  reservationRequired: boolean;
  centerName: string;
  centerSlug: string;
  neighborhood: string;
  color: string;
}

function ListView({
  byDay,
  today,
}: {
  byDay: { day: DayOfWeek; sessions: SessionWithCenter[] }[];
  today: DayOfWeek;
}) {
  return (
    <div className="space-y-6">
      {byDay.map(({ day, sessions }) => (
        <div key={day}>
          <h2
            className={`text-lg font-bold mb-3 ${
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
                  key={`${s.centerSlug}-${s.id}`}
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
                      <span className="capitalize">{s.skillLevel === "all" ? "All levels" : s.skillLevel}</span>
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
  );
}

function CalendarView({
  byDay,
  today,
}: {
  byDay: { day: DayOfWeek; sessions: SessionWithCenter[] }[];
  today: DayOfWeek;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-7 gap-2 min-w-[700px]">
        {/* Day headers */}
        {DAY_ORDER.map((day) => (
          <div
            key={day}
            className={`text-center text-sm font-semibold py-2 rounded-lg ${
              day === today
                ? "bg-primary text-white"
                : "bg-gray-100 text-text-primary"
            }`}
          >
            {DAY_LABELS[day]}
          </div>
        ))}

        {/* Day columns */}
        {byDay.map(({ day, sessions }) => (
          <div key={day} className="space-y-1.5 min-h-[200px]">
            {sessions.length === 0 ? (
              <div className="text-xs text-gray-300 text-center mt-4">
                —
              </div>
            ) : (
              sessions.map((s) => (
                <Link
                  key={`${s.centerSlug}-${s.id}`}
                  href={`/centers/${s.centerSlug}`}
                  className="block rounded-lg p-2 text-white text-xs hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: s.color }}
                >
                  <div className="font-semibold truncate">{s.centerName}</div>
                  <div className="opacity-80">
                    {formatTimeRange(s.startTime, s.endTime)}
                  </div>
                  <div className="opacity-70">
                    {s.cost === 0 ? "Free" : `$${s.cost}`}
                  </div>
                </Link>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
