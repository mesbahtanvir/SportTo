"use client";

import { useMemo, useState } from "react";
import { CalendarDays, MapPin, SlidersHorizontal, X } from "lucide-react";
import { centers } from "@/data/centers";
import { DayOfWeek, Sport } from "@/lib/types";
import {
  DAY_FULL_LABELS,
  DAY_LABELS,
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
type MobileView = "calendar" | "map";

function timeInRange(start: string, filter: TimeOfDay): boolean {
  if (filter === "any") return true;
  const h = parseInt(start.split(":")[0]);
  if (filter === "morning") return h < 12;
  if (filter === "afternoon") return h >= 12 && h < 17;
  return h >= 17;
}

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
  const [mobileView, setMobileView] = useState<MobileView>("calendar");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

  const activeFilterCount =
    (dayFilter !== "any" ? 1 : 0) +
    (timeFilter !== "any" ? 1 : 0) +
    (freeOnly ? 1 : 0);

  function clearFilters() {
    setDayFilter("any");
    setTimeFilter("any");
    setFreeOnly(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-4 pb-6">
      {/* Compact header */}
      <div className="mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl sm:hidden" aria-hidden="true">
            {SPORT_EMOJI[sport]}
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary leading-tight">
              Find play in Toronto
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
              Community-centre drop-ins — when &amp; where at a glance.
            </p>
          </div>
        </div>
      </div>

      {/* Sport picker — only shown if multiple sports available */}
      {sports.length > 1 && (
        <div className="mb-3 -mx-3 px-3 sm:mx-0 sm:px-0 overflow-x-auto">
          <div className="inline-flex items-center gap-1 bg-gray-100 rounded-full p-1">
            {sports.map((s) => (
              <button
                key={s}
                onClick={() => setSport(s)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  sport === s
                    ? "bg-white text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {SPORT_EMOJI[s]} {SPORT_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile filter row (scrollable chip strip + filters button) */}
      <div className="sm:hidden mb-3 -mx-3 px-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className={`shrink-0 flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-sm font-medium transition-colors ${
            activeFilterCount > 0
              ? "bg-primary text-white border-primary"
              : "bg-white text-text-primary border-border"
          }`}
        >
          <SlidersHorizontal size={14} />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-white/20 text-white text-[11px] font-semibold min-w-5 h-5 px-1 flex items-center justify-center rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
        {DAY_ORDER.map((d) => {
          const isActive = dayFilter === d;
          return (
            <button
              key={d}
              onClick={() => setDayFilter(isActive ? "any" : d)}
              className={`shrink-0 h-9 px-3.5 rounded-full border text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white border-primary"
                  : d === today
                    ? "bg-primary-light text-primary border-primary-light"
                    : "bg-white text-text-primary border-border"
              }`}
            >
              {DAY_LABELS[d]}
            </button>
          );
        })}
      </div>

      {/* Desktop filter bar */}
      <div className="hidden sm:flex bg-white border border-border rounded-xl p-2.5 mb-4 flex-wrap items-center gap-2">
        <select
          value={dayFilter}
          onChange={(e) => setDayFilter(e.target.value as DayOfWeek | "any")}
          className="bg-gray-50 border-0 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
        >
          <option value="any">Any day</option>
          {DAY_ORDER.map((d) => (
            <option key={d} value={d}>
              {DAY_FULL_LABELS[d]}
            </option>
          ))}
        </select>

        <div className="flex bg-gray-50 rounded-lg p-1 gap-1">
          {(["any", "morning", "afternoon", "evening"] as TimeOfDay[]).map(
            (t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                  timeFilter === t
                    ? "bg-white text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {t === "any" ? "Any time" : t}
              </button>
            ),
          )}
        </div>

        <button
          onClick={() => setFreeOnly((v) => !v)}
          className={`h-9 px-3.5 rounded-lg text-sm font-medium border transition-colors ${
            freeOnly
              ? "bg-success text-white border-success"
              : "bg-white text-text-primary border-border hover:bg-gray-50"
          }`}
        >
          Free only
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="h-9 px-3 text-sm font-medium text-text-secondary hover:text-accent ml-auto"
          >
            Clear
          </button>
        )}
      </div>

      {/* Summary line */}
      <p className="text-xs sm:text-sm text-text-secondary mb-3">
        <span className="font-semibold text-text-primary">
          {filteredSessions.length}
        </span>{" "}
        session{filteredSessions.length !== 1 ? "s" : ""} at{" "}
        <span className="font-semibold text-text-primary">
          {visibleCenters.length}
        </span>{" "}
        location{visibleCenters.length !== 1 ? "s" : ""}
        {freeLocations > 0 && (
          <>
            {" · "}
            <span className="text-success font-medium">
              Free at {freeLocations}
            </span>
          </>
        )}
      </p>

      {/* Mobile: segmented Calendar / Map switch */}
      <div className="lg:hidden mb-3 flex bg-gray-100 rounded-full p-1 w-full max-w-xs">
        {(["calendar", "map"] as MobileView[]).map((v) => {
          const active = mobileView === v;
          const Icon = v === "calendar" ? CalendarDays : MapPin;
          return (
            <button
              key={v}
              onClick={() => setMobileView(v)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                active
                  ? "bg-white text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Icon size={14} />
              <span className="capitalize">{v}</span>
            </button>
          );
        })}
      </div>

      {/* Calendar + map */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(360px,460px)]">
        <div
          className={`min-w-0 ${
            mobileView === "calendar" ? "block" : "hidden"
          } lg:block`}
        >
          {filteredSessions.length === 0 ? (
            <EmptyState onReset={clearFilters} />
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

        <div
          className={`${
            mobileView === "map" ? "block" : "hidden"
          } lg:block`}
        >
          <div className="lg:sticky lg:top-4">
            <MapView
              centers={visibleCenters}
              className="h-[calc(100dvh-260px)] min-h-[320px] sm:h-[460px] lg:h-[620px]"
              highlightedCenterId={hoveredCenterId ?? selectedCenterId}
              colorByCenterId={colorByCenterId}
              onHoverCenter={setHoveredCenterId}
              onSelectCenter={setSelectedCenterId}
            />
            <p className="hidden lg:block text-xs text-text-secondary mt-2">
              Tip — hover a block to spot it on the map, or hover a pin to see
              that centre&apos;s sessions.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
      {mobileFiltersOpen && (
        <div className="sm:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-5 pb-[calc(env(safe-area-inset-bottom)+20px)] max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close"
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2 block">
                  Day
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => setDayFilter("any")}
                    className={`h-10 rounded-lg text-sm font-medium border ${
                      dayFilter === "any"
                        ? "bg-primary text-white border-primary"
                        : "bg-white border-border"
                    }`}
                  >
                    Any
                  </button>
                  {DAY_ORDER.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDayFilter(d)}
                      className={`h-10 rounded-lg text-sm font-medium border ${
                        dayFilter === d
                          ? "bg-primary text-white border-primary"
                          : "bg-white border-border"
                      }`}
                    >
                      {DAY_LABELS[d]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2 block">
                  Time of day
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["any", "morning", "afternoon", "evening"] as TimeOfDay[]).map(
                    (t) => (
                      <button
                        key={t}
                        onClick={() => setTimeFilter(t)}
                        className={`h-10 rounded-lg text-sm font-medium capitalize border ${
                          timeFilter === t
                            ? "bg-primary text-white border-primary"
                            : "bg-white border-border"
                        }`}
                      >
                        {t === "any" ? "Any" : t}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div>
                <button
                  onClick={() => setFreeOnly((v) => !v)}
                  className={`w-full h-11 rounded-lg text-sm font-medium border transition-colors ${
                    freeOnly
                      ? "bg-success text-white border-success"
                      : "bg-white border-border"
                  }`}
                >
                  {freeOnly ? "✓ Free only" : "Free sessions only"}
                </button>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={clearFilters}
                  className="flex-1 h-11 rounded-lg text-sm font-medium border border-border bg-white"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 h-11 rounded-lg text-sm font-medium bg-primary text-white"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="bg-white border border-border rounded-xl p-10 text-center">
      <div className="text-3xl mb-2" aria-hidden="true">
        🏸
      </div>
      <p className="text-base font-semibold text-text-primary mb-1">
        No sessions match
      </p>
      <p className="text-sm text-text-secondary mb-4">
        Try widening your filters.
      </p>
      <button
        onClick={onReset}
        className="h-10 px-4 rounded-lg bg-primary text-white text-sm font-medium"
      >
        Reset filters
      </button>
    </div>
  );
}
