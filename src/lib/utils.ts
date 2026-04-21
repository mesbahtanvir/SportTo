import { DayOfWeek, Sport } from "./types";

export const DAY_ORDER: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

export const DAY_FULL_LABELS: Record<DayOfWeek, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export function formatTime(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${hour12} ${suffix}` : `${hour12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export function getTodayDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  // Force Toronto timezone so SSR and client agree.
  const torontoWeekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Toronto",
    weekday: "short",
  }).format(new Date());
  const map: Record<string, DayOfWeek> = {
    Sun: "sunday",
    Mon: "monday",
    Tue: "tuesday",
    Wed: "wednesday",
    Thu: "thursday",
    Fri: "friday",
    Sat: "saturday",
  };
  return map[torontoWeekday] ?? days[new Date().getDay()];
}

export const NEIGHBORHOOD_COLORS: Record<string, string> = {
  "Kensington-Chinatown": "#8B5CF6",
  Harbourfront: "#0EA5E9",
  "Regent Park": "#F59E0B",
  Cabbagetown: "#10B981",
  "Dundas West": "#EC4899",
  "Harbord Village": "#6366F1",
  "Garden District": "#F97316",
  "St. James Town": "#14B8A6",
  "Moss Park": "#EF4444",
};

// Low-saturation palette — enough hue variance to distinguish centres without
// any single colour demanding attention. Shared between /schedule and the
// integrated calendar so a centre keeps its hue across views.
export const CENTER_COLORS = [
  "#6B7FA8",
  "#8A7CA3",
  "#9C8871",
  "#7A9B85",
  "#B08070",
  "#6E8A96",
  "#8E7F99",
  "#8A937A",
  "#A08A7F",
];

export function colorForCenter(index: number): string {
  return CENTER_COLORS[index % CENTER_COLORS.length];
}

// --- Sport metadata --------------------------------------------------------

export const SPORT_LABELS: Record<Sport, string> = {
  badminton: "Badminton",
  pickleball: "Pickleball",
  basketball: "Basketball",
  volleyball: "Volleyball",
  "table-tennis": "Table Tennis",
};

export const SPORT_EMOJI: Record<Sport, string> = {
  badminton: "🏸",
  pickleball: "🥒",
  basketball: "🏀",
  volleyball: "🏐",
  "table-tennis": "🏓",
};

// --- Time-grid helpers -----------------------------------------------------

// Calendar grid spans 7am → 11pm (covers the earliest 08:45 and latest 22:00
// sessions in the seed data with a bit of padding).
export const GRID_START_HOUR = 7;
export const GRID_END_HOUR = 23;
export const GRID_TOTAL_MINUTES = (GRID_END_HOUR - GRID_START_HOUR) * 60;

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
