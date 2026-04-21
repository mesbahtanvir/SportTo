"use client";

import { useMemo, useState } from "react";
import { centers } from "@/data/centers";
import { DayOfWeek, Sport } from "@/lib/types";
import {
  DAY_FULL_LABELS,
  DAY_ORDER,
  SPORT_EMOJI,
  SPORT_LABELS,
  colorForCenter,
  getTodayDayOfWeek,
} from "@/lib/utils";
import CalendarTimeGrid, {
  CalendarSession,
} from "@/components/CalendarTimeGrid";
import MapView from "@/components/MapView";

type TimeOfDay = "any" | "morning" | "afternoon" | "evening";

function timeInRange(start: string, filter: TimeOfDay): boolean {
  if (filter === "any") return true;
  const h = parseInt(start.split(":")[0]);
  if (filter === "morning") return h < 12;
  if (filter === "afternoon") return h >= 12 && h < 17;
  return h >= 17;
}

// Sports surfaced in the filter pill: any sport that has at least one session
// seeded. Keeps the UI honest — no dead buttons.
function availableSports(): Sport[] {
  const set = new Set<Sport>();
  for (const c of centers) for (const s of c.schedules) set.add(s.sport);
  return Array.from(set);
}

export default function HomePage() {
  const today = getTodayDayOfWeek();
  const sports = useMemo(() => availableSports(), []);

  const [sport, setSport] = useState<Sport>("badminton");
  const [dayFilter, setDayFilter] = useState<DayOfWeek | "any">("any");
  const [timeFilter, setTimeFilter] = useState<TimeOfDay>("any");
  const [freeOnly, setFreeOnly] = useState(false);
  const [hoveredCenterId, setHoveredCenterId] = useState<string | null>(null);
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);

  const colorByCenterId = useMemo(() => {
    const out: Record<string, string> = {};
    centers.forEach((c, i) => {
      out[c.id] = colorForCenter(i);
    });
    return out;
  }, []);

  const allSessions: CalendarSession[] = useMemo(() => {
    return centers.flatMap((c, i) =>
      c.schedules.map((s) => ({
        id: `${c.id}-${s.id}`,
        centerId: c.id,
        centerSlug: c.slug,
        centerShortName: c.shortName,
        color: colorForCenter(i),
        sport: s.sport,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        cost: s.cost,
        skillLevel: s.skillLevel,
      })),
    );
  }, []);

  const filteredSessions = useMemo(() => {
    return allSessions.filter((s) => {
      if (s.sport !== sport) return false;
      if (dayFilter !== "any" && s.dayOfWeek !== dayFilter) return false;
      if (!timeInRange(s.startTime, timeFilter)) return false;
      if (freeOnly && s.cost !== 0) return false;
      return true;
    });
  }, [allSessions, sport, dayFilter, timeFilter, freeOnly]);

  const visibleCenters = useMemo(() => {
    const ids = new Set(filteredSessions.map((s) => s.centerId));
    return centers.filter((c) => ids.has(c.id));
  }, [filteredSessions]);

  const freeLocations = useMemo(() => {
    const ids = new Set(
      filteredSessions.filter((s) => s.cost === 0).map((s) => s.centerId),
    );
    return ids.size;
  }, [filteredSessions]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Compact header */}
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Find play in Toronto
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Community-centre drop-ins — see <em>when</em> and <em>where</em> at a
          glance.
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-border rounded-xl p-3 mb-4 flex flex-wrap items-center gap-2">
        {/* Sport picker */}
        <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
          {sports.map((s) => (
            <button
              key={s}
              onClick={() => setSport(s)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                sport === s
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {SPORT_EMOJI[s]} {SPORT_LABELS[s]}
            </button>
          ))}
        </div>

        <span className="h-6 w-px bg-border mx-1 hidden sm:inline-block" />

        {/* Day picker */}
        <select
          value={dayFilter}
          onChange={(e) => setDayFilter(e.target.value as DayOfWeek | "any")}
          className="bg-white border border-border rounded-lg px-3 py-1.5 text-sm font-medium"
        >
          <option value="any">Any day</option>
          {DAY_ORDER.map((d) => (
            <option key={d} value={d}>
              {DAY_FULL_LABELS[d]}
            </option>
          ))}
        </select>

        {/* Time-of-day pill */}
        <div className="flex bg-gray-50 rounded-lg overflow-hidden">
          {(["any", "morning", "afternoon", "evening"] as TimeOfDay[]).map(
            (t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors capitalize ${
                  timeFilter === t
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {t === "any" ? "Any time" : t}
              </button>
            ),
          )}
        </div>

        {/* Free-only toggle */}
        <label className="flex items-center gap-1.5 text-sm cursor-pointer ml-auto">
          <input
            type="checkbox"
            checked={freeOnly}
            onChange={(e) => setFreeOnly(e.target.checked)}
            className="rounded border-border text-primary focus:ring-primary"
          />
          Free only
        </label>
      </div>

      {/* Summary line */}
      <p className="text-sm text-text-secondary mb-3">
        {filteredSessions.length} session
        {filteredSessions.length !== 1 ? "s" : ""} at {visibleCenters.length}{" "}
        location{visibleCenters.length !== 1 ? "s" : ""}
        {freeLocations > 0 && (
          <>
            {" "}
            · <span className="text-success font-medium">
              Free at {freeLocations}
            </span>
          </>
        )}
      </p>

      {/* Calendar + map */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(360px,460px)]">
        <div className="order-2 lg:order-1 min-w-0">
          {filteredSessions.length === 0 ? (
            <div className="bg-white border border-border rounded-xl p-10 text-center text-text-secondary">
              <p className="text-lg font-medium mb-1">No sessions match</p>
              <p className="text-sm">Try widening your filters.</p>
            </div>
          ) : (
            <CalendarTimeGrid
              sessions={filteredSessions}
              today={today}
              hoveredCenterId={hoveredCenterId}
              selectedCenterId={selectedCenterId}
              onHoverCenter={setHoveredCenterId}
              onSelectCenter={setSelectedCenterId}
            />
          )}
        </div>

        <div className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-20">
            <MapView
              centers={visibleCenters}
              height="520px"
              highlightedCenterId={hoveredCenterId ?? selectedCenterId}
              colorByCenterId={colorByCenterId}
              onHoverCenter={setHoveredCenterId}
              onSelectCenter={setSelectedCenterId}
            />
            <p className="text-xs text-text-secondary mt-2">
              Tip — hover a block on the calendar to spot it on the map, or
              hover a pin to see that centre&apos;s sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
