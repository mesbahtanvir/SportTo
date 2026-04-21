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

const PX_PER_MIN = 0.9;
const DAY_HEIGHT_PX = GRID_TOTAL_MINUTES * PX_PER_MIN;
const GRID_START_MIN = GRID_START_HOUR * 60;

// Mobile day column = 82px, desktop = 1fr. Hour label column sticks left.
const HOUR_COL_PX = 44;
const MOBILE_DAY_COL_PX = 82;

interface PlacedSession extends CalendarSession {
  top: number;
  height: number;
  leftPct: number;
  widthPct: number;
}

function layoutDay(sessions: CalendarSession[]): PlacedSession[] {
  const sorted = [...sessions].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
  );

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
        height: Math.max(22, (end - start) * PX_PER_MIN - 2),
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

  // CSS grid template: sticky hour column then 7 day columns. Day columns have
  // a mobile-friendly fixed min width; the parent enables horizontal scroll.
  const gridTemplate = `${HOUR_COL_PX}px repeat(7, minmax(${MOBILE_DAY_COL_PX}px, 1fr))`;

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="overflow-x-auto no-scrollbar">
        <div>
          {/* Day header row */}
          <div
            className="grid sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-border"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            <div className="sticky left-0 z-10 bg-white/90 backdrop-blur" />
            {DAY_ORDER.map((day) => {
              const isToday = day === today;
              return (
                <div
                  key={day}
                  className="text-center py-2.5 border-l border-border/60"
                >
                  <div
                    className={`inline-block text-[10px] font-medium uppercase tracking-wide ${
                      isToday
                        ? "text-text-primary border-b border-text-primary/50 pb-0.5"
                        : "text-text-secondary"
                    }`}
                  >
                    {DAY_LABELS[day]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grid body */}
          <div
            className="relative grid"
            style={{
              gridTemplateColumns: gridTemplate,
              height: DAY_HEIGHT_PX,
            }}
          >
            {/* Sticky hour-label column */}
            <div className="sticky left-0 z-10 bg-white/90 backdrop-blur border-r border-border">
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
                  className={`relative border-l border-border/60 ${
                    day === today ? "bg-gray-50/60" : ""
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
                        className={`absolute text-left rounded-md px-2 py-1 overflow-hidden text-white transition-opacity duration-200 ${
                          isFocus ? "z-20" : ""
                        } ${isDimmed ? "opacity-30" : "opacity-100"}`}
                        style={{
                          top: s.top,
                          height: s.height,
                          left: `calc(${s.leftPct}% + 2px)`,
                          width: `calc(${s.widthPct}% - 4px)`,
                          backgroundColor: s.color,
                          boxShadow: isFocus
                            ? `inset 0 0 0 2px rgba(255,255,255,0.9), 0 0 0 1px ${s.color}`
                            : undefined,
                        }}
                      >
                        <div className="text-[11px] font-semibold leading-tight truncate">
                          {SPORT_EMOJI[s.sport]} {s.centerShortName}
                        </div>
                        {s.height > 32 && (
                          <div className="text-[10px] opacity-90 leading-tight truncate">
                            {formatTimeRange(s.startTime, s.endTime)}
                          </div>
                        )}
                        {s.height > 56 && (
                          <div className="text-[10px] opacity-80 leading-tight truncate">
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
