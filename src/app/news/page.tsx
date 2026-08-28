"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { AIAssistantWidget } from "@/components/community/ai-assistant-widget";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper, Search, Clock, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { Input } from "@/components/ui/input";

type NewsItem = {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string | null;
  category: string;
  authorName: string | null;
  orgName: string | null;
  publishedAt: string;
  state?: { code: string; nameEn: string; nameAr: string } | null;
};

const NEWS_IMAGES: Record<string, string> = {
  conference_news: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop",
  scholarship_news: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
  workshop_news: "https://images.unsplash.com/photo-1559223607-a43c990c6927?q=80&w=800&auto=format&fit=crop",
  md_news: "https://images.unsplash.com/photo-1499488935264-8d2d6d92e26c?q=80&w=800&auto=format&fit=crop",
  default: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop",
};

const CATEGORY_FILTERS = [
  { value: "Community", ar: "مجتمع", en: "Community" },
  { value: "Education", ar: "تعليم", en: "Education" },
  { value: "Business", ar: "أعمال", en: "Business" },
  { value: "Health", ar: "صحة", en: "Health" },
  { value: "Immigration", ar: "هجرة", en: "Immigration" },
  { value: "Announcement", ar: "إعلان", en: "Announcement" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Community: "bg-emerald-50 text-emerald-700",
  Education: "bg-amber-50 text-amber-700",
  Business: "bg-teal-50 text-teal-700",
  Health: "bg-rose-50 text-rose-700",
  Immigration: "bg-purple-50 text-purple-700",
  Announcement: "bg-red-50 text-red-700",
};

function timeAgo(dateStr: string, lang: "ar" | "en") {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  if (lang === "ar") {
    if (days > 0) return `قبل ${days} يوم`;
    return `قبل ${hours} ساعة`;
  }
  if (days > 0) return `${days}d ago`;
  return `${hours}h ago`;
}

export default function NewsPage() {
  const { lang, t } = useLanguage();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [states, setStates] = useState<Array<{ code: string; nameEn: string; nameAr: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ state: "", category: "", q: "" });

  useEffect(() => {
    fetch("/api/community/states")
      .then((r) => r.json())
      .then((d) => setStates(d.states ?? []))
      .catch(() => {});
  }, []);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.state) params.set("state", filters.state);
    if (filters.category) params.set("category", filters.category);
    if (filters.q) params.set("q", filters.q);
    try {
      const res = await fetch(`/api/community/news?${params}`);
      const data = await res.json();
      setNews(data.items ?? []);
    } catch {
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(fetchNews, 200);
    return () => clearTimeout(t);
  }, [fetchNews]);

  const [featured, ...rest] = news;

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <PageHeader
        title={lang === "ar" ? "آخر الأخبار" : "Latest News"}
        subtitle={
          lang === "ar"
            ? "تابع آخر أخبار الجالية السودانية في الولايات المتحدة."
            : "Follow the latest Sudanese community news across the United States."
        }
        crumbs={[{ label: lang === "ar" ? "الأخبار" : "News" }]}
      />

      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8 py-6 flex-1">
        {/* Filters */}
        <div className="rounded-2xl bg-card border border-border shadow-premium p-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder={lang === "ar" ? "ابحث في الأخبار…" : "Search news…"}
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                className="ps-9 rounded-xl" />
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
              <button key={c.value}
                onClick={() => setFilters((f) => ({ ...f, category: c.value }))}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-premium ${
                  filters.category === c.value
                    ? "bg-emerald-700 text-white"
                    : "bg-secondary text-foreground hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                {lang === "ar" ? c.ar : c.en}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-2xl" />)}
          </div>
        ) : news.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <Newspaper className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {lang === "ar" ? "لا توجد أخبار مطابقة." : "No matching news."}
            </p>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-up">
            {/* Featured */}
            {featured && (
              <a href={`/news/${featured.id}`} className="group block rounded-2xl bg-card border border-border shadow-premium hover:shadow-premium-lg transition-premium overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden">
                    <img src={NEWS_IMAGES[featured.imageUrl || "default"] || NEWS_IMAGES.default}
                      alt={featured.title}
                      className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy" />
                    <div className="absolute top-3 start-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ${CATEGORY_COLORS[featured.category] || "bg-emerald-50 text-emerald-700"}`}>
                        {featured.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 md:p-6">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
                      <span className="font-semibold text-emerald-700">{featured.orgName}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {timeAgo(featured.publishedAt, lang)}
                      </span>
                    </div>
                    <h2 className="font-display text-xl md:text-2xl font-bold text-foreground leading-tight mb-2 line-clamp-2 group-hover:text-emerald-700 transition-premium">
                      {featured.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                      {featured.summary}
                    </p>
                    <span className="inline-flex items-center text-xs font-bold text-emerald-700">
                      {t("news.readMore")}
                      <ArrowLeft className="h-3.5 w-3.5 ms-1 rtl:rotate-180" />
                    </span>
                  </div>
                </div>
              </a>
            )}

            {/* Rest */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.map((n) => (
                <a key={n.id} href={`/news/${n.id}`}
                  className="group block rounded-2xl bg-card border border-border shadow-premium hover:shadow-premium-lg transition-premium overflow-hidden">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={NEWS_IMAGES[n.imageUrl || "default"] || NEWS_IMAGES.default}
                      alt={n.title}
                      className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy" />
                    <div className="absolute top-2 start-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold ${CATEGORY_COLORS[n.category] || "bg-emerald-50 text-emerald-700"}`}>
                        {n.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-foreground leading-snug mb-1.5 line-clamp-2 group-hover:text-emerald-700 transition-premium">{n.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">{n.summary}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="font-semibold text-emerald-700">{n.orgName}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {timeAgo(n.publishedAt, lang)}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
      <AIAssistantWidget />
    </main>
  );
}
