"use client";

import { useState, useMemo } from "react";
import { Filter, X } from "lucide-react";
import { centers } from "@/data/centers";
import { DayOfWeek } from "@/lib/types";
import { DAY_ORDER, DAY_FULL_LABELS } from "@/lib/utils";
import CenterCard from "@/components/CenterCard";
import MapView from "@/components/MapView";

const neighborhoods = Array.from(
  new Set(centers.map((c) => c.neighborhood))
).sort();

export default function CentersPage() {
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>(
    []
  );
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [freeOnly, setFreeOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return centers.filter((center) => {
      if (
        selectedNeighborhoods.length > 0 &&
        !selectedNeighborhoods.includes(center.neighborhood)
      )
        return false;

      if (selectedDays.length > 0) {
        const hasDayMatch = center.schedules.some((s) =>
          selectedDays.includes(s.dayOfWeek)
        );
        if (!hasDayMatch) return false;
      }

      if (freeOnly && !center.schedules.some((s) => s.cost === 0))
        return false;

      return true;
    });
  }, [selectedNeighborhoods, selectedDays, freeOnly]);

  const activeFilterCount =
    selectedNeighborhoods.length +
    selectedDays.length +
    (freeOnly ? 1 : 0);

  function toggleNeighborhood(n: string) {
    setSelectedNeighborhoods((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]
    );
  }

  function toggleDay(d: DayOfWeek) {
    setSelectedDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  function clearFilters() {
    setSelectedNeighborhoods([]);
    setSelectedDays([]);
    setFreeOnly(false);
  }

  const filterPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-2">
          Neighborhood
        </h3>
        <div className="space-y-1.5">
          {neighborhoods.map((n) => (
            <label key={n} className="flex items-center gap-2 text-sm cursor-pointer text-text-primary">
              <input
                type="checkbox"
                checked={selectedNeighborhoods.includes(n)}
                onChange={() => toggleNeighborhood(n)}
                className="rounded border-border text-text-primary focus:ring-text-primary/30"
              />
              {n}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-2">
          Day of Week
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {DAY_ORDER.map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                selectedDays.includes(day)
                  ? "bg-text-primary text-white border-text-primary"
                  : "bg-white text-text-secondary border-border hover:text-text-primary"
              }`}
            >
              {DAY_FULL_LABELS[day]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm cursor-pointer text-text-primary">
          <input
            type="checkbox"
            checked={freeOnly}
            onChange={(e) => setFreeOnly(e.target.checked)}
            className="rounded border-border text-text-primary focus:ring-text-primary/30"
          />
          Free sessions only
        </label>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="text-sm text-text-secondary hover:text-text-primary"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-4 sm:pt-8 pb-6">
      <div className="flex items-end justify-between gap-3 mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl font-semibold leading-tight">
          Community centres
          <span className="ml-2 text-xs sm:text-sm font-normal text-text-secondary">
            {filtered.length}
          </span>
        </h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden shrink-0 flex items-center gap-1.5 h-8 px-3 bg-white border border-border rounded-full text-sm text-text-secondary hover:text-text-primary"
        >
          <Filter size={13} />
          Filters
          {activeFilterCount > 0 && (
            <span className="text-[11px] text-text-primary font-medium">
              · {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:block w-56 shrink-0">{filterPanel}</aside>

        {/* Mobile filter sheet */}
        {showFilters && (
          <div className="fixed inset-0 z-50 md:hidden sheet-fade-in">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setShowFilters(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-5 pb-[calc(env(safe-area-inset-bottom)+20px)] max-h-[80vh] overflow-y-auto border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
                  Filters
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  aria-label="Close"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-text-secondary hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>
              {filterPanel}
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {filtered.map((center) => (
              <CenterCard key={center.id} center={center} />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center py-16 text-sm text-text-secondary">
              No centres match
            </p>
          )}
          <MapView
            centers={filtered}
            className="h-[320px] sm:h-[420px] lg:h-[480px]"
          />
        </div>
      </div>
    </div>
  );
}
