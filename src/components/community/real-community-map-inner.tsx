"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import { useLanguage } from "@/components/providers/language-provider";

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function createSacaIcon(number: number, isHighlighted = false): L.DivIcon {
  return L.divIcon({
    className: "saca-marker",
    html: `
      <div style="position: relative; width: 36px; height: 36px;">
        <div style="position: absolute; inset: 0; background: ${isHighlighted ? "#C5A065" : "#0F3D3E"}; border: 2.5px solid white; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 12px rgba(11,46,42,0.4);"></div>
        <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; font-family: sans-serif;">${number}</div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

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

function MapBounds({ markers }: { markers: OrgMarker[] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length === 0) return;
    const validMarkers = markers.filter((m) => m.latitude != null && m.longitude != null);
    if (validMarkers.length === 0) return;
    const bounds = L.latLngBounds(
      validMarkers.map((m) => [m.latitude as number, m.longitude as number] as [number, number])
    );
    map.fitBounds(bounds, { padding: [60, 60] });
  }, [markers, map]);
  return null;
}

const TYPE_LABEL: Record<string, { ar: string; en: string }> = {
  association: { ar: "رابطة", en: "Association" },
  center: { ar: "مركز", en: "Center" },
  mosque: { ar: "مسجد", en: "Mosque" },
  education: { ar: "تعليم", en: "Education" },
  professional: { ar: "مهنية", en: "Professional" },
  charity: { ar: "خيري", en: "Charity" },
};

export function RealCommunityMapInner({
  organizations,
  selectedId,
  onSelect,
}: {
  organizations: OrgMarker[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const { lang } = useLanguage();

  const validOrgs = useMemo(
    () => organizations.filter((o) => o.latitude != null && o.longitude != null),
    [organizations]
  );

  const center: [number, number] = [39.5, -98.35];

  if (validOrgs.length === 0) {
    return (
      <div className="rounded-2xl bg-card border border-border shadow-premium p-5">
        <p className="text-sm text-muted-foreground text-center">
          {lang === "ar"
            ? "لا توجد إحداثيات جغرافية متاحة."
            : "No geocoded organizations yet."}
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", minHeight: "400px" }}>
      <MapContainer
        center={center}
        zoom={4}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%", minHeight: "400px", borderRadius: "0.75rem" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds markers={validOrgs} />
        {validOrgs.map((o, i) => {
          const isSel = selectedId === o.id;
          const typeLabel = TYPE_LABEL[o.type] || { ar: o.type, en: o.type };
          return (
            <Marker
              key={o.id}
              position={[o.latitude as number, o.longitude as number]}
              icon={createSacaIcon(i + 1, isSel)}
              eventHandlers={{
                click: () => onSelect?.(o.id),
              }}
            >
              <Popup>
                <div style={{ minWidth: "200px", fontFamily: "sans-serif" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "10px", background: "#0F3D3E", color: "white", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                      {lang === "ar" ? typeLabel.ar : typeLabel.en}
                    </span>
                    {o.verification === "Verified" && (
                      <span style={{ fontSize: "10px", color: "#059669" }}>✓ Verified</span>
                    )}
                  </div>
                  <div style={{ fontWeight: "bold", fontSize: "13px", color: "#1A1A1A", marginBottom: "4px" }}>
                    {o.name}
                  </div>
                  {o.address && (
                    <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "2px" }}>
                      📍 {o.address}
                    </div>
                  )}
                  {o.phone && (
                    <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "2px" }}>
                      📞 <a href={`tel:${o.phone}`} style={{ color: "#0F3D3E" }}>{o.phone}</a>
                    </div>
                  )}
                  {o.website && (
                    <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "2px" }}>
                      🌐 <a href={o.website} target="_blank" rel="noopener noreferrer" style={{ color: "#0F3D3E" }}>
                        {o.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                  <a
                    href={`/organizations/${o.id}`}
                    style={{
                      display: "inline-block",
                      marginTop: "6px",
                      background: "#0F3D3E",
                      color: "white",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    {lang === "ar" ? "عرض التفاصيل ←" : "View details →"}
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
