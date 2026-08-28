"use client";

import {
  Users, Building2, MapPin, Heart, Newspaper, Calendar, Home,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

type IconItem = {
  key: string;
  icon: typeof Users;
  ar: string;
  en: string;
  href: string;
};

const ICON_ITEMS: IconItem[] = [
  { key: "home", icon: Home, ar: "الرئيسية", en: "Home", href: "/" },
  { key: "members", icon: Users, ar: "الأعضاء", en: "Members", href: "/members" },
  { key: "organizations", icon: Building2, ar: "المنظمات", en: "Organizations", href: "/organizations" },
  { key: "locations", icon: MapPin, ar: "المواقع", en: "Locations", href: "/organizations" },
  { key: "services", icon: Heart, ar: "الخدمات", en: "Services", href: "/services" },
  { key: "news", icon: Newspaper, ar: "الأخبار", en: "News", href: "/news" },
  { key: "events", icon: Calendar, ar: "الفعاليات", en: "Events", href: "/events" },
];

export function IconNavBar({ active = "" }: { active?: string }) {
  const { lang } = useLanguage();
  const pathname = usePathname();

  return (
    <nav className="relative z-20 -mt-8 mb-4">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
            {ICON_ITEMS.map((it) => {
              const isActive = it.key === active || pathname === it.href;
              const Icon = it.icon;
              return (
                <a
                  key={it.key}
                  href={it.href}
                  className={cn(
                    "relative flex flex-col items-center gap-2 px-2 md:px-4 py-1 transition-premium group min-w-[60px] flex-shrink-0",
                    isActive ? "text-[#047857]" : "text-gray-700 hover:text-[#047857]"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl transition-premium",
                      isActive
                        ? "bg-[#047857] text-white shadow-md"
                        : "bg-gray-50 text-[#047857] group-hover:bg-emerald-50"
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium whitespace-nowrap transition-premium",
                      isActive ? "text-[#047857] font-bold" : "text-gray-700"
                    )}
                  >
                    {lang === "ar" ? it.ar : it.en}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
