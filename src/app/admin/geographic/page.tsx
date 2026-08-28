"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { AdminGuard } from "@/components/layout/admin-guard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Map, ShieldCheck, Users, Building2, Calendar, Newspaper,
  TrendingUp, Award, Activity,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type StateRow = {
  code: string;
  nameEn: string;
  nameAr: string;
  metrics: {
    organizations: number;
    verifiedOrgs: number;
    pendingOrgs: number;
    members: number;
    activeMembers: number;
    events: number;
    news: number;
  };
  score: number;
};

type GeoData = {
  byState: StateRow[];
  ranking: StateRow[];
  totals: {
    states: number;
    organizations: number;
    members: number;
    events: number;
    news: number;
    activeStates: number;
  };
  generatedAt: string;
};

// Project lat/lng to x/y in viewBox approximating the US shape.
function project(lat: number, lng: number) {
  const x = ((lng - -125) / (-66 - -125)) * 1000;
  const y = (1 - (lat - 24) / (50 - 24)) * 600;
  return { x, y };
}

// Approximate state center coordinates for the heatmap
const STATE_COORDS: Record<string, { lat: number; lng: number }> = {
  AL: { lat: 32.8, lng: -86.8 }, AK: { lat: 64.2, lng: -149.5 }, AZ: { lat: 34.3, lng: -111.6 },
  AR: { lat: 34.9, lng: -92.4 }, CA: { lat: 36.7, lng: -119.4 }, CO: { lat: 39.0, lng: -105.5 },
  CT: { lat: 41.5, lng: -72.7 }, DE: { lat: 39.0, lng: -75.5 }, DC: { lat: 38.9, lng: -77.0 },
  FL: { lat: 27.7, lng: -81.5 }, GA: { lat: 33.0, lng: -83.0 }, HI: { lat: 20.4, lng: -157.5 },
  ID: { lat: 44.4, lng: -114.6 }, IL: { lat: 40.0, lng: -89.0 }, IN: { lat: 40.3, lng: -86.3 },
  IA: { lat: 42.0, lng: -93.6 }, KS: { lat: 38.5, lng: -98.0 }, KY: { lat: 37.5, lng: -85.3 },
  LA: { lat: 30.9, lng: -91.9 }, ME: { lat: 45.4, lng: -69.2 }, MD: { lat: 39.1, lng: -76.8 },
  MA: { lat: 42.2, lng: -71.5 }, MI: { lat: 43.7, lng: -84.5 }, MN: { lat: 46.0, lng: -94.2 },
  MS: { lat: 32.8, lng: -89.7 }, MO: { lat: 38.3, lng: -92.4 }, MT: { lat: 47.0, lng: -109.6 },
  NE: { lat: 41.5, lng: -99.8 }, NV: { lat: 39.5, lng: -117.0 }, NH: { lat: 43.5, lng: -71.6 },
  NJ: { lat: 40.0, lng: -74.5 }, NM: { lat: 34.5, lng: -106.0 }, NY: { lat: 43.0, lng: -75.5 },
  NC: { lat: 35.6, lng: -79.0 }, ND: { lat: 47.5, lng: -100.5 }, OH: { lat: 40.2, lng: -82.8 },
  OK: { lat: 35.5, lng: -97.5 }, OR: { lat: 44.0, lng: -120.5 }, PA: { lat: 41.0, lng: -77.5 },
  RI: { lat: 41.7, lng: -71.5 }, SC: { lat: 34.0, lng: -81.0 }, SD: { lat: 44.5, lng: -100.0 },
  TN: { lat: 35.8, lng: -86.0 }, TX: { lat: 31.0, lng: -99.9 }, UT: { lat: 39.5, lng: -111.5 },
  VT: { lat: 44.0, lng: -72.7 }, VA: { lat: 37.5, lng: -78.5 }, WA: { lat: 47.4, lng: -120.6 },
  WV: { lat: 38.5, lng: -80.5 }, WI: { lat: 44.0, lng: -89.5 }, WY: { lat: 43.0, lng: -107.5 },
};

