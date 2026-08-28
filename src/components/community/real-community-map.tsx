"use client";

import dynamic from "next/dynamic";

// Leaflet accesses `window` at module load time, which breaks SSR.
// Load the map component dynamically on the client only.
const RealCommunityMapInner = dynamic(
  () => import("./real-community-map-inner").then((m) => m.RealCommunityMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-secondary/30 rounded-xl">
        <div className="text-center">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-emerald-700/30 border-t-emerald-700 animate-spin" />
          <p className="text-[10px] text-muted-foreground mt-2">جارٍ تحميل الخريطة…</p>
        </div>
      </div>
    ),
  }
);

type OrgMarker = {
  id: string;
  name: string;
  type: string;
  description: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  hoursAr: string | null;
  services: string | null;
  verification: string;
  rating: number;
  state: { code: string; nameEn: string; nameAr: string } | null;
  city: { nameEn: string; nameAr: string } | null;
};

export function RealCommunityMap(props: {
  organizations: OrgMarker[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  return <RealCommunityMapInner {...props} />;
}
