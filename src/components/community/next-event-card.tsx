"use client";

import { useEffect, useState } from "react";
import { Star, Clock, MapPin, Calendar, ArrowLeft, ArrowRight, Bell } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";

type NextEvent = {
  id: string;
  title: string;
  scheduledAt: string;
} | null;

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  const diff = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  return { days, hours, mins, secs };
}

export function NextEventCard({ event }: { event: NextEvent }) {
  const { t, lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  const target = event ? new Date(event.scheduledAt) : new Date(0);
  const c = useCountdown(target);

  if (!event) {
    return (
      <div className="rounded-2xl bg-card border border-border shadow-premium p-4">
        <div className="flex items-center gap-2 mb-1">
          <Star className="h-4 w-4 text-gold fill-gold" />
          <span className="text-sm font-bold text-foreground">
            {t("nextEvent.title")}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {lang === "ar" ? "لا يوجد حدث قادم مجدول." : "No upcoming event scheduled."}
        </p>
      </div>
    );
  }

  const dateStr = target.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = target.toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="rounded-2xl bg-card border border-border shadow-premium overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/15">
            <Star className="h-3.5 w-3.5 text-gold fill-gold" />
          </div>
          <span className="text-sm font-bold text-foreground">
            {t("nextEvent.title")}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">
          {t("nextEvent.eventDate")}
        </span>
      </div>

      <div className="p-4">
        {/* Title */}
        <h3 className="font-display font-bold text-sm leading-snug mb-3 text-foreground line-clamp-2">
          {event.title}
        </h3>

        {/* Date / Time / Location rows */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-gold flex-shrink-0" />
            <span className="font-medium">{dateStr}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-gold flex-shrink-0" />
            <span className="font-medium">
              {timeStr}{" "}
              {lang === "ar" ? "بتوقيت ميريلاند" : "Maryland time"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-gold flex-shrink-0" />
            <span className="font-medium">
              {lang === "ar"
                ? "بث مباشر · غرفة بث SACA"
                : "Live broadcast · SACA stream room"}
            </span>
          </div>
        </div>

        {/* Date picker styled button */}
        <div className="rounded-lg border border-input bg-background px-3 py-2 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-700" />
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {lang === "ar" ? "يوم الحدث" : "Event day"}
                </div>
                <div className="text-xs font-bold text-foreground">
                  {target.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                  })}
                </div>
              </div>
            </div>
            <div className="text-end">
              <div className="text-[10px] text-muted-foreground">UTC-5</div>
              <div className="text-xs font-mono font-bold text-emerald-700">
                {pad(c.days)}d {pad(c.hours)}h {pad(c.mins)}m
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Button className="w-full bg-emerald-700 hover:bg-emerald-deep text-white font-bold rounded-lg h-10">
          <Bell className="h-4 w-4 me-1.5" />
          {lang === "ar" ? "سجّل الآن" : "Register now"}
          <Arrow className="h-4 w-4 ms-1.5" />
        </Button>
      </div>
    </div>
  );
}
