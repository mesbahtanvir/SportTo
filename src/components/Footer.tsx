export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🏸</span>
              <span className="text-lg font-bold text-white">
                Sport<span className="text-accent">To</span>
              </span>
            </div>
            <p className="text-sm max-w-md">
              Find badminton drop-in sessions at community centres across
              downtown Toronto. Schedules are manually curated and may not
              reflect the latest changes.
            </p>
          </div>
          <div className="text-sm">
            <p className="text-slate-300 font-medium mb-1">Data Sources</p>
            <ul className="space-y-1">
              <li>
                <a
                  href="https://www.toronto.ca/explore-enjoy/parks-recreation/program-activities/sports/drop-in-sports-map/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  City of Toronto Drop-in Sports
                </a>
              </li>
              <li>
                <a
                  href="https://universitysettlement.ca/fitness-and-recreation/badminton/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  University Settlement
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-700 text-xs text-slate-500">
          Always verify schedules directly with the community centre before visiting.
        </div>
      </div>
    </footer>
  );
}
