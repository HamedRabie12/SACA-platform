"use client";

import { Bell, MoreHorizontal, Circle } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type NotifItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  priority: string;
  createdAt: string;
};

function timeAgo(dateStr: string, lang: "ar" | "en") {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (lang === "ar") {
    if (mins < 1) return "الآن";
    if (mins < 60) return `قبل ${mins} دقيقة`;
    if (hours < 24) return `قبل ${hours} ساعة`;
    return `قبل ${days} يوم`;
  } else {
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
}

const PRIORITY_COLOR: Record<string, string> = {
  Normal: "bg-emerald-500",
  Important: "bg-gold",
  Urgent: "bg-red-500",
  Critical: "bg-red-600",
};

export function NotificationsPanel({ items }: { items: NotifItem[] }) {
  const { t, lang } = useLanguage();

  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl bg-card border border-border shadow-premium p-4">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="h-4 w-4 text-emerald-700" />
          <span className="text-sm font-bold text-foreground">{t("notifications.title")}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {lang === "ar" ? "لا توجد إشعارات." : "No notifications."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border shadow-premium overflow-hidden">
      <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-emerald-700" />
          <span className="text-sm font-bold text-foreground">{t("notifications.title")}</span>
        </div>
        <span className="inline-flex items-center justify-center rounded-full bg-emerald-700 text-white text-[10px] font-bold h-5 min-w-5 px-1.5">
          {items.length}
        </span>
      </div>

      <div className="divide-y divide-border/40">
        {items.map((n) => (
          <div
            key={n.id}
            className="px-4 py-3 hover:bg-secondary/30 transition-premium cursor-pointer group"
          >
            <div className="flex items-start gap-2.5">
              <div className="relative mt-1.5 flex-shrink-0">
                <span
                  className={`block h-2 w-2 rounded-full ${
                    PRIORITY_COLOR[n.priority] || "bg-emerald-500"
                  } live-dot`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                  <h4 className="text-xs font-semibold text-foreground truncate">
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">
                    {timeAgo(n.createdAt, lang)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {n.body}
                </p>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <a
        href="/admin/notifications"
        className="block px-4 py-2.5 text-center text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50/40 transition-premium border-t border-border/40"
      >
        {t("common.viewAll")}
      </a>
    </div>
  );
}
