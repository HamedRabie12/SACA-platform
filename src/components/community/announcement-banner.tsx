"use client";

import { useEffect, useState } from "react";
import { X, AlertTriangle, Info, AlertOctagon, Siren } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type Announcement = { id: string; title: string; body: string; priority: "Normal" | "Important" | "Urgent" | "Critical" };
const PRIORITY_STYLE = {
  Normal: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", icon: Info, label_ar: "إعلان", label_en: "Notice" },
  Important: { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-900", icon: AlertTriangle, label_ar: "هام", label_en: "Important" },
  Urgent: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-900", icon: AlertOctagon, label_ar: "عاجل", label_en: "Urgent" },
  Critical: { bg: "bg-red-50", border: "border-red-300", text: "text-red-900", icon: Siren, label_ar: "حرج", label_en: "Critical" },
} as const;

export function AnnouncementBanner() {
  const { lang } = useLanguage();
  const [item, setItem] = useState<Announcement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let active = true;
    fetch("/api/community/home", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!active) return;
        const first = Array.isArray(data?.announcements) ? data.announcements[0] : null;
        if (!first) return;
        const dismissed = window.sessionStorage.getItem("saca-announcement-dismissed");
        if (dismissed === first.id) return;
        setItem(first);
        window.setTimeout(() => active && setVisible(true), 250);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);
  if (!item || !visible) return null;
  const style = PRIORITY_STYLE[item.priority] || PRIORITY_STYLE.Normal;
  const Icon = style.icon;
  return <div className={`border-b ${style.border} ${style.bg}`}>
    <div className="mx-auto max-w-[1600px] px-4 py-2.5 md:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${style.text} bg-white/60`}><Icon className="h-4 w-4" /></div>
        <div className="min-w-0 flex-1 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.text} bg-white/70`}>{lang === "ar" ? style.label_ar : style.label_en}</span>
          <span className="truncate text-xs font-bold text-foreground md:text-sm">{item.title}</span>
          <span className="hidden flex-1 text-xs text-muted-foreground md:inline line-clamp-1">{item.body}</span>
        </div>
        <button onClick={() => { window.sessionStorage.setItem("saca-announcement-dismissed", item.id); setVisible(false); }} className={`inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full hover:bg-white/60 ${style.text}`} aria-label="Dismiss"><X className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  </div>;
}
