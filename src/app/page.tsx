"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { centers } from "@/data/centers";
import { DayOfWeek } from "@/lib/types";
import { DAY_ORDER, DAY_FULL_LABELS } from "@/lib/utils";
import CenterCard from "@/components/CenterCard";
import MapView from "@/components/MapView";

type TimeOfDay = "any" | "morning" | "afternoon" | "evening";

function timeInRange(start: string, filter: TimeOfDay): boolean {
  if (filter === "any") return true;
  const h = parseInt(start.split(":")[0]);
  if (filter === "morning") return h < 12;
  if (filter === "afternoon") return h >= 12 && h < 17;
  return h >= 17;
}

export default function HomePage() {
  const [dayFilter, setDayFilter] = useState<DayOfWeek | "any">("any");
  const [timeFilter, setTimeFilter] = useState<TimeOfDay>("any");

  const filtered = useMemo(() => {
    return centers.filter((center) => {
      return center.schedules.some((s) => {
        const dayMatch = dayFilter === "any" || s.dayOfWeek === dayFilter;
        const timeMatch = timeInRange(s.startTime, timeFilter);
        return dayMatch && timeMatch;
      });
    });
  }, [dayFilter, timeFilter]);

  const totalSessions = filtered.reduce(
    (sum, c) =>
      sum +
      c.schedules.filter((s) => {
        const dayMatch = dayFilter === "any" || s.dayOfWeek === dayFilter;
        const timeMatch = timeInRange(s.startTime, timeFilter);
        return dayMatch && timeMatch;
      }).length,
    0
  );

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-teal-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Find Badminton in
            <br />
            Downtown Toronto
          </h1>
          <p className="text-teal-100 text-lg mb-8 max-w-lg">
            Drop-in schedules at community centres near you. Find a court, grab
            a racket, and play.
          </p>

          {/* Filter bar */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex flex-col sm:flex-row gap-3">
            <select
              value={dayFilter}
              onChange={(e) =>
                setDayFilter(e.target.value as DayOfWeek | "any")
              }
              className="bg-white text-text-primary rounded-lg px-4 py-2.5 text-sm font-medium flex-1 sm:flex-initial"
            >
              <option value="any">Any Day</option>
              {DAY_ORDER.map((day) => (
                <option key={day} value={day}>
                  {DAY_FULL_LABELS[day]}
                </option>
              ))}
            </select>

            <div className="flex bg-white/20 rounded-lg overflow-hidden">
              {(["any", "morning", "afternoon", "evening"] as TimeOfDay[]).map(
                (t) => (
                  <button
                    key={t}
                    onClick={() => setTimeFilter(t)}
                    className={`px-4 py-2.5 text-sm font-medium transition-colors capitalize ${
                      timeFilter === t
                        ? "bg-white text-primary"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    {t === "any" ? "Any Time" : t}
                  </button>
                )
              )}
            </div>

            <button className="bg-accent hover:bg-red-500 text-white rounded-lg px-6 py-2.5 text-sm font-medium flex items-center gap-2 transition-colors">
              <Search size={16} />
              Find Sessions
            </button>
          </div>

          <p className="text-teal-200 text-sm mt-3">
            Showing {totalSessions} session{totalSessions !== 1 ? "s" : ""} at{" "}
            {filtered.length} location{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      </section>

      {/* Card grid */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">Community Centres</h2>
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-text-secondary">
            <p className="text-lg font-medium mb-1">No sessions found</p>
            <p className="text-sm">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((center) => (
              <CenterCard key={center.id} center={center} />
            ))}
          </div>
        )}
      </section>

      {/* Map */}
      <section className="max-w-6xl mx-auto px-4 pb-10">
        <h2 className="text-2xl font-bold mb-4">Map</h2>
        <MapView centers={filtered} />
      </section>
    </>
  );
}
