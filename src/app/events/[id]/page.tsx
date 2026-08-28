"use client";

import { use, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { AIAssistantWidget } from "@/components/community/ai-assistant-widget";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, MapPin, Video, Users, Share2, Bookmark, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type EventDetail = {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string | null;
  eventDate: string;
  endDate: string | null;
  isOnline: boolean;
  location: string | null;
  capacity: number;
  registeredCount: number;
  organizerName: string | null;
  state?: { code: string; nameEn: string; nameAr: string } | null;
};

const CATEGORY_COLORS: Record<string, string> = {
  conference: "from-emerald-700 to-emerald-deep",
  educational: "from-amber-700 to-amber-900",
  cultural: "from-rose-700 to-rose-900",
  business: "from-teal-700 to-emerald-deep",
  families: "from-purple-700 to-purple-900",
  social: "from-blue-700 to-blue-900",
};

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowRight : ArrowLeft;
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  async function handleRegister() {
    setRegistering(true);
    try {
      const me = await fetch("/api/community/me", { cache: "no-store" });
      if (!me.ok) { window.location.href = "/auth/login"; return; }
      const res = await fetch(`/api/community/events/${id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        setRegistered(true);
        setEvent((e) => e ? { ...e, registeredCount: data.registeredCount } : e);
      } else {
        alert(data.error || "Failed to register");
      }
    } catch {
      alert("Could not register");
    } finally {
      setRegistering(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/community/events/${id}`);
        if (!res.ok) throw new Error("not found");
        const data = await res.json();
        setEvent(data.event);
      } catch {
        setEvent(null);
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
        <div className="mx-auto max-w-5xl px-6 py-6"><Skeleton className="h-64 w-full" /></div>
        <Footer />
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen flex flex-col bg-background">
        <TopNav />
        <PageHeader title={lang === "ar" ? "الفعالية غير موجودة" : "Event not found"}
          crumbs={[{ label: lang === "ar" ? "الفعاليات" : "Events", href: "/events" }]} />
        <div className="mx-auto max-w-5xl px-6 py-12 text-center">
          <Button asChild><a href="/events"><Arrow className="h-4 w-4 me-1.5" />{lang === "ar" ? "العودة للفعاليات" : "Back to events"}</a></Button>
        </div>
        <Footer />
      </main>
    );
  }

  const catColor = CATEGORY_COLORS[event.category] || "from-emerald-700 to-emerald-deep";
  const d = new Date(event.eventDate);
  const fillPct = event.capacity > 0 ? Math.min(100, (event.registeredCount / event.capacity) * 100) : 0;

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <PageHeader
        title={event.title}
        subtitle={event.description.slice(0, 140) + (event.description.length > 140 ? "…" : "")}
        crumbs={[
          { label: lang === "ar" ? "الفعاليات" : "Events", href: "/events" },
          { label: event.title },
        ]}
      />

      <div className="mx-auto w-full max-w-5xl px-4 md:px-6 lg:px-8 py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            {/* Cover */}
            <div className={`relative aspect-[16/9] rounded-2xl bg-gradient-to-br ${catColor} overflow-hidden shadow-premium-lg`}>
              <div className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `url(https://images.unsplash.com/photo-1499488935264-8d2d6d92e26c?q=80&w=1600&auto=format&fit=crop)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }} />
              <div className="absolute inset-0 flex flex-col items-start justify-end p-6 text-white">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 mb-3 text-xs font-semibold">
                  <Calendar className="h-3 w-3" />
                  {d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { day: "numeric", month: "long", year: "numeric" })}
                  <span className="mx-1">·</span>
                  <Clock className="h-3 w-3" />
                  {d.toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <h2 className="font-display text-xl md:text-3xl font-bold leading-tight">{event.title}</h2>
              </div>
            </div>

            <section className="rounded-2xl bg-card border border-border shadow-premium p-5">
              <h3 className="text-base font-bold text-foreground mb-3">{lang === "ar" ? "تفاصيل الفعالية" : "Event details"}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </section>

            <section className="rounded-2xl bg-card border border-border shadow-premium p-5">
              <h3 className="text-base font-bold text-foreground mb-3">{lang === "ar" ? "معلومات الفعالية" : "Event info"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><Calendar className="h-4 w-4" /></div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase">{lang === "ar" ? "التاريخ" : "Date"}</div>
                    <div className="font-semibold text-foreground text-sm">{d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><Clock className="h-4 w-4" /></div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase">{lang === "ar" ? "الوقت" : "Time"}</div>
                    <div className="font-semibold text-foreground text-sm">{d.toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">{event.isOnline ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}</div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase">{lang === "ar" ? "المكان" : "Location"}</div>
                    <div className="font-semibold text-foreground text-sm">{event.isOnline ? (lang === "ar" ? "بث مباشر" : "Live broadcast") : (event.location || event.state?.[lang === "ar" ? "nameAr" : "nameEn"])}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><Users className="h-4 w-4" /></div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase">{lang === "ar" ? "المسجلين" : "Registered"}</div>
                    <div className="font-semibold text-foreground text-sm tabular-nums">{event.registeredCount}/{event.capacity || "∞"}</div>
                  </div>
                </div>
              </div>
              {event.organizerName && (
                <div className="mt-4 pt-4 border-t border-border/60 text-xs text-muted-foreground">
                  {lang === "ar" ? "الجهة المنظمة:" : "Organizer:"} <span className="font-semibold text-foreground">{event.organizerName}</span>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside>
            <div className="rounded-2xl bg-card border border-border shadow-premium p-5 sticky top-20">
              {event.capacity > 0 && (
                <div className="mb-4">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">{lang === "ar" ? "المقاعد المتبقية" : "Seats left"}</span>
                    <span className="text-sm font-bold text-emerald-700 tabular-nums">{event.capacity - event.registeredCount}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full" style={{ width: `${fillPct}%` }} />
                  </div>
                </div>
              )}
              <Button
                onClick={handleRegister}
                disabled={registering || registered}
                className={`w-full ${registered ? "bg-emerald-100 text-emerald-700" : "bg-emerald-700 hover:bg-emerald-deep text-white"} rounded-xl h-11 font-bold mb-2`}
              >
                {registered ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 me-1.5" />
                    {lang === "ar" ? "تم التسجيل!" : "Registered!"}
                  </>
                ) : registering ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    {lang === "ar" ? "جارٍ التسجيل…" : "Registering…"}
                  </span>
                ) : (
                  lang === "ar" ? "سجّل الآن" : "Register now"
                )}
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
          </aside>
        </div>
      </div>

      <Footer />
      <AIAssistantWidget />
    </main>
  );
}
