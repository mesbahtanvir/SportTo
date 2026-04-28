"use client";

import { useMemo, useState } from "react";
import { ChevronUp, SlidersHorizontal, X } from "lucide-react";
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
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [mobileMapCollapsed, setMobileMapCollapsed] = useState(false);

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

  const highlightedId = hoveredCenterId ?? selectedCenterId;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-4 pb-6">
      {/* Sport picker — subdued underline tabs instead of pill group */}
      {sports.length > 1 && (
        <div className="mb-3 -mx-3 px-3 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar">
          <div className="inline-flex items-center gap-5 border-b border-border w-full">
            {sports.map((s) => (
              <button
                key={s}
                onClick={() => setSport(s)}
                className={`shrink-0 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  sport === s
                    ? "text-text-primary border-text-primary/60"
                    : "text-text-secondary border-transparent hover:text-text-primary"
                }`}
              >
                <span className="opacity-70 mr-1" aria-hidden="true">
                  {SPORT_EMOJI[s]}
                </span>
                {SPORT_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Summary + single Adjust control — the only filter affordance */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-xs sm:text-sm text-text-secondary min-w-0 truncate">
          <span className="text-text-primary">{filteredSessions.length}</span>{" "}
          session{filteredSessions.length !== 1 ? "s" : ""}
          <span className="mx-1.5 opacity-50">·</span>
          <span className="text-text-primary">{visibleCenters.length}</span>{" "}
          location{visibleCenters.length !== 1 ? "s" : ""}
          {freeLocations > 0 && (
            <>
              <span className="mx-1.5 opacity-50">·</span>
              {freeLocations} free
            </>
          )}
        </p>
        <button
          onClick={() => setAdjustOpen(true)}
          className="shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-full border border-border bg-white text-sm text-text-secondary hover:text-text-primary hover:border-text-secondary/40 transition-colors"
        >
          <SlidersHorizontal size={13} />
          Adjust
          {activeFilterCount > 0 && (
            <span className="text-[11px] text-text-primary font-medium ml-0.5">
              · {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile: sticky map strip above calendar — always present, collapsible */}
      <div className="lg:hidden sticky top-0 z-30 -mx-3 px-3 bg-background/95 backdrop-blur pt-1 pb-2 mb-2 border-b border-border/50">
        {mobileMapCollapsed ? (
          <button
            onClick={() => setMobileMapCollapsed(false)}
            className="w-full h-10 rounded-lg bg-white border border-border flex items-center justify-between px-3 text-xs text-text-secondary"
          >
            <span>
              Map · {visibleCenters.length} location
              {visibleCenters.length !== 1 ? "s" : ""}
            </span>
            <ChevronUp size={14} className="rotate-180" />
          </button>
        ) : (
          <div className="relative">
            <MapView
              centers={visibleCenters}
              className="h-[32dvh] min-h-[200px]"
              highlightedCenterId={highlightedId}
              focusedCenterId={selectedCenterId}
              colorByCenterId={colorByCenterId}
              onHoverCenter={setHoveredCenterId}
              onSelectCenter={setSelectedCenterId}
              ambient
            />
            <button
              onClick={() => setMobileMapCollapsed(true)}
              aria-label="Collapse map"
              className="absolute top-2 right-2 z-[400] w-7 h-7 rounded-full bg-white/90 backdrop-blur border border-border flex items-center justify-center text-text-secondary hover:text-text-primary"
            >
              <ChevronUp size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Calendar + desktop map column */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(340px,440px)]">
        <div className="min-w-0">
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

        <div className="hidden lg:block">
          <div className="lg:sticky lg:top-20">
            <MapView
              centers={visibleCenters}
              className="h-[calc(100dvh-140px)] max-h-[640px]"
              highlightedCenterId={highlightedId}
              focusedCenterId={selectedCenterId}
              colorByCenterId={colorByCenterId}
              onHoverCenter={setHoveredCenterId}
              onSelectCenter={setSelectedCenterId}
              ambient
            />
          </div>
        </div>
      </div>

      {/* Adjust panel — bottom sheet on mobile, centred panel on desktop */}
      {adjustOpen && (
        <div className="fixed inset-0 z-50 sheet-fade-in">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setAdjustOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4 sm:pointer-events-none">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 pb-[calc(env(safe-area-inset-bottom)+20px)] sm:pb-5 max-h-[80vh] overflow-y-auto border border-border sm:w-full sm:max-w-sm sm:pointer-events-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
                  Adjust
                </h2>
                <button
                  onClick={() => setAdjustOpen(false)}
                  aria-label="Close"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-text-secondary hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-[11px] font-medium uppercase tracking-wide text-text-secondary mb-2 block">
                    Day
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    <FilterTile
                      active={dayFilter === "any"}
                      onClick={() => setDayFilter("any")}
                    >
                      Any
                    </FilterTile>
                    {DAY_ORDER.map((d) => (
                      <FilterTile
                        key={d}
                        active={dayFilter === d}
                        onClick={() => setDayFilter(d)}
                        title={DAY_FULL_LABELS[d]}
                      >
                        {DAY_LABELS[d]}
                      </FilterTile>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium uppercase tracking-wide text-text-secondary mb-2 block">
                    Time
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(
                      ["any", "morning", "afternoon", "evening"] as TimeOfDay[]
                    ).map((t) => (
                      <FilterTile
                        key={t}
                        active={timeFilter === t}
                        onClick={() => setTimeFilter(t)}
                      >
                        <span className="capitalize">{t}</span>
                      </FilterTile>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2.5 text-sm cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={freeOnly}
                      onChange={(e) => setFreeOnly(e.target.checked)}
                      className="rounded border-border text-text-primary focus:ring-text-primary/30"
                    />
                    <span className="text-text-primary">
                      Free sessions only
                    </span>
                  </label>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={clearFilters}
                    className="flex-1 h-10 rounded-lg text-sm text-text-secondary border border-border bg-white hover:text-text-primary"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setAdjustOpen(false)}
                    className="flex-1 h-10 rounded-lg text-sm font-medium bg-text-primary text-white"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterTile({
  active,
  onClick,
  children,
  title,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`h-10 rounded-lg text-sm border transition-colors ${
        active
          ? "bg-text-primary text-white border-text-primary"
          : "bg-white border-border text-text-primary hover:border-text-secondary/50"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-10 text-center">
      <p className="text-sm text-text-secondary mb-4">No sessions match</p>
      <button
        onClick={onReset}
        className="h-9 px-4 rounded-lg bg-text-primary text-white text-sm"
      >
        Reset
      </button>
    </div>
  );
}
