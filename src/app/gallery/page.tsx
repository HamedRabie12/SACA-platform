"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { AIAssistantWidget } from "@/components/community/ai-assistant-widget";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ImageOff, Calendar, MapPin, Users,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type GalleryItem = {
  id: string;
  name: string;
  type: string;
  url: string;
  thumbnailUrl: string | null;
  description: string | null;
  tags: string | null;
  createdAt: string;
  album: { id: string; name: string; nameAr: string | null } | null;
};

export default function GalleryPage() {
  const { lang } = useLanguage();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/community/media?pageSize=60")
      .then((r) => r.json())
      .then((d) => { if (alive) setItems(d.items ?? []); })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const imageItems = items.filter((m) => m.type === "image" && m.url && m.url !== "#");

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <PageHeader
        title={lang === "ar" ? "معرض المجتمع الحي" : "Live Community Gallery"}
        subtitle={
          lang === "ar"
            ? "صور من فعاليات الجالية السودانية الأخيرة — مباشرة من المكتبة الرقمية."
            : "Photos from recent Sudanese community events — directly from the media library."
        }
        crumbs={[{ label: lang === "ar" ? "المعرض" : "Gallery" }]}
      />

      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8 py-6 flex-1">
        {/* Stats from DB */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: ImageOff, label: lang === "ar" ? "صور" : "Images", value: imageItems.length, color: "text-emerald-700" },
            { icon: Calendar, label: lang === "ar" ? "هذا الشهر" : "This month", value: imageItems.filter((m) => new Date(m.createdAt) > new Date(Date.now() - 30 * 86400000)).length, color: "text-gold" },
            { icon: MapPin, label: lang === "ar" ? "ألبومات" : "Albums", value: new Set(imageItems.map((m) => m.album?.id).filter(Boolean)).size, color: "text-teal-700" },
            { icon: Users, label: lang === "ar" ? "إجمالي الملفات" : "Total files", value: items.length, color: "text-purple-700" },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="rounded-2xl bg-card border border-border shadow-premium p-4">
                <Icon className={`h-5 w-5 mb-2 ${s.color}`} />
                <div className="text-2xl font-bold tabular-nums">{s.value}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Masonry Grid from DB */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] gap-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="rounded-2xl" />)}
          </div>
        ) : imageItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <ImageOff className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {lang === "ar" ? "لا توجد صور في المعرض بعد." : "No gallery images yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] gap-3">
            {imageItems.map((item, i) => {
              const spanClass = i % 7 === 0 ? "row-span-2 col-span-2" : i % 5 === 0 ? "row-span-2" : i % 3 === 0 ? "col-span-2" : "";
              return (
                <a
                  key={item.id}
                  href={`/library`}
                  className={`group relative overflow-hidden rounded-2xl bg-card border border-border shadow-premium hover:shadow-premium-lg transition-premium ${spanClass}`}
                >
                  <img
                    src={item.url}
                    alt={item.name}
                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-2 start-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-white/95 backdrop-blur px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                      <Calendar className="h-2 w-2" />
                      {new Date(item.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-3">
                    <h3 className="text-white font-bold text-xs md:text-sm leading-tight line-clamp-2 mb-1 group-hover:text-gold transition-premium">
                      {item.name}
                    </h3>
                    {item.album && (
                      <div className="flex items-center gap-1.5 text-[10px] text-white/70">
                        <MapPin className="h-2.5 w-2.5" />
                        <span className="truncate">
                          {lang === "ar" && item.album.nameAr ? item.album.nameAr : item.album.name}
                        </span>
                      </div>
                    )}
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
