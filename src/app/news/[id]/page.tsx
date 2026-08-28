"use client";

import { use, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { AIAssistantWidget } from "@/components/community/ai-assistant-widget";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, User, Building2, Share2, Bookmark, ArrowLeft, ArrowRight, Calendar } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type NewsDetail = {
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
  conference_news: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1600&auto=format&fit=crop",
  scholarship_news: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1600&auto=format&fit=crop",
  workshop_news: "https://images.unsplash.com/photo-1559223607-a43c990c6927?q=80&w=1600&auto=format&fit=crop",
  md_news: "https://images.unsplash.com/photo-1499488935264-8d2d6d92e26c?q=80&w=1600&auto=format&fit=crop",
  default: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1600&auto=format&fit=crop",
};

const CATEGORY_COLORS: Record<string, string> = {
  Community: "bg-emerald-50 text-emerald-700",
  Education: "bg-amber-50 text-amber-700",
  Business: "bg-teal-50 text-teal-700",
  Health: "bg-rose-50 text-rose-700",
  Immigration: "bg-purple-50 text-purple-700",
  Announcement: "bg-red-50 text-red-700",
};

export default function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowRight : ArrowLeft;
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [related, setRelated] = useState<NewsDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/community/news/${id}`);
        if (!res.ok) throw new Error("not found");
        const data = await res.json();
        setNews(data.news);
        setRelated(data.related ?? []);
      } catch {
        setNews(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-background">
        <TopNav />
        <Skeleton className="h-96 w-full" />
        <div className="mx-auto max-w-4xl px-6 py-6"><Skeleton className="h-96 w-full" /></div>
        <Footer />
      </main>
    );
  }

  if (!news) {
    return (
      <main className="min-h-screen flex flex-col bg-background">
        <TopNav />
        <PageHeader title={lang === "ar" ? "الخبر غير موجود" : "News not found"}
          crumbs={[{ label: lang === "ar" ? "الأخبار" : "News", href: "/news" }]} />
        <div className="mx-auto max-w-4xl px-6 py-12 text-center">
          <Button asChild><a href="/news"><Arrow className="h-4 w-4 me-1.5" />{lang === "ar" ? "العودة للأخبار" : "Back to news"}</a></Button>
        </div>
        <Footer />
      </main>
    );
  }

  const img = NEWS_IMAGES[news.imageUrl || "default"] || NEWS_IMAGES.default;
  const catColor = CATEGORY_COLORS[news.category] || "bg-emerald-50 text-emerald-700";
  const d = new Date(news.publishedAt);

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <PageHeader
        title={news.title}
        subtitle={news.summary}
        crumbs={[
          { label: lang === "ar" ? "الأخبار" : "News", href: "/news" },
          { label: news.category },
        ]}
      />

      <div className="mx-auto w-full max-w-4xl px-4 md:px-6 lg:px-8 py-6 flex-1">
        {/* Hero image */}
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-premium-lg mb-6">
          <img src={img} alt={news.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute top-4 start-4 flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ${catColor}`}>
              {news.category}
            </span>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 mb-6 text-xs text-muted-foreground">
          {news.orgName && (
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-emerald-700" />
              <span className="font-semibold text-emerald-700">{news.orgName}</span>
            </span>
          )}
          {news.authorName && (
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {news.authorName}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {d.toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {/* Body */}
        <article className="prose prose-sm max-w-none">
          <p className="text-base md:text-lg font-semibold text-foreground leading-relaxed mb-4 first-letter:text-3xl first-letter:font-bold first-letter:text-emerald-700 first-letter:me-1">
            {news.summary}
          </p>
          <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {news.content}
          </div>
        </article>

        {/* Share */}
        <div className="mt-6 pt-6 border-t border-border/60 flex items-center gap-2">
          <Button variant="outline" className="rounded-xl" size="sm">
            <Bookmark className="h-3.5 w-3.5 me-1.5" />
            {lang === "ar" ? "حفظ" : "Save"}
          </Button>
          <Button variant="outline" className="rounded-xl" size="sm">
            <Share2 className="h-3.5 w-3.5 me-1.5" />
            {lang === "ar" ? "مشاركة" : "Share"}
          </Button>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-8">
            <h3 className="text-base font-bold text-foreground mb-4">
              {lang === "ar" ? "أخبار ذات صلة" : "Related news"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {related.map((r) => {
                const rImg = NEWS_IMAGES[r.imageUrl || "default"] || NEWS_IMAGES.default;
                return (
                  <a key={r.id} href={`/news/${r.id}`}
                    className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-premium transition-premium">
                    <div className="aspect-[16/10] overflow-hidden">
                      <img src={rImg} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                    <div className="p-3">
                      <h4 className="text-xs font-bold text-foreground line-clamp-2 group-hover:text-emerald-700 transition-premium mb-1">{r.title}</h4>
                      <span className="text-[10px] text-muted-foreground inline-flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {new Date(r.publishedAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <Footer />
      <AIAssistantWidget />
    </main>
  );
}
