"use client";

import { use, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { AIAssistantWidget } from "@/components/community/ai-assistant-widget";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  MapPin,
  Star,
  Phone,
  Mail,
  Globe,
  Clock,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Newspaper,
  Share2,
  Bookmark,
  Navigation,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type OrgDetail = {
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
  createdAt: string;
  state: { code: string; nameEn: string; nameAr: string } | null;
  city: { nameEn: string; nameAr: string } | null;
};

type RelatedEvent = { id: string; title: string; eventDate: string; location: string | null };
type RelatedNews = { id: string; title: string; publishedAt: string; summary: string };

const TYPE_LABEL: Record<string, { ar: string; en: string; icon: string }> = {
  association: { ar: "رابطة", en: "Association", icon: "🤝" },
  center: { ar: "مركز", en: "Center", icon: "🏛️" },
  mosque: { ar: "مسجد", en: "Mosque", icon: "🕌" },
  education: { ar: "تعليم", en: "Education", icon: "📚" },
  professional: { ar: "مهنية", en: "Professional", icon: "💼" },
  charity: { ar: "خيري", en: "Charity", icon: "❤️" },
};

const TYPE_COLOR: Record<string, string> = {
  association: "from-emerald-700 to-emerald-deep",
  center: "from-teal-700 to-emerald-deep",
  mosque: "from-amber-700 to-amber-900",
  education: "from-purple-700 to-purple-900",
  professional: "from-blue-700 to-blue-900",
  charity: "from-rose-700 to-rose-900",
};

export default function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowRight : ArrowLeft;

  const [org, setOrg] = useState<OrgDetail | null>(null);
  const [events, setEvents] = useState<RelatedEvent[]>([]);
  const [news, setNews] = useState<RelatedNews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/community/organizations/${id}`);
        if (!res.ok) throw new Error("not found");
        const data = await res.json();
        setOrg(data.organization);
        setEvents(data.relatedEvents ?? []);
        setNews(data.relatedNews ?? []);
      } catch {
        setOrg(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const typeLabel = org ? TYPE_LABEL[org.type] || { ar: org.type, en: org.type, icon: "🏢" } : null;
  const typeColor = org ? TYPE_COLOR[org.type] || "from-emerald-700 to-emerald-deep" : "";
  const servicesList = org?.services ? org.services.split(",").filter(Boolean) : [];

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-background">
        <TopNav />
        <Skeleton className="h-72 w-full" />
        <div className="mx-auto max-w-5xl px-6 py-6">
          <Skeleton className="h-64 w-full" />
        </div>
        <Footer />
      </main>
    );
  }

  if (!org) {
    return (
      <main className="min-h-screen flex flex-col bg-background">
        <TopNav />
        <PageHeader
          title={lang === "ar" ? "المنظمة غير موجودة" : "Organization not found"}
          crumbs={[{ label: lang === "ar" ? "المنظمات" : "Organizations", href: "/organizations" }]}
        />
        <div className="mx-auto max-w-5xl px-6 py-12 text-center">
          <Button asChild>
            <a href="/organizations">
              <Arrow className="h-4 w-4 me-1.5" />
              {lang === "ar" ? "العودة للدليل" : "Back to directory"}
            </a>
          </Button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <PageHeader
        title={org.name}
        subtitle={org.description.slice(0, 120) + (org.description.length > 120 ? "…" : "")}
        crumbs={[
          { label: lang === "ar" ? "المنظمات" : "Organizations", href: "/organizations" },
          { label: org.name },
        ]}
      />

      <div className="mx-auto w-full max-w-5xl px-4 md:px-6 lg:px-8 py-6 flex-1">
        {/* Cover + identity */}
        <div className={`relative h-40 md:h-56 rounded-2xl bg-gradient-to-br ${typeColor} overflow-hidden mb-6 shadow-premium-lg`}>
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: `url(https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 flex items-end p-6">
            <div className="flex items-end gap-4">
              <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl bg-white/15 backdrop-blur ring-2 ring-white/30 text-3xl md:text-4xl">
                {typeLabel?.icon}
              </div>
              <div className="text-white">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] uppercase tracking-wider text-white/70 font-semibold">
                    {lang === "ar" ? typeLabel?.ar : typeLabel?.en}
                  </span>
                  {org.verification === "Verified" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50/95 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      <Star className="h-2.5 w-2.5 fill-emerald-700" />
                      {lang === "ar" ? "موثقة" : "Verified"}
                    </span>
                  )}
                </div>
                <h2 className="font-display text-xl md:text-3xl font-bold leading-tight">{org.name}</h2>
                {org.rating > 0 && (
                  <div className="flex items-center gap-1 text-sm mt-1 text-white/90">
                    <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                    <span className="font-bold">{org.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left/main column */}
          <div className="lg:col-span-2 space-y-5">
            {/* About */}
            <section className="rounded-2xl bg-card border border-border shadow-premium p-5">
              <h3 className="text-base font-bold text-foreground mb-3">
                {lang === "ar" ? "عن المنظمة" : "About"}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{org.description}</p>
            </section>

            {/* Services */}
            {servicesList.length > 0 && (
              <section className="rounded-2xl bg-card border border-border shadow-premium p-5">
                <h3 className="text-base font-bold text-foreground mb-3">
                  {lang === "ar" ? "الخدمات" : "Services"}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {servicesList.map((s, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-secondary/40 border border-border/60 px-3 py-2 text-xs font-medium text-foreground"
                    >
                      {s.trim()}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Map */}
            {org.latitude && org.longitude && (
              <section className="rounded-2xl bg-card border border-border shadow-premium p-5">
                <h3 className="text-base font-bold text-foreground mb-3">
                  {lang === "ar" ? "الموقع على الخريطة" : "Location on map"}
                </h3>
                <div className="relative aspect-[16/10] rounded-xl bg-gradient-to-br from-emerald-50 to-beige overflow-hidden">
                  <svg viewBox="0 0 600 400" className="absolute inset-0 h-full w-full">
                    <rect width="600" height="400" fill="#E9F2EE" />
                    <g stroke="#0F3D3E" strokeOpacity="0.1" strokeWidth="1">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <line key={`h${i}`} x1="0" y1={i * 50} x2="600" y2={i * 50} />
                      ))}
                      {Array.from({ length: 12 }).map((_, i) => (
                        <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="400" />
                      ))}
                    </g>
                    {/* Pin */}
                    <g transform="translate(300, 200)">
                      <circle r="30" fill="#0F3D3E" fillOpacity="0.15" className="live-dot" />
                      <circle r="14" fill="#0F3D3E" stroke="white" strokeWidth="3" />
                      <circle r="5" fill="#C5A065" />
                    </g>
                  </svg>
                  <div className="absolute bottom-3 start-3 rounded-lg bg-white/95 backdrop-blur px-3 py-2 shadow-premium text-xs">
                    <div className="font-bold text-foreground">{org.address}</div>
                    <div className="text-muted-foreground">
                      {org.latitude.toFixed(4)}, {org.longitude.toFixed(4)}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Related events */}
            {events.length > 0 && (
              <section className="rounded-2xl bg-card border border-border shadow-premium p-5">
                <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-700" />
                  {lang === "ar" ? "الفعاليات القادمة" : "Upcoming events"}
                </h3>
                <div className="space-y-2">
                  {events.map((e) => (
                    <a
                      key={e.id}
                      href={`/events/${e.id}`}
                      className="flex items-center gap-3 rounded-xl p-2 hover:bg-secondary/40 transition-premium"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">
                        {new Date(e.eventDate).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { day: "numeric", month: "short" })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">{e.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{e.location}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Related news */}
            {news.length > 0 && (
              <section className="rounded-2xl bg-card border border-border shadow-premium p-5">
                <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                  <Newspaper className="h-4 w-4 text-emerald-700" />
                  {lang === "ar" ? "آخر الأخبار" : "Latest news"}
                </h3>
                <div className="space-y-2">
                  {news.map((n) => (
                    <a
                      key={n.id}
                      href={`/news/${n.id}`}
                      className="block rounded-xl p-2 hover:bg-secondary/40 transition-premium"
                    >
                      <div className="text-sm font-semibold text-foreground mb-0.5 line-clamp-1">{n.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{n.summary}</div>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right sidebar */}
          <aside className="space-y-4">
            <div className="rounded-2xl bg-card border border-border shadow-premium p-5 sticky top-20">
              <h3 className="text-sm font-bold text-foreground mb-3">
                {lang === "ar" ? "معلومات التواصل" : "Contact info"}
              </h3>
              <div className="space-y-2.5">
                {org.address && (
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-emerald-700 mt-0.5 flex-shrink-0" />
                    <span>{org.address}</span>
                  </div>
                )}
                {org.phone && (
                  <a href={`tel:${org.phone}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-emerald-700">
                    <Phone className="h-3.5 w-3.5 text-emerald-700" />
                    <span dir="ltr">{org.phone}</span>
                  </a>
                )}
                {org.email && (
                  <a href={`mailto:${org.email}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-emerald-700">
                    <Mail className="h-3.5 w-3.5 text-emerald-700" />
                    <span className="truncate">{org.email}</span>
                  </a>
                )}
                {org.website && (
                  <a href={org.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-emerald-700">
                    <Globe className="h-3.5 w-3.5 text-emerald-700" />
                    <span className="truncate">{org.website.replace(/^https?:\/\//, "")}</span>
                  </a>
                )}
                {org.hoursAr && (
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-emerald-700 mt-0.5 flex-shrink-0" />
                    <span>{org.hoursAr}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-border/60 space-y-2">
                <Button className="w-full bg-emerald-700 hover:bg-emerald-deep text-white rounded-xl">
                  <Navigation className="h-4 w-4 me-1.5" />
                  {lang === "ar" ? "عرض الاتجاهات" : "Get directions"}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="rounded-xl" size="sm">
                    <Bookmark className="h-3.5 w-3.5 me-1.5" />
                    {lang === "ar" ? "حفظ" : "Save"}
                  </Button>
                  <Button variant="outline" className="rounded-xl" size="sm">
                    <Share2 className="h-3.5 w-3.5 me-1.5" />
                    {lang === "ar" ? "مشاركة" : "Share"}
                  </Button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border/60 text-[10px] text-muted-foreground/70">
                <div>{lang === "ar" ? "أضيفت بتاريخ" : "Added on"}: {new Date(org.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}</div>
                {org.state && (
                  <div className="mt-0.5">
                    {lang === "ar" ? "الولاية" : "State"}: {org.state[lang === "ar" ? "nameAr" : "nameEn"]}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
      <AIAssistantWidget />
    </main>
  );
}
