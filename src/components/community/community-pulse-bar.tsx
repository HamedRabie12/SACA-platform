"use client";

import { Radio, Activity, TrendingUp, Users } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type PulseData = {
  liveMeetings: number;
  eventsThisWeek: number;
  organizations: number;
};

export function CommunityPulseBar({ data }: { data: PulseData }) {
  const { t, lang } = useLanguage();

  const items = [
    {
      icon: Radio,
      label: lang === "ar" ? "اجتماعات مباشرة الآن" : "Live meetings",
      value: data.liveMeetings,
      tone: "live",
    },
    {
      icon: Activity,
      label: lang === "ar" ? "فعالية هذا الأسبوع" : "Events this week",
      value: data.eventsThisWeek,
      tone: "active",
    },
    {
      icon: TrendingUp,
      label: lang === "ar" ? "منظمات نشطة" : "Active organizations",
      value: data.organizations,
      tone: "info",
    },
  ];

  return (
    <div className="bg-gradient-to-r from-emerald-50/60 via-card to-emerald-50/60 border-y border-border/40">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 flex-shrink-0 ps-1 pe-3 border-e border-border/60">
            <span className="inline-flex h-2 w-2 rounded-full bg-red-500 live-dot" />
            <span className="text-xs font-bold text-foreground">{t("pulse.title")}</span>
          </div>
          <div className="flex items-center gap-6 flex-shrink-0">
            {items.map((it, i) => (
              <div key={i} className="flex items-center gap-2 flex-shrink-0">
                <it.icon
                  className={`h-4 w-4 ${
                    it.tone === "live"
                      ? "text-red-500"
                      : it.tone === "active"
                      ? "text-emerald-700"
                      : "text-gold"
                  }`}
                />
                <span className="text-xs text-muted-foreground">{it.label}</span>
                <span className="text-sm font-bold text-foreground tabular-nums">
                  {new Intl.NumberFormat("en-US").format(it.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
