export default function Footer() {
  return (
    <footer className="border-t border-border bg-background text-text-secondary py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
        <div className="max-w-md">
          <p className="text-sm font-medium text-text-primary mb-1.5 tracking-tight">
            SportTo
          </p>
          <p className="text-xs leading-relaxed">
            Drop-in sports across downtown Toronto. Schedules are manually
            curated and may not reflect the latest changes.
          </p>
        </div>
        <div className="text-xs">
          <p className="text-text-primary mb-1.5">Data sources</p>
          <ul className="space-y-1">
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
      <div className="max-w-7xl mx-auto px-4 mt-6 pt-4 border-t border-border-soft text-[11px]">
        Always verify schedules with the centre before visiting.
      </div>
    </footer>
  );
}
