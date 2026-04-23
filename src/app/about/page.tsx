import { ExternalLink } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-16">
      <header className="mb-10">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
          About SportTo
        </h1>
        <p className="text-sm text-text-secondary mt-2 leading-relaxed">
          A quiet guide to drop-in sports at community centres across
          downtown Toronto.
        </p>
      </header>

      <div className="space-y-10 text-[15px] leading-relaxed text-text-primary">
        <section>
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-text-secondary mb-3">
            What this is
          </h2>
          <p className="text-text-primary/90">
            SportTo aggregates schedule information from multiple sources so
            you can see, at a glance, when and where to play — without wading
            through a dozen separate municipal and university pages.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-text-secondary mb-3">
            Data sources
          </h2>
          <ul className="space-y-1.5 text-sm">
            {[
              {
                name: "City of Toronto Drop-in Sports Map",
                url: "https://www.toronto.ca/explore-enjoy/parks-recreation/program-activities/sports/drop-in-sports-map/",
              },
              {
                name: "University Settlement Recreation Centre",
                url: "https://universitysettlement.ca/fitness-and-recreation/badminton/",
              },
              {
                name: "UofT Athletic Centre",
                url: "https://kpe.utoronto.ca/sport-recreationrecreational-fitness-drop-sportsdrop-sports-activities/drop-badminton",
              },
              {
                name: "Toronto Metropolitan University Recreation",
                url: "https://www.torontomu.ca/recreation/activities/Badminton/",
              },
            ].map((source) => (
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
        </section>

        <section className="border-l-2 border-border pl-4 text-sm text-text-secondary leading-relaxed">
          <p className="text-text-primary mb-1 text-[13px] font-medium">
            A small caveat
          </p>
          <p>
            Schedules are hand-curated and can drift. Programs get cancelled
            for holidays, events, or maintenance. Confirm with the centre
            before you go — call 311 for City of Toronto recreation
            information.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-text-secondary mb-3">
            Tips for drop-in badminton
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-text-primary">Reserve a spot</dt>
              <dd className="text-text-secondary mt-0.5">
                Many City of Toronto centres use the Reserve-a-Spot system.
                New slots open Thursdays at 8 AM for the following week.
              </dd>
            </div>
            <div>
              <dt className="text-text-primary">What to bring</dt>
              <dd className="text-text-secondary mt-0.5">
                Your own racket and shuttlecocks (some centres provide them),
                non-marking indoor shoes, water.
              </dd>
            </div>
            <div>
              <dt className="text-text-primary">Costs</dt>
              <dd className="text-text-secondary mt-0.5">
                City drop-ins typically run around $4. Some centres are free.
                University facilities require membership.
              </dd>
            </div>
            <div>
              <dt className="text-text-primary">Arrive early</dt>
              <dd className="text-text-secondary mt-0.5">
                Popular sessions fill fast. 10–15 minutes before start for
                walk-in sessions.
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