export default function GeographicIntelligencePage() {
  const { lang } = useLanguage();
  // Auth handled by AdminGuard
  const [data, setData] = useState<GeoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/stats/geographic", {
          })
      .then((r) => r.json())
      .then((d) => { if (alive) setData(d); })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  

  const maxScore = data ? Math.max(...data.byState.map((s) => s.score), 1) : 1;

  return (
    <AdminGuard>
    <div className="flex-1">
      
      <PageHeader
        title={lang === "ar" ? "الذكاء الجغرافي المجتمعي" : "Geographic Community Intelligence"}
        subtitle={lang === "ar" ? "توزيع الأعضاء والمنظمات والفعاليات حسب الولاية مع خريطة حرارية وتصنيف." : "Distribution of members, organizations, and events by state with heatmap and ranking."}
        crumbs={[
          { label: lang === "ar" ? "الإدارة" : "Admin", href: "/admin" },
          { label: lang === "ar" ? "الجغرافيا" : "Geographic" },
        ]}
      />

      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8 py-6 flex-1">
        {/* Totals */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-5">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : data && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-5">
            {[
              { icon: Map, label: lang === "ar" ? "ولايات" : "States", value: data.totals.states, color: "text-emerald-700" },
              { icon: Activity, label: lang === "ar" ? "ولايات نشطة" : "Active states", value: data.totals.activeStates, color: "text-emerald-700" },
              { icon: Building2, label: lang === "ar" ? "منظمات" : "Organizations", value: data.totals.organizations, color: "text-gold" },
              { icon: Users, label: lang === "ar" ? "أعضاء" : "Members", value: data.totals.members, color: "text-teal-700" },
              { icon: Calendar, label: lang === "ar" ? "فعاليات" : "Events", value: data.totals.events, color: "text-rose-700" },
              { icon: Newspaper, label: lang === "ar" ? "أخبار" : "News", value: data.totals.news, color: "text-purple-700" },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="rounded-2xl bg-card border border-border shadow-premium p-4">
                  <Icon className={`h-5 w-5 mb-2 ${s.color}`} />
                  <div className="text-2xl font-bold text-foreground tabular-nums">{s.value}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* USA Heatmap */}
          <div className="lg:col-span-2 rounded-2xl bg-card border border-border shadow-premium p-5">
            <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <Map className="h-4 w-4 text-emerald-700" />
              {lang === "ar" ? "خريطة التوزيع الحرارية" : "Distribution heatmap"}
            </h3>
            <div className="relative aspect-[5/3] bg-gradient-to-br from-emerald-50/60 to-beige rounded-xl overflow-hidden">
              <svg viewBox="0 0 1000 600" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
                {/* US shape */}
                <path
                  d="M 80 200 Q 60 150 100 120 Q 150 80 220 100 Q 280 90 340 110 Q 420 95 500 105 Q 580 95 650 110 Q 730 100 800 120 Q 870 130 920 180 Q 950 220 920 280 Q 940 340 910 400 Q 880 460 820 480 Q 740 500 660 490 Q 580 510 500 500 Q 420 510 340 495 Q 260 510 200 480 Q 140 460 100 400 Q 70 340 90 280 Q 75 240 80 200 Z"
                  fill="#F3EEE3"
                  stroke="#0F3D3E"
                  strokeWidth="2.5"
                  strokeOpacity="0.18"
                />

                {/* Heatmap circles for active states */}
                {data?.byState.filter((s) => s.score > 0 && STATE_COORDS[s.code]).map((s) => {
                  const { lat, lng } = STATE_COORDS[s.code];
                  const { x, y } = project(lat, lng);
                  const intensity = s.score / maxScore; // 0-1
                  const radius = 8 + intensity * 22;
                  const color = intensity > 0.7 ? "#B85450" : intensity > 0.4 ? "#C5A065" : "#1B5E50";
                  return (
                    <g key={s.code} transform={`translate(${x},${y})`}>
                      <circle r={radius + 8} fill={color} fillOpacity={0.1 * intensity} />
                      <circle r={radius} fill={color} fillOpacity={0.3 + 0.4 * intensity} stroke="white" strokeWidth="1.5" />
                      <text y="3" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">
                        {s.code}
                      </text>
                    </g>
                  );
                })}

                {/* Legend */}
                <g transform="translate(20, 540)">
                  <text x="0" y="0" fontSize="11" fill="#1A1A1A" fontWeight="600">
                    {lang === "ar" ? "كثافة النشاط" : "Activity intensity"}
                  </text>
                  <circle cx="100" cy="-3" r="8" fill="#1B5E50" fillOpacity="0.4" />
                  <text x="115" y="0" fontSize="10" fill="#4A5568">{lang === "ar" ? "منخفض" : "Low"}</text>
                  <circle cx="180" cy="-3" r="8" fill="#C5A065" fillOpacity="0.5" />
                  <text x="195" y="0" fontSize="10" fill="#4A5568">{lang === "ar" ? "متوسط" : "Medium"}</text>
                  <circle cx="270" cy="-3" r="8" fill="#B85450" fillOpacity="0.6" />
                  <text x="285" y="0" fontSize="10" fill="#4A5568">{lang === "ar" ? "عالي" : "High"}</text>
                </g>
              </svg>
            </div>
            {/* Privacy note */}
            <div className="mt-3 rounded-lg bg-secondary/40 border border-border/60 px-3 py-2 text-[10px] text-muted-foreground">
              {lang === "ar"
                ? "🔒 البيانات مجمّعة (Aggregated) — لا تُكشف هوية أي عضو بعينه. الحد الأدنى للعرض 3 أعضاء."
                : "🔒 Data is aggregated — no individual member is identifiable. Minimum display threshold: 3 members."}
            </div>
          </div>

          {/* Top 10 Ranking */}
          <div className="rounded-2xl bg-card border border-border shadow-premium p-5">
            <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <Award className="h-4 w-4 text-gold" />
              {lang === "ar" ? "أعلى 10 ولايات" : "Top 10 states"}
            </h3>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {data?.ranking.map((s, i) => (
                  <div key={s.code} className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-secondary/30 transition-premium">
                    <span className={`inline-flex items-center justify-center h-6 w-6 rounded-md text-[10px] font-bold flex-shrink-0 ${
                      i === 0 ? "bg-gold text-emerald-deep" : i < 3 ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-muted-foreground"
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-foreground truncate">
                        {lang === "ar" ? s.nameAr : s.nameEn} ({s.code})
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {s.metrics.organizations} {lang === "ar" ? "منظمة" : "orgs"} · {s.metrics.members} {lang === "ar" ? "عضو" : "members"}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 tabular-nums">
                      {s.score.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Full table */}
        <div className="rounded-2xl bg-card border border-border shadow-premium overflow-hidden mt-5">
          <div className="px-4 py-3 border-b border-border/60">
            <h3 className="text-sm font-bold text-foreground">{lang === "ar" ? "تفاصيل الولايات" : "State details"}</h3>
          </div>
          {loading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-secondary/40">
                  <tr>
                    <th className="px-3 py-2 text-start font-semibold text-muted-foreground">{lang === "ar" ? "الولاية" : "State"}</th>
                    <th className="px-3 py-2 text-end font-semibold text-muted-foreground">{lang === "ar" ? "منظمات" : "Orgs"}</th>
                    <th className="px-3 py-2 text-end font-semibold text-muted-foreground">{lang === "ar" ? "موثقة" : "Verified"}</th>
                    <th className="px-3 py-2 text-end font-semibold text-muted-foreground">{lang === "ar" ? "أعضاء" : "Members"}</th>
                    <th className="px-3 py-2 text-end font-semibold text-muted-foreground">{lang === "ar" ? "فعاليات" : "Events"}</th>
                    <th className="px-3 py-2 text-end font-semibold text-muted-foreground">{lang === "ar" ? "أخبار" : "News"}</th>
                    <th className="px-3 py-2 text-end font-semibold text-muted-foreground">{lang === "ar" ? "النتيجة" : "Score"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {data?.byState.filter((s) => s.metrics.organizations > 0 || s.metrics.members > 0).map((s) => (
                    <tr key={s.code} className="hover:bg-secondary/20">
                      <td className="px-3 py-2">
                        <div className="font-semibold text-foreground">{lang === "ar" ? s.nameAr : s.nameEn}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{s.code}</div>
                      </td>
                      <td className="px-3 py-2 text-end tabular-nums">{s.metrics.organizations}</td>
                      <td className="px-3 py-2 text-end tabular-nums text-emerald-700">{s.metrics.verifiedOrgs}</td>
                      <td className="px-3 py-2 text-end tabular-nums">{s.metrics.members}</td>
                      <td className="px-3 py-2 text-end tabular-nums">{s.metrics.events}</td>
                      <td className="px-3 py-2 text-end tabular-nums">{s.metrics.news}</td>
                      <td className="px-3 py-2 text-end tabular-nums font-bold text-emerald-700">{s.score.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      
    </div>
    </AdminGuard>
  );
}
