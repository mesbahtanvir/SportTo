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
            <label key={n} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selectedNeighborhoods.includes(n)}
                onChange={() => toggleNeighborhood(n)}
                className="rounded border-border text-primary focus:ring-primary"
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
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                selectedDays.includes(day)
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-text-secondary hover:bg-gray-200"
              }`}
            >
              {DAY_FULL_LABELS[day]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={freeOnly}
            onChange={(e) => setFreeOnly(e.target.checked)}
            className="rounded border-border text-primary focus:ring-primary"
          />
          Free sessions only
        </label>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="text-sm text-accent hover:text-red-600 font-medium"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Community Centres</h1>
          <p className="text-text-secondary mt-1">
            {filtered.length} location{filtered.length !== 1 ? "s" : ""} with
            badminton
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium"
        >
          <Filter size={16} />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:block w-56 shrink-0">{filterPanel}</aside>

        {/* Mobile filter sheet */}
        {showFilters && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowFilters(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Filters</h2>
                <button onClick={() => setShowFilters(false)}>
                  <X size={20} />
                </button>
              </div>
              {filterPanel}
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((center) => (
              <CenterCard key={center.id} center={center} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-text-secondary">
              <p className="text-lg font-medium mb-1">No centres match</p>
              <p className="text-sm">Try adjusting your filters.</p>
            </div>
          )}
          <MapView centers={filtered} />
        </div>
      </div>
    </div>
  );
}
