"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { AIAssistantWidget } from "@/components/community/ai-assistant-widget";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Video, Users, Search } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { Input } from "@/components/ui/input";

type EventItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string | null;
  eventDate: string;
  location: string | null;
  isOnline: boolean;
  capacity: number;
  registeredCount: number;
  organizerName: string | null;
  state?: { code: string; nameEn: string; nameAr: string } | null;
};

const CATEGORY_FILTERS = [
  { value: "conference", ar: "مؤتمرات", en: "Conferences", icon: "🎙️" },
  { value: "educational", ar: "تعليمية", en: "Educational", icon: "📚" },
  { value: "cultural", ar: "ثقافية", en: "Cultural", icon: "🎭" },
  { value: "business", ar: "أعمال", en: "Business", icon: "💼" },
  { value: "families", ar: "عائلية", en: "Families", icon: "👨‍👩‍👧" },
  { value: "social", ar: "اجتماعية", en: "Social", icon: "🤝" },
];

const CATEGORY_COLORS: Record<string, string> = {
  conference: "from-emerald-700 to-emerald-deep",
  educational: "from-amber-700 to-amber-900",
  cultural: "from-rose-700 to-rose-900",
  business: "from-teal-700 to-emerald-deep",
  families: "from-purple-700 to-purple-900",
  social: "from-blue-700 to-blue-900",
};

const EVENT_THUMBS: Record<string, string> = {
  conference: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=600&auto=format&fit=crop",
  seminar: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=600&auto=format&fit=crop",
  cultural: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=600&auto=format&fit=crop",
  business: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=600&auto=format&fit=crop",
  family: "https://images.unsplash.com/photo-1609220136736-443140cffec6?q=80&w=600&auto=format&fit=crop",
};

export default function EventsPage() {
  const { lang, t } = useLanguage();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [states, setStates] = useState<Array<{ code: string; nameEn: string; nameAr: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ state: "", category: "", q: "" });

  useEffect(() => {
    fetch("/api/community/states")
      .then((r) => r.json())
      .then((d) => setStates(d.states ?? []))
      .catch(() => {});
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.state) params.set("state", filters.state);
    if (filters.category) params.set("category", filters.category);
    if (filters.q) params.set("q", filters.q);
    try {
      const res = await fetch(`/api/community/events?${params}`);
      const data = await res.json();
      setEvents(data.items ?? []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(fetchEvents, 200);
    return () => clearTimeout(t);
  }, [fetchEvents]);

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <PageHeader
        title={lang === "ar" ? "الفعاليات القادمة" : "Upcoming Events"}
        subtitle={
          lang === "ar"
            ? "استعرض الفعاليات والمؤتمرات والندوات السودانية في الولايات المتحدة."
            : "Browse Sudanese events, conferences, and seminars across the United States."
        }
        crumbs={[{ label: lang === "ar" ? "الفعاليات" : "Events" }]}
      />

      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8 py-6 flex-1">
        {/* Filters */}
        <div className="rounded-2xl bg-card border border-border shadow-premium p-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={lang === "ar" ? "ابحث عن فعالية…" : "Search events…"}
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                className="ps-9 rounded-xl"
              />
            </div>
            <select
              value={filters.state}
              onChange={(e) => setFilters((f) => ({ ...f, state: e.target.value }))}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm font-medium"
            >
              <option value="">{t("common.allStates")}</option>
              {states.map((s) => (
                <option key={s.code} value={s.code}>
                  {lang === "ar" ? s.nameAr : s.nameEn} ({s.code})
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilters((f) => ({ ...f, category: "" }))}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-premium ${
                filters.category === ""
                  ? "bg-emerald-700 text-white"
                  : "bg-secondary text-foreground hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              {t("common.allCategories")}
            </button>
            {CATEGORY_FILTERS.map((c) => (
              <button
                key={c.value}
                onClick={() => setFilters((f) => ({ ...f, category: c.value }))}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-premium ${
                  filters.category === c.value
                    ? "bg-emerald-700 text-white"
                    : "bg-secondary text-foreground hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                <span>{c.icon}</span>
                {lang === "ar" ? c.ar : c.en}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-2xl" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {lang === "ar" ? "لا توجد فعاليات مطابقة." : "No matching events."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up">
            {events.map((e) => {
              const d = new Date(e.eventDate);
              const dateStr = d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { day: "numeric", month: "long", year: "numeric" });
              const timeStr = d.toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit" });
              const catColor = CATEGORY_COLORS[e.category] || "from-emerald-700 to-emerald-deep";
              const thumb = EVENT_THUMBS[e.imageUrl || e.category] || EVENT_THUMBS.conference;
              const fillPct = e.capacity > 0 ? Math.min(100, (e.registeredCount / e.capacity) * 100) : 0;

              return (
                <a
                  key={e.id}
                  href={`/events/${e.id}`}
                  className="group block rounded-2xl bg-card border border-border shadow-premium hover:shadow-premium-lg hover:border-emerald-700/30 transition-premium overflow-hidden"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${catColor}`} />
                    <img
                      src={thumb}
                      alt={e.title}
                      className="absolute inset-0 h-full w-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute top-3 start-3 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2 py-1 text-[10px] font-bold text-emerald-700">
                      <Calendar className="h-2.5 w-2.5" />
                      {dateStr}
                    </div>
                    <div className="absolute bottom-3 start-3 end-3">
                      <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 group-hover:text-gold transition-premium">
                        {e.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                      {e.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-3 text-[11px]">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3 text-emerald-700" />
                        {timeStr}
                      </span>
                      {e.isOnline ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <Video className="h-3 w-3" />
                          {lang === "ar" ? "أونلاين" : "Online"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3 text-emerald-700" />
                          {e.location || e.state?.[lang === "ar" ? "nameAr" : "nameEn"]}
                        </span>
                      )}
                    </div>
                    {e.capacity > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full" style={{ width: `${fillPct}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground tabular-nums">{e.registeredCount}/{e.capacity}</span>
                      </div>
                    )}
                    <div className="text-[10px] text-muted-foreground truncate">
                      {lang === "ar" ? "المنظم:" : "Organizer:"} {e.organizerName}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
      <AIAssistantWidget />
    </main>
  );
}
