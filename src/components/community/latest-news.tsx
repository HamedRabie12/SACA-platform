"use client";

import { Newspaper, ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";

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
  conference_news: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
  scholarship_news: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop",
  workshop_news: "https://images.unsplash.com/photo-1559223607-a43c990c6927?q=80&w=1200&auto=format&fit=crop",
  default: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1200&auto=format&fit=crop",
};

const CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
  Community: { ar: "مجتمع", en: "Community" },
  Education: { ar: "تعليم", en: "Education" },
  Business: { ar: "أعمال", en: "Business" },
  Health: { ar: "صحة", en: "Health" },
  Immigration: { ar: "هجرة", en: "Immigration" },
  Announcement: { ar: "إعلان", en: "Announcement" },
};

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
  } else {
    if (days > 0) return `${days}d ago`;
    return `${hours}h ago`;
  }
}

export function LatestNews({ news }: { news: NewsItem[] }) {
  const { t, lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  if (!news || news.length === 0) {
    return (
      <div className="rounded-2xl bg-card border border-border shadow-premium p-5 text-center">
        <p className="text-sm text-muted-foreground">
          {lang === "ar" ? "لا توجد أخبار." : "No news."}
        </p>
      </div>
    );
  }

  const [featured, ...rest] = news;

  const featuredImg = NEWS_IMAGES[featured.imageUrl || "default"] || NEWS_IMAGES.default;
  const featuredCat = CATEGORY_LABELS[featured.category] || { ar: featured.category, en: featured.category };

  return (
    <div className="rounded-2xl bg-card border border-border shadow-premium overflow-hidden">
      <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-emerald-700" />
          {t("news.title")}
        </h3>
        <a href="/news" className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-deep">
          {t("news.viewAll")}
        </a>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Featured news */}
        <a href={`/news/${featured.id}`} className="group block">
          <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3">
            <img
              src={featuredImg}
              alt={featured.title}
              className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute top-3 start-3">
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold ${
                  CATEGORY_COLORS[featured.category] || "bg-emerald-50 text-emerald-700"
                }`}
              >
                {lang === "ar" ? featuredCat.ar : featuredCat.en}
              </span>
            </div>
            <div className="absolute bottom-3 start-3 end-3">
              <h4 className="text-white font-bold text-sm md:text-base leading-tight mb-1 line-clamp-2 group-hover:text-gold transition-premium">
                {featured.title}
              </h4>
              <div className="flex items-center gap-2 text-[10px] text-white/80">
                <span>{featured.orgName}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  {timeAgo(featured.publishedAt, lang)}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {featured.summary}
          </p>
        </a>

        {/* Side news list */}
        <div className="flex flex-col gap-3">
          {rest.slice(0, 3).map((n) => {
            const img = NEWS_IMAGES[n.imageUrl || "default"] || NEWS_IMAGES.default;
            const cat = CATEGORY_LABELS[n.category] || { ar: n.category, en: n.category };
            return (
              <a
                key={n.id}
                href={`/news/${n.id}`}
                className="group flex gap-3 items-start rounded-xl p-2 hover:bg-secondary/40 transition-premium"
              >
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={img}
                    alt=""
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold mb-1 ${
                      CATEGORY_COLORS[n.category] || "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {lang === "ar" ? cat.ar : cat.en}
                  </span>
                  <h4 className="text-xs font-bold text-foreground leading-snug mb-1 line-clamp-2 group-hover:text-emerald-700 transition-premium">
                    {n.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {n.summary}
                  </p>
                  <span className="text-[10px] text-muted-foreground/70 inline-flex items-center gap-0.5 mt-1">
                    <Clock className="h-2.5 w-2.5" />
                    {timeAgo(n.publishedAt, lang)}
                  </span>
                </div>
              </a>
            );
          })}

          <Button
            variant="ghost"
            className="justify-start text-emerald-700 hover:text-emerald-deep hover:bg-emerald-50/50 mt-1"
            size="sm"
          >
            {t("news.readMore")}
            <Arrow className="h-3.5 w-3.5 ms-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
