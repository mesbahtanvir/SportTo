import { ExternalLink } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">About SportTo</h1>

      <div className="prose prose-slate max-w-none space-y-6">
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-xl font-semibold mb-3">What is SportTo?</h2>
          <p className="text-text-secondary leading-relaxed">
            SportTo is a community-built guide to finding badminton drop-in
            sessions at community centres across downtown Toronto. We aggregate
            schedule information from multiple sources to make it easy to find a
            court near you.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-xl font-semibold mb-3">Data Sources</h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            Schedule data is manually curated from the following sources:
          </p>
          <ul className="space-y-2">
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
                  className="inline-flex items-center gap-1.5 text-primary hover:text-primary-dark font-medium text-sm"
                >
                  {source.name}
                  <ExternalLink size={14} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-3 text-amber-800">
            Important Disclaimer
          </h2>
          <p className="text-amber-700 leading-relaxed">
            Schedules are manually curated and may not reflect the latest
            changes. Programs may be cancelled due to holidays, special events,
            or maintenance. Always verify schedules directly with the community
            centre before visiting. Call 311 for City of Toronto recreation
            information.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-xl font-semibold mb-3">Tips for Drop-in Badminton</h2>
          <ul className="text-text-secondary space-y-2 text-sm leading-relaxed">
            <li>
              <strong>Reserve a Spot:</strong> Many City of Toronto centres use
              the &quot;Reserve a Spot&quot; system. New spots are released
              Thursdays at 8 AM for the following week (Monday to Sunday).
            </li>
            <li>
              <strong>What to bring:</strong> Bring your own racket and
              shuttlecocks (some centres provide them), non-marking indoor shoes
              (required), and a water bottle.
            </li>
            <li>
              <strong>Costs:</strong> City of Toronto drop-in sessions typically
              cost $4/session. Some centres and programs are free. University
              facilities require membership.
            </li>
            <li>
              <strong>Arrive early:</strong> Popular sessions fill up fast.
              Arrive 10-15 minutes early for walk-in sessions.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
