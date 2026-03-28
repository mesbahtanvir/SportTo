export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type Neighborhood =
  | "Kensington-Chinatown"
  | "Harbourfront"
  | "Regent Park"
  | "Cabbagetown"
  | "Dundas West"
  | "Harbord Village"
  | "Garden District"
  | "St. James Town"
  | "Moss Park";

export type CenterOperator = "city" | "non-profit" | "university";

export interface BadmintonSession {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "19:00" 24h
  endTime: string;
  sessionType: "drop-in" | "registered" | "league";
  ageGroup: "all" | "adult" | "senior" | "youth";
  skillLevel: "all" | "beginner" | "intermediate" | "advanced";
  cost: number; // dollars per session, 0 = free
  costNote?: string; // e.g. "$25/yr membership"
  reservationRequired: boolean;
  notes?: string;
}

export interface CommunityCenter {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  address: string;
  postalCode: string;
  neighborhood: Neighborhood;
  coordinates: { lat: number; lng: number };
  phone: string;
  website: string;
  operator: CenterOperator;
  transitAccess: string[];
  numberOfCourts: number;
  racketsAvailable: boolean;
  shuttlesProvided: boolean;
  schedules: BadmintonSession[];
  lastVerified: string; // ISO date
}
