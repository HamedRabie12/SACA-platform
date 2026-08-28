"use client";

import { Clock, MapPin, ArrowLeft, ArrowRight, Calendar, Video } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";

type EventItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string | null;
  isOnline: boolean;
  eventDate: string;
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

const CATEGORY_ICONS: Record<string, string> = {
  conference: "🎙️",
  educational: "📚",
  cultural: "🎭",
  business: "💼",
  families: "👨‍👩‍👧",
  social: "🤝",
};

const EVENT_THUMBS: Record<string, string> = {
  conference: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=400&auto=format&fit=crop",
  seminar: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=400&auto=format&fit=crop",
  cultural: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=400&auto=format&fit=crop",
  business: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=400&auto=format&fit=crop",
  family: "https://images.unsplash.com/photo-1609220136736-443140cffec6?q=80&w=400&auto=format&fit=crop",
};

export function UpcomingEventsList({ events }: { events: EventItem[] }) {
  const { t, lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  if (!events || events.length === 0) {
    return (
      <div className="rounded-2xl bg-card border border-border shadow-premium p-5 text-center">
        <p className="text-sm text-muted-foreground">
          {lang === "ar" ? "لا توجد فعاليات قادمة." : "No upcoming events."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border shadow-premium overflow-hidden">
      <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-700" />
          {t("events.upcoming")}
        </h3>
        <a
          href="/events"
          className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-deep"
        >
          {t("events.viewAll")}
        </a>
      </div>

      <div className="divide-y divide-border/40">
        {events.map((e) => {
          const d = new Date(e.eventDate);
          const dateStr = d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          const timeStr = d.toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const catColor =
            CATEGORY_COLORS[e.category] || "from-emerald-700 to-emerald-deep";
          const catIcon = CATEGORY_ICONS[e.category] || "📅";
          const thumb = EVENT_THUMBS[e.category] || EVENT_THUMBS.conference;
          const fillPct = e.capacity > 0 ? Math.min(100, (e.registeredCount / e.capacity) * 100) : 0;

          return (
            <a
              key={e.id}
              href={`/events/${e.id}`}
              className="block px-4 py-3 hover:bg-secondary/30 transition-premium group"
            >
              <div className="flex gap-3">
                {/* Thumbnail */}
                <div className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${catColor}`} />
                  <img
                    src={thumb}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-60 group-hover:opacity-70 transition-premium"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xl">
                    {catIcon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-foreground leading-snug mb-1 line-clamp-2 group-hover:text-emerald-700 transition-premium">
                    {e.title}
                  </h4>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mb-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Calendar className="h-2.5 w-2.5" />
                      {dateStr}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      {timeStr}
                    </span>
                    {e.isOnline ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                        <Video className="h-2.5 w-2.5" />
                        {lang === "ar" ? "أونلاين" : "Online"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                        <MapPin className="h-2.5 w-2.5" />
                        {e.location || (e.state?.[lang === "ar" ? "nameAr" : "nameEn"] ?? "—")}
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  {e.capacity > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full"
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        {e.registeredCount}/{e.capacity}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </a>
          );
        })}
      </div>

      <div className="px-4 py-3 border-t border-border/40">
        <Button asChild variant="outline" className="w-full border-emerald-700/30 text-emerald-700 hover:bg-emerald-50/50 hover:text-emerald-deep rounded-xl" size="sm">
          <a href="/events">
            {t("events.viewAll")}
            <Arrow className="h-3.5 w-3.5 ms-1" />
          </a>
        </Button>
      </div>
    </div>
  );
}
