import { ExternalLink } from "lucide-react";

const sources = [
  {
    name: "City of Toronto Drop-in Sports",
    url: "https://www.toronto.ca/explore-enjoy/parks-recreation/program-activities/sports/drop-in-sports-map/",
  },
  {
    name: "University Settlement",
    url: "https://universitysettlement.ca/fitness-and-recreation/badminton/",
  },
  {
    name: "UofT Athletic Centre",
    url: "https://kpe.utoronto.ca/sport-recreationrecreational-fitness-drop-sportsdrop-sports-activities/drop-badminton",
  },
  {
    name: "TMU Recreation",
    url: "https://www.torontomu.ca/recreation/activities/Badminton/",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-16 text-[15px] leading-relaxed text-text-primary">
      <h1 className="text-xl sm:text-2xl font-semibold tracking-tight mb-6">
        About
      </h1>

      <p className="text-text-primary/90 mb-10">
        SportTo gathers drop-in schedules from municipal and university
        sources so you can see when and where to play without wading
        through a dozen separate pages. Schedules are hand-curated and
        can drift — confirm with the centre before you go.
      </p>

      <h2 className="text-[11px] font-medium uppercase tracking-wider text-text-secondary mb-3">
        Sources
      </h2>
      <ul className="space-y-1.5 text-sm mb-10">
        {sources.map((source) => (
          <li key={source.name}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-text-primary underline decoration-text-secondary/40 underline-offset-4 hover:decoration-text-primary/60"
            >
              {source.name}
              <ExternalLink size={12} className="opacity-60" />
            </a>
          </li>
        ))}
      </ul>

      <h2 className="text-[11px] font-medium uppercase tracking-wider text-text-secondary mb-3">
        Good to know
      </h2>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-text-primary">Reserve a spot</dt>
          <dd className="text-text-secondary mt-0.5">
            City centres use Reserve-a-Spot. New slots open Thursdays
            at 8 AM for the following week.
          </dd>
        </div>
        <div>
          <dt className="text-text-primary">Cost</dt>
          <dd className="text-text-secondary mt-0.5">
            City drop-ins run ~$4; some centres are free. University
            facilities require membership.
          </dd>
        </div>
      </dl>
    </div>
  );
}
