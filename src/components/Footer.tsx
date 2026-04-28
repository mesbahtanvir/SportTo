export default function Footer() {
  return (
    <footer className="border-t border-border bg-background text-text-secondary py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 grid gap-8 md:grid-cols-[1fr_auto] md:items-start">
        <div className="max-w-md">
          <p className="text-sm font-medium text-text-primary mb-2 tracking-tight">
            SportTo
          </p>
          <p className="text-xs leading-relaxed text-text-secondary">
            Drop-in sports across downtown Toronto. Schedules are
            hand-curated and may drift — verify with the centre before
            you go.
          </p>
        </div>
        <div className="text-xs">
          <p className="text-text-primary mb-2 font-medium">Sources</p>
          <ul className="space-y-1.5">
            <li>
              <a
                href="https://www.toronto.ca/explore-enjoy/parks-recreation/program-activities/sports/drop-in-sports-map/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text-primary transition-colors"
              >
                City of Toronto Drop-in Sports
              </a>
            </li>
            <li>
              <a
                href="https://universitysettlement.ca/fitness-and-recreation/badminton/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text-primary transition-colors"
              >
                University Settlement
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
