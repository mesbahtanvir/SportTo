import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Phone,
  Globe,
  MapPin,
  Train,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { centers, getCenterBySlug } from "@/data/centers";
import {
  DAY_ORDER,
  DAY_FULL_LABELS,
  formatTimeRange,
  getTodayDayOfWeek,
} from "@/lib/utils";
import NeighborhoodBadge from "@/components/NeighborhoodBadge";
import CenterDetailMap from "./CenterDetailMap";

export function generateStaticParams() {
  return centers.map((c) => ({ slug: c.slug }));
}

export default async function CenterDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const center = getCenterBySlug(slug);
  if (!center) notFound();

  const today = getTodayDayOfWeek();
  const schedulesByDay = DAY_ORDER.map((day) => ({
    day,
    sessions: center.schedules.filter((s) => s.dayOfWeek === day),
  }));

  const nearbyCenters = centers
    .filter((c) => c.id !== center.id)
    .slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/centers"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary mb-6"
      >
        <ArrowLeft size={16} />
        All Centres
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{center.name}</h1>
          <NeighborhoodBadge neighborhood={center.neighborhood} />

          <div className="mt-4 space-y-2 text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-primary shrink-0" />
              <span>
                {center.address}, Toronto, ON {center.postalCode}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-primary shrink-0" />
              <a href={`tel:${center.phone}`} className="hover:text-primary">
                {center.phone}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-primary shrink-0" />
              <a
                href={center.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary truncate"
              >
                Visit website
              </a>
            </div>
            {center.transitAccess.length > 0 && (
              <div className="flex items-start gap-2">
                <Train size={16} className="text-primary shrink-0 mt-0.5" />
                <span>{center.transitAccess.join(" / ")}</span>
              </div>
            )}
          </div>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${center.coordinates.lat},${center.coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            <MapPin size={16} />
            Get Directions
          </a>
        </div>

        {/* Mini map */}
        <div className="w-full md:w-80 shrink-0">
          <CenterDetailMap center={center} allCenters={[center]} />
        </div>
      </div>

      {/* Schedule table */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Weekly Schedule</h2>
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {schedulesByDay.map(({ day, sessions }) => {
            const isToday = day === today;
            return (
              <div
                key={day}
                className={`border-b border-border last:border-b-0 ${
                  isToday ? "bg-primary-light/50" : ""
                }`}
              >
                <div className="flex items-start gap-4 p-4">
                  <div className="w-24 shrink-0">
                    <span
                      className={`text-sm font-semibold ${
                        isToday ? "text-primary" : "text-text-primary"
                      }`}
                    >
                      {DAY_FULL_LABELS[day]}
                    </span>
                    {isToday && (
                      <span className="block text-xs text-primary font-medium">
                        Today
                      </span>
                    )}
                  </div>
                  {sessions.length === 0 ? (
                    <span className="text-sm text-gray-400 italic">
                      No badminton
                    </span>
                  ) : (
                    <div className="flex-1 space-y-2">
                      {sessions.map((s) => (
                        <div
                          key={s.id}
                          className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
                        >
                          <span className="font-medium text-text-primary">
                            {formatTimeRange(s.startTime, s.endTime)}
                          </span>
                          <span className="capitalize text-text-secondary">
                            {s.sessionType}
                          </span>
                          <span className="capitalize text-text-secondary">
                            {s.ageGroup === "all" ? "All ages" : s.ageGroup}
                          </span>
                          <span className="capitalize text-text-secondary">
                            {s.skillLevel === "all"
                              ? "All levels"
                              : s.skillLevel}
                          </span>
                          <span
                            className={`font-medium ${
                              s.cost === 0
                                ? "text-success"
                                : "text-text-primary"
                            }`}
                          >
                            {s.cost === 0 ? "Free" : `$${s.cost}`}
                            {s.costNote && (
                              <span className="text-xs text-text-secondary ml-1">
                                ({s.costNote})
                              </span>
                            )}
                          </span>
                          {s.notes && (
                            <span className="w-full text-xs text-text-secondary">
                              {s.notes}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Info cards */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Centre Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-semibold mb-2">What to Bring</h3>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>
                {center.racketsAvailable
                  ? "Rackets available on-site"
                  : "Bring your own racket"}
              </li>
              <li>
                {center.shuttlesProvided
                  ? "Shuttlecocks provided"
                  : "Bring your own shuttlecocks"}
              </li>
              <li>Non-marking indoor shoes required</li>
              <li>Water bottle recommended</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-semibold mb-2">Facility Details</h3>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>
                {center.numberOfCourts} court
                {center.numberOfCourts > 1 ? "s" : ""}
              </li>
              <li className="capitalize">Operated by: {center.operator}</li>
              <li className="flex items-center gap-1">
                {center.schedules.some((s) => s.reservationRequired) ? (
                  <>
                    <AlertCircle size={14} className="text-warning" />
                    Some sessions require reservation
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} className="text-success" />
                    Walk-in welcome
                  </>
                )}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Verified badge */}
      <div className="text-xs text-text-secondary mb-8">
        Last verified: {center.lastVerified}. Always confirm schedules directly
        with the centre.
      </div>

      {/* Nearby centres */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Other Centres</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {nearbyCenters.map((c) => (
            <Link
              key={c.id}
              href={`/centers/${c.slug}`}
              className="bg-white rounded-xl border border-border p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-sm mb-1">{c.shortName}</h3>
              <p className="text-xs text-text-secondary">{c.address}</p>
              <p className="text-xs text-primary mt-1">
                {c.schedules.length} session
                {c.schedules.length !== 1 ? "s" : ""}/week
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
