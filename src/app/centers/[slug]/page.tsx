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
    <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-4 sm:pt-8 pb-6">
      {/* Back link */}
      <Link
        href="/centers"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={14} strokeWidth={1.75} />
        All centres
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight mb-2 leading-tight">
            {center.name}
          </h1>
          <NeighborhoodBadge neighborhood={center.neighborhood} />

          <div className="mt-5 space-y-2 text-sm text-text-secondary">
            <div className="flex items-center gap-2.5">
              <MapPin size={14} strokeWidth={1.75} className="text-text-secondary shrink-0" />
              <span>
                {center.address}, Toronto, ON {center.postalCode}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone size={14} strokeWidth={1.75} className="text-text-secondary shrink-0" />
              <a href={`tel:${center.phone}`} className="hover:text-text-primary transition-colors">
                {center.phone}
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <Globe size={14} strokeWidth={1.75} className="text-text-secondary shrink-0" />
              <a
                href={center.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text-primary truncate transition-colors"
              >
                Visit website
              </a>
            </div>
            {center.transitAccess.length > 0 && (
              <div className="flex items-start gap-2.5">
                <Train size={14} strokeWidth={1.75} className="text-text-secondary shrink-0 mt-0.5" />
                <span>{center.transitAccess.join(" / ")}</span>
              </div>
            )}
          </div>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${center.coordinates.lat},${center.coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-5 h-9 px-4 bg-white border border-border rounded-lg text-sm text-text-primary hover:border-text-primary/40 hover:bg-primary-light/40 transition-colors"
          >
            <MapPin size={14} strokeWidth={1.75} className="text-text-secondary" />
            Get directions
          </a>
        </div>

        {/* Mini map */}
        <div className="w-full md:w-80 shrink-0">
          <CenterDetailMap center={center} allCenters={[center]} />
        </div>
      </div>

      {/* Schedule */}
      <section className="mb-12">
        <h2 className="text-[11px] font-medium uppercase tracking-wider text-text-secondary mb-3">
          Weekly schedule
        </h2>
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {schedulesByDay.map(({ day, sessions }) => {
            const isToday = day === today;
            return (
              <div
                key={day}
                className={`border-b border-border-soft last:border-b-0 ${
                  isToday ? "bg-primary-light/60" : ""
                }`}
              >
                <div className="flex items-start gap-4 p-4">
                  <div className="w-24 shrink-0">
                    <span className="text-sm font-medium text-text-primary">
                      {DAY_FULL_LABELS[day]}
                    </span>
                    {isToday && (
                      <span className="block text-[11px] text-text-secondary mt-0.5">
                        Today
                      </span>
                    )}
                  </div>
                  {sessions.length === 0 ? (
                    <span className="text-sm text-text-secondary/60">—</span>
                  ) : (
                    <div className="flex-1 space-y-2">
                      {sessions.map((s) => (
                        <div
                          key={s.id}
                          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
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
                          <span className="text-text-primary">
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

      {/* Info */}
      <section className="mb-12">
        <h2 className="text-[11px] font-medium uppercase tracking-wider text-text-secondary mb-3">
          Centre info
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="text-sm font-medium mb-2 text-text-primary">
              What to bring
            </h3>
            <ul className="text-sm text-text-secondary space-y-1.5 leading-relaxed">
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
              <li>Non-marking indoor shoes</li>
              <li>Water bottle</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="text-sm font-medium mb-2 text-text-primary">
              Facility
            </h3>
            <ul className="text-sm text-text-secondary space-y-1.5 leading-relaxed">
              <li>
                {center.numberOfCourts} court
                {center.numberOfCourts > 1 ? "s" : ""}
              </li>
              <li className="capitalize">Operated by {center.operator}</li>
              <li className="flex items-center gap-1.5">
                {center.schedules.some((s) => s.reservationRequired) ? (
                  <>
                    <AlertCircle size={13} strokeWidth={1.75} className="text-text-secondary" />
                    Some sessions need a reservation
                  </>
                ) : (
                  <>
                    <CheckCircle size={13} strokeWidth={1.75} className="text-text-secondary" />
                    Walk-in welcome
                  </>
                )}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Verified */}
      <div className="text-xs text-text-secondary/80 mb-10">
        Last verified {center.lastVerified} · Confirm with the centre before
        you go.
      </div>

      {/* Nearby centres */}
      <section>
        <h2 className="text-[11px] font-medium uppercase tracking-wider text-text-secondary mb-3">
          Other centres
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {nearbyCenters.map((c) => (
            <Link
              key={c.id}
              href={`/centers/${c.slug}`}
              className="bg-white rounded-xl border border-border p-4 hover:border-text-secondary/40 transition-colors"
            >
              <h3 className="text-sm font-medium text-text-primary mb-1">{c.shortName}</h3>
              <p className="text-xs text-text-secondary">{c.address}</p>
              <p className="text-xs text-text-secondary/80 mt-1.5">
                {c.schedules.length} session
                {c.schedules.length !== 1 ? "s" : ""} / week
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
