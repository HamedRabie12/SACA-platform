"use client";

import { useState } from "react";
import { MapPin, Star, ExternalLink, Navigation, Building2, Phone, Globe, Clock } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import { RealCommunityMap } from "@/components/community/real-community-map";

type OrgItem = {
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

export function CommunityMap({ organizations }: { organizations: OrgItem[] }) {
  const { t, lang } = useLanguage();
  const [selected, setSelected] = useState<OrgItem | null>(organizations[0] ?? null);

  const geoOrgs = organizations.filter(
    (o) => o.latitude != null && o.longitude != null
  );

  return (
    <div className="rounded-2xl bg-card border border-border shadow-premium overflow-hidden">
      <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-700" />
            {t("map.title")}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{t("map.subtitle")}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1">
          {geoOrgs.length} {lang === "ar" ? "مركز" : "centers"}
        </span>
      </div>

      {/* Real Leaflet map */}
      <div className="relative aspect-[16/10] bg-secondary/30 overflow-hidden">
        <RealCommunityMap
          organizations={organizations}
          selectedId={selected?.id}
          onSelect={(id) => {
            const o = organizations.find((x) => x.id === id);
            if (o) setSelected(o);
          }}
        />
      </div>

      {/* Selected org card */}
      {selected && (
        <div className="p-4 border-t border-border/60">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-deep flex items-center justify-center shadow-premium">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-foreground line-clamp-1">{selected.name}</h4>
                {selected.verification === "Verified" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5">
                    <Star className="h-2.5 w-2.5 fill-emerald-700" />
                    {t("common.verified")}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {selected.state?.[lang === "ar" ? "nameAr" : "nameEn"]}
                {selected.city ? ` · ${selected.city[lang === "ar" ? "nameAr" : "nameEn"]}` : ""}
                {selected.address ? ` · ${selected.address}` : ""}
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
            {selected.description}
          </p>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {selected.phone && (
              <a href={`tel:${selected.phone}`} className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-emerald-700">
                <Phone className="h-3 w-3 text-emerald-700" />
                <span className="truncate">{selected.phone}</span>
              </a>
            )}
            {selected.hoursAr && (
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3 text-emerald-700" />
                <span className="truncate">{selected.hoursAr}</span>
              </div>
            )}
            {selected.website && (
              <a href={selected.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-emerald-700">
                <Globe className="h-3 w-3 text-emerald-700" />
                <span className="truncate">{selected.website.replace(/^https?:\/\//, "")}</span>
              </a>
            )}
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Navigation className="h-3 w-3 text-emerald-700" />
              <span>
                {selected.latitude?.toFixed(4)}, {selected.longitude?.toFixed(4)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild className="flex-1 bg-emerald-700 hover:bg-emerald-deep text-white font-semibold rounded-xl h-9" size="sm">
              <a href={`/organizations/${selected.id}`}>
                <MapPin className="h-3.5 w-3.5 me-1.5" />
                {t("map.viewLocation")}
              </a>
            </Button>
            {selected.latitude && selected.longitude && (
              <Button asChild variant="outline" className="rounded-xl h-9" size="sm">
                <a href={`https://www.openstreetmap.org/?mlat=${selected.latitude}&mlon=${selected.longitude}#map=15/${selected.latitude}/${selected.longitude}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
