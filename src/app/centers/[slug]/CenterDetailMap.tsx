"use client";

import { CommunityCenter } from "@/lib/types";
import MapView from "@/components/MapView";

export default function CenterDetailMap({
  center,
  allCenters,
}: {
  center: CommunityCenter;
  allCenters: CommunityCenter[];
}) {
  return (
    <MapView
      centers={allCenters}
      className="h-[220px] sm:h-[260px]"
      selectedSlug={center.slug}
    />
  );
}
