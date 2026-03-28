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
    <MapView centers={allCenters} height="250px" selectedSlug={center.slug} />
  );
}
