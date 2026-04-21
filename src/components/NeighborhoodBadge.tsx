export default function NeighborhoodBadge({
  neighborhood,
}: {
  neighborhood: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
      <span className="w-1 h-1 rounded-full bg-text-secondary/50" />
      {neighborhood}
    </span>
  );
}
