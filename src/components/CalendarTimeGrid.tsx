"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { DayOfWeek, Sport } from "@/lib/types";
import {
  DAY_LABELS,
  DAY_ORDER,
  GRID_END_HOUR,
  GRID_START_HOUR,
  GRID_TOTAL_MINUTES,
  SPORT_EMOJI,
  formatTimeRange,
  timeToMinutes,
} from "@/lib/utils";

export interface CalendarSession {
  id: string;
  centerId: string;
  centerSlug: string;
  centerShortName: string;
  color: string;
  sport: Sport;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  cost: number;
  skillLevel: string;
}

interface Props {
  sessions: CalendarSession[];
  today: DayOfWeek;
  hoveredCenterId: string | null;
  selectedCenterId: string | null;
  onHoverCenter: (id: string | null) => void;
  onSelectCenter: (id: string | null) => void;
}

// Each minute of the day gets this many pixels of vertical space.
const PX_PER_MIN = 0.9;
const DAY_HEIGHT_PX = GRID_TOTAL_MINUTES * PX_PER_MIN;
const GRID_START_MIN = GRID_START_HOUR * 60;

interface PlacedSession extends CalendarSession {
  top: number;
  height: number;
  leftPct: number;
  widthPct: number;
}

// Lay out overlapping sessions inside one day column using a simple
// left-to-right sweep. Sessions sharing vertical space are split into equal
// columns within the day.
function layoutDay(sessions: CalendarSession[]): PlacedSession[] {
  const sorted = [...sessions].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
  );

  // Group into clusters of overlapping sessions.
  const clusters: CalendarSession[][] = [];
  let current: CalendarSession[] = [];
  let currentEnd = -Infinity;
  for (const s of sorted) {
    const start = timeToMinutes(s.startTime);
    const end = timeToMinutes(s.endTime);
    if (start >= currentEnd) {
      if (current.length) clusters.push(current);
      current = [s];
      currentEnd = end;
    } else {
      current.push(s);
      currentEnd = Math.max(currentEnd, end);
    }
  }
  if (current.length) clusters.push(current);

  const placed: PlacedSession[] = [];
  for (const cluster of clusters) {
    // Assign each cluster-member to a column; reuse column when its last
    // session has already ended.
    const cols: CalendarSession[][] = [];
    const colIndex = new Map<string, number>();
    for (const s of cluster) {
      const start = timeToMinutes(s.startTime);
      let placedInCol = false;
      for (let i = 0; i < cols.length; i++) {
        const last = cols[i][cols[i].length - 1];
        if (timeToMinutes(last.endTime) <= start) {
          cols[i].push(s);
          colIndex.set(s.id, i);
          placedInCol = true;
          break;
        }
      }
      if (!placedInCol) {
        cols.push([s]);
        colIndex.set(s.id, cols.length - 1);
      }
    }
    const totalCols = cols.length;
    for (const s of cluster) {
      const start = timeToMinutes(s.startTime);
      const end = timeToMinutes(s.endTime);
      const col = colIndex.get(s.id) ?? 0;
      placed.push({
        ...s,
        top: (start - GRID_START_MIN) * PX_PER_MIN,
        height: Math.max(18, (end - start) * PX_PER_MIN - 2),
        leftPct: (col / totalCols) * 100,
        widthPct: 100 / totalCols,
      });
    }
  }
  return placed;
}

export default function CalendarTimeGrid({
  sessions,
  today,
  hoveredCenterId,
  selectedCenterId,
  onHoverCenter,
  onSelectCenter,
}: Props) {
  const router = useRouter();

  const byDay = useMemo(() => {
    const map = new Map<DayOfWeek, CalendarSession[]>();
    for (const day of DAY_ORDER) map.set(day, []);
    for (const s of sessions) map.get(s.dayOfWeek)!.push(s);
    return map;
  }, [sessions]);

  const placedByDay = useMemo(() => {
    const out = new Map<DayOfWeek, PlacedSession[]>();
    for (const day of DAY_ORDER) out.set(day, layoutDay(byDay.get(day) ?? []));
    return out;
  }, [byDay]);

  const hours: number[] = [];
  for (let h = GRID_START_HOUR; h <= GRID_END_HOUR; h++) hours.push(h);

  const focusId = hoveredCenterId ?? selectedCenterId;

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          {/* Day header row */}
          <div
            className="grid sticky top-0 z-10 bg-white border-b border-border"
            style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}
          >
            <div />
            {DAY_ORDER.map((day) => (
              <div
                key={day}
                className={`text-center text-xs font-semibold py-2 ${
                  day === today ? "text-primary" : "text-text-secondary"
                }`}
              >
                {DAY_LABELS[day]}
                {day === today && (
                  <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-primary align-middle" />
                )}
              </div>
            ))}
          </div>

          {/* Grid body */}
          <div
            className="relative grid"
            style={{
              gridTemplateColumns: "56px repeat(7, 1fr)",
              height: DAY_HEIGHT_PX,
            }}
          >
            {/* Hour-label column */}
            <div className="relative border-r border-border">
              {hours.map((h, i) => (
                <div
                  key={h}
                  className="absolute left-0 right-0 -translate-y-1/2 text-[10px] text-text-secondary pr-2 text-right"
                  style={{ top: i * 60 * PX_PER_MIN }}
                >
                  {i === 0 ? "" : formatHour(h)}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {DAY_ORDER.map((day) => {
              const placed = placedByDay.get(day) ?? [];
              return (
                <div
                  key={day}
                  className={`relative border-r border-border last:border-r-0 ${
                    day === today ? "bg-primary-light/30" : ""
                  }`}
                >
                  {/* Hour gridlines */}
                  {hours.map((h, i) => (
                    <div
                      key={h}
                      className="absolute left-0 right-0 border-t border-dashed border-gray-100"
                      style={{ top: i * 60 * PX_PER_MIN }}
                    />
                  ))}

                  {placed.map((s) => {
                    const isFocus = focusId === s.centerId;
                    const isDimmed = focusId !== null && !isFocus;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onMouseEnter={() => onHoverCenter(s.centerId)}
                        onMouseLeave={() => onHoverCenter(null)}
                        onFocus={() => onHoverCenter(s.centerId)}
                        onBlur={() => onHoverCenter(null)}
                        onClick={() => {
                          onSelectCenter(s.centerId);
                          router.push(`/centers/${s.centerSlug}`);
                        }}
                        title={`${s.centerShortName} · ${formatTimeRange(
                          s.startTime,
                          s.endTime,
                        )}`}
                        className={`absolute text-left rounded-md px-1.5 py-1 overflow-hidden text-white transition-all ${
                          isFocus
                            ? "ring-2 ring-offset-1 ring-accent shadow-md z-20"
                            : ""
                        } ${isDimmed ? "opacity-30" : "opacity-100"}`}
                        style={{
                          top: s.top,
                          height: s.height,
                          left: `calc(${s.leftPct}% + 2px)`,
                          width: `calc(${s.widthPct}% - 4px)`,
                          backgroundColor: s.color,
                        }}
                      >
                        <div className="text-[10px] font-semibold leading-tight truncate">
                          {SPORT_EMOJI[s.sport]} {s.centerShortName}
                        </div>
                        <div className="text-[9px] opacity-90 truncate">
                          {formatTimeRange(s.startTime, s.endTime)}
                        </div>
                        {s.height > 40 && (
                          <div className="text-[9px] opacity-80 truncate">
                            {s.cost === 0 ? "Free" : `$${s.cost}`}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}
