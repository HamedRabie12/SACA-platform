"use client";

import { use, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { AIAssistantWidget } from "@/components/community/ai-assistant-widget";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, Newspaper, Users, MapPin, ArrowLeft, ArrowRight, Star } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { OrganizationCard, type OrgCardData } from "@/components/community/organization-card";

type StateData = {
  state: {
    code: string;
    nameEn: string;
    nameAr: string;
    fipsCode: string | null;
    cities: Array<{ nameEn: string; nameAr: string; latitude: number | null; longitude: number | null }>;
  };
  stats: {
    organizations: number;
    events: number;
    news: number;
    meetings: number;
    members: number;
  };
  organizations: OrgCardData[];
  events: Array<{ id: string; title: string; eventDate: string; location: string | null; description: string }>;
  news: Array<{ id: string; title: string; publishedAt: string; summary: string }>;
};

export default function StateLandingPage({ params }: { params: Promise<{ state: string }> }) {
  const { state: stateCode } = use(params);
  const upperCode = stateCode.toUpperCase();
  const { lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  const [data, setData] = useState<StateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/community/states/${upperCode}`);
        if (!res.ok) throw new Error("not found");
        const json = await res.json();
        setData(json);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [upperCode]);

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-background">
        <TopNav />
        <Skeleton className="h-40 w-full" />
        <div className="mx-auto max-w-[1400px] px-6 py-6">
          <Skeleton className="h-64 w-full" />
        </div>
        <Footer />
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen flex flex-col bg-background">
        <TopNav />
        <PageHeader title={lang === "ar" ? "الولاية غير موجودة" : "State not found"}
          crumbs={[{ label: upperCode }]} />
        <div className="mx-auto max-w-4xl px-6 py-12 text-center">
          <Button asChild><a href="/"><Arrow className="h-4 w-4 me-1.5" />{lang === "ar" ? "العودة للرئيسية" : "Back to home"}</a></Button>
        </div>
        <Footer />
      </main>
    );
  }

  const stateName = lang === "ar" ? data.state.nameAr : data.state.nameEn;

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <PageHeader
        title={`${lang === "ar" ? "المجتمع في" : "Community in"} ${stateName}`}
        subtitle={
          lang === "ar"
            ? `استعرض المنظمات والفعاليات والأخبار للجالية السودانية في ${stateName}.`
            : `Browse organizations, events, and news for the Sudanese community in ${stateName}.`
        }
        crumbs={[{ label: stateName }]}
      />

      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8 py-6 flex-1">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { icon: Building2, label: lang === "ar" ? "منظمات" : "Organizations", value: data.stats.organizations, color: "text-emerald-700" },
            { icon: Calendar, label: lang === "ar" ? "فعاليات" : "Events", value: data.stats.events, color: "text-gold" },
            { icon: Newspaper, label: lang === "ar" ? "أخبار" : "News", value: data.stats.news, color: "text-teal-700" },
            { icon: Users, label: lang === "ar" ? "أعضاء" : "Members", value: data.stats.members, color: "text-purple-700" },
            { icon: MapPin, label: lang === "ar" ? "مدن" : "Cities", value: data.state.cities.length, color: "text-rose-700" },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl bg-card border border-border shadow-premium p-4">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{s.label}</span>
              </div>
              <div className="text-2xl font-bold text-foreground tabular-nums">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Cities quick filter */}
        {data.state.cities.length > 0 && (
          <div className="rounded-2xl bg-card border border-border shadow-premium p-4 mb-6">
            <h3 className="text-sm font-bold text-foreground mb-3">
              {lang === "ar" ? "المدن في الولاية" : "Cities in state"}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {data.state.cities.map((c) => (
                <span key={c.nameEn} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer transition-premium">
                  <MapPin className="h-3 w-3" />
                  {lang === "ar" ? c.nameAr : c.nameEn}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Organizations */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-700" />
              {lang === "ar" ? "المنظمات" : "Organizations"}
              <span className="text-sm text-muted-foreground">({data.stats.organizations})</span>
            </h2>
            <a href={`/organizations?state=${upperCode}`} className="text-xs font-bold text-emerald-700 hover:text-emerald-deep">
              {lang === "ar" ? "عرض الكل" : "View all"}
              <Arrow className="h-3 w-3 inline ms-1 rtl:rotate-180" />
            </a>
          </div>
          {data.organizations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              {lang === "ar" ? "لا توجد منظمات مسجلة في هذه الولاية بعد." : "No organizations registered in this state yet."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.organizations.map((o) => <OrganizationCard key={o.id} org={o} />)}
            </div>
          )}
        </section>

        {/* Events + News split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Events */}
          <section>
            <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-700" />
              {lang === "ar" ? "الفعاليات القادمة" : "Upcoming events"}
            </h2>
            <div className="space-y-2">
              {data.events.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  {lang === "ar" ? "لا توجد فعاليات قادمة." : "No upcoming events."}
                </div>
              ) : (
                data.events.map((e) => (
                  <a key={e.id} href={`/events/${e.id}`} className="block rounded-xl border border-border bg-card p-3 hover:shadow-premium transition-premium">
                    <div className="text-sm font-semibold text-foreground line-clamp-1 mb-0.5">{e.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="inline-flex items-center gap-0.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(e.eventDate).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { day: "numeric", month: "short" })}
                      </span>
                      {e.location && (
                        <span className="inline-flex items-center gap-0.5">
                          <MapPin className="h-3 w-3" />
                          {e.location}
                        </span>
                      )}
                    </div>
                  </a>
                ))
              )}
            </div>
          </section>

          {/* News */}
          <section>
            <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-emerald-700" />
              {lang === "ar" ? "آخر الأخبار" : "Latest news"}
            </h2>
            <div className="space-y-2">
              {data.news.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  {lang === "ar" ? "لا توجد أخبار." : "No news yet."}
                </div>
              ) : (
                data.news.map((n) => (
                  <a key={n.id} href={`/news/${n.id}`} className="block rounded-xl border border-border bg-card p-3 hover:shadow-premium transition-premium">
                    <div className="text-sm font-semibold text-foreground line-clamp-1 mb-0.5">{n.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{n.summary}</div>
                  </a>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      <Footer />
      <AIAssistantWidget />
    </main>
  );
}
