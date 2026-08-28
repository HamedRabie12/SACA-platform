"use client";

import { Home, Building2, Calendar, MapPin, Bot } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { usePathname } from "next/navigation";

/**
 * Mobile Bottom Action Bar
 * Visible only on mobile (lg:hidden).
 * One-tap access to: Home, Organizations, AI Assistant, Events, Map.
 * Per prompt Stage 46: Bottom Action Bar + Floating Actions + One-tap navigation.
 */
export function MobileBottomBar() {
  const { lang } = useLanguage();
  const pathname = usePathname();

  const items = [
    { icon: Home, label: lang === "ar" ? "الرئيسية" : "Home", href: "/", active: pathname === "/" },
    { icon: Building2, label: lang === "ar" ? "المنظمات" : "Orgs", href: "/organizations", active: pathname === "/organizations" },
    { icon: Bot, label: lang === "ar" ? "المساعد" : "AI", href: "/", active: false, center: true },
    { icon: Calendar, label: lang === "ar" ? "الفعاليات" : "Events", href: "/events", active: pathname === "/events" },
    { icon: MapPin, label: lang === "ar" ? "الخريطة" : "Map", href: "/organizations", active: false },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border shadow-premium-lg"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5 items-stretch">
        {items.map((it, i) => {
          const Icon = it.icon;
          if (it.center) {
            return (
              <a
                key={i}
                href={it.href}
                className="flex flex-col items-center justify-center py-2 relative"
              >
                <div className="absolute -top-5 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-700 to-emerald-deep text-white shadow-premium-lg ring-4 ring-card">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 mt-7">
                  {it.label}
                </span>
              </a>
            );
          }
          return (
            <a
              key={i}
              href={it.href}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 transition-premium ${
                it.active ? "text-emerald-700" : "text-muted-foreground"
              }`}
            >
              <Icon
                className="h-5 w-5"
                strokeWidth={it.active ? 2.5 : 1.8}
                fill={it.active ? "currentColor" : "none"}
                fillOpacity={it.active ? 0.15 : 0}
              />
              <span className={`text-[10px] ${it.active ? "font-bold" : "font-medium"}`}>
                {it.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
