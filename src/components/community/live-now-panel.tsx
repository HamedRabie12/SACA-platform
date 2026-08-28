"use client";

import { Button } from "@/components/ui/button";
import { Video, Circle, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

export type LiveMeeting = {
  id: string;
  title: string;
  hostName: string;
  viewerCount: number;
};

export function LiveNowPanel({ meeting }: { meeting: LiveMeeting | null }) {
  const { t, lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  if (!meeting) {
    return (
      <div className="rounded-2xl bg-card border border-border shadow-premium p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-gold" />
          <span className="text-sm font-bold text-foreground">
            {lang === "ar" ? "المجتمع المباشر" : "Community Live"}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {lang === "ar" ? "لا يوجد اجتماع مباشر حالياً." : "No live meeting right now."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border shadow-premium overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-gradient-to-l from-emerald-50/40 to-transparent">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold" />
          <span className="text-sm font-bold text-foreground">
            {lang === "ar" ? "الاجتماع المباشر" : "Live Community Meeting"}
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-600">
          <Circle className="h-2 w-2 fill-red-500 live-dot" />
          {t("common.liveBadge")}
        </span>
      </div>

      <div className="p-4">
        <div className="rounded-xl bg-gradient-to-br from-emerald-deep via-emerald-900 to-slate-950 aspect-[16/9] grid place-items-center text-white overflow-hidden">
          <div className="text-center px-6">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/15 backdrop-blur">
              <Video className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold leading-snug">{meeting.title}</h3>
            <p className="mt-1 text-xs text-white/70">{meeting.hostName}</p>
            <p className="mt-2 text-[11px] text-white/60">
              {lang === "ar" ? "تظهر المشاركات الحقيقية بعد الاتصال بغرفة الاجتماع." : "Real participants appear after connecting to the live room."}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{lang === "ar" ? "اجتماع حي" : "Live room"}</span>
        </div>

        <Button asChild className="mt-3 w-full bg-emerald-700 hover:bg-emerald-deep text-white font-semibold rounded-lg h-10 shadow-premium">
          <a href={`/meetings/${meeting.id}`}>
            <Video className="h-4 w-4 me-1.5" />
            {lang === "ar" ? "فتح غرفة الاجتماع" : "Open live room"}
            <Arrow className="h-4 w-4 ms-1.5" />
          </a>
        </Button>
      </div>
    </div>
  );
}
