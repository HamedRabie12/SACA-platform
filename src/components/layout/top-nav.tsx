"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Search,
  User,
  Menu,
  X,
  ChevronDown,
  Users,
  Building2,
  Calendar,
  Video,
  Newspaper,
  BookOpen,
  MapPin,
  Sparkles, ShieldCheck, HandHeart,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { SACALogo } from "@/components/brand/saca-logo";
import { GlobalSearch } from "@/components/layout/global-search";
import { NotificationBell } from "@/components/layout/notification-bell";

type MegaItem = { label: string; href: string };

function MegaMenu({ trigger, items }: { trigger: string; items: MegaItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function handleEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }

  function handleLeave() {
    timeoutRef.current = setTimeout(() => setOpen(false), 200);
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#047857] hover:bg-gray-50 inline-flex items-center gap-0.5 rounded-md transition-colors"
        aria-expanded={open}
      >
        {trigger}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 start-0 z-50 min-w-[320px] bg-white rounded-xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.15)] border border-gray-100 p-2 animate-fade-up">
          <div className="grid grid-cols-2 gap-0.5">
            {items.map((it) => (
              <a
                key={it.label}
                href={it.href}
                className="block rounded-lg p-3 hover:bg-emerald-50 group transition-colors"
                onClick={() => setOpen(false)}
              >
                <div className="text-sm font-semibold text-gray-700 group-hover:text-[#047857]">
                  {it.label}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function TopNav() {
  const { t, lang, toggleLang } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <a href="/" className="group inline-flex items-center">
            <SACALogo size="md" showText />
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-0.5">
          <a
            href="/"
            className="px-3 py-2 text-sm font-semibold text-[#047857] relative inline-flex items-center rounded-md hover:bg-gray-50"
          >
            {t("nav.home")}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-6 bg-[#047857]" />
          </a>

          <MegaMenu
            trigger={t("nav.community")}
            items={[
              { label: t("mega.members"), href: "/members" },
              { label: t("mega.groups"), href: "/organizations" },
              { label: t("mega.initiatives"), href: "/services" },
              { label: t("mega.services"), href: "/services" },
              { label: t("mega.communityHelp"), href: "/services" },
              { label: "الحوكمة والشفافية", href: "/governance" },
              { label: "التطوع", href: "/volunteer" },
            ]}
          />

          <MegaMenu
            trigger={t("nav.organizations")}
            items={[
              { label: t("mega.sudaneseOrgs"), href: "/organizations" },
              { label: t("mega.associations"), href: "/organizations?type=association" },
              { label: t("mega.centers"), href: "/organizations?type=center" },
              { label: t("mega.mosques"), href: "/organizations?type=mosque" },
              { label: t("mega.educational"), href: "/organizations?type=education" },
              { label: t("mega.professional"), href: "/organizations?type=professional" },
            ]}
          />

          <MegaMenu
            trigger={t("nav.events")}
            items={[
              { label: t("mega.upcomingEvents"), href: "/events" },
              { label: t("mega.liveEvents"), href: "/meetings" },
              { label: t("mega.conferences"), href: "/events?category=conference" },
              { label: t("mega.seminars"), href: "/events?category=educational" },
              { label: t("mega.occasions"), href: "/events?category=cultural" },
            ]}
          />

          <a href="/meetings" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#047857] hover:bg-gray-50 rounded-md transition-colors">
            {t("nav.meetings")}
          </a>
          <a href="/news" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#047857] hover:bg-gray-50 rounded-md transition-colors">
            {t("nav.news")}
          </a>
          <a href="/library" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#047857] hover:bg-gray-50 rounded-md transition-colors">
            {t("nav.library")}
          </a>
          <a href="/organizations" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#047857] hover:bg-gray-50 rounded-md transition-colors">
            {t("nav.map")}
          </a>
          <a href="/services" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#047857] hover:bg-gray-50 rounded-md transition-colors">
            {t("nav.services")}
          </a>
          <a href="/governance" className="px-3 py-2 text-sm font-semibold text-[#0B3D34] hover:bg-emerald-50 rounded-md transition-colors">الحوكمة</a>
          <a href="/elections" className="px-3 py-2 text-sm font-semibold text-[#0B3D34] hover:bg-emerald-50 rounded-md transition-colors">الانتخابات</a>
          <a href="/portal" className="px-3 py-2 text-sm font-semibold text-[#0B3D34] hover:bg-emerald-50 rounded-md transition-colors">بوابة العضو</a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <GlobalSearch />

          <button
            onClick={toggleLang}
            className="inline-flex h-9 items-center gap-1 rounded-full border border-gray-200 px-3 text-xs font-bold text-gray-600 hover:border-[#047857] hover:text-[#047857] transition-colors"
          >
            {lang === "ar" ? "EN" : "ع"}
            <ChevronDown className="h-3 w-3" />
          </button>

          {/* Notification Bell — real DB-backed with sound */}
          <NotificationBell />

          <a href="/portal" aria-label={t("nav.account")} className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-[#047857] ring-2 ring-white hover:ring-emerald-200 transition-colors">
            <User className="h-4 w-4" />
          </a>

          <Button asChild className="hidden md:inline-flex h-9 bg-[#047857] hover:bg-[#065f46] text-white text-sm font-semibold px-4 rounded-full shadow-md" size="sm">
            <a href="/auth/register">{t("nav.join")}</a>
          </Button>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-700 hover:bg-gray-50"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 grid gap-1 text-sm">
            {[
              { icon: Users, label: t("nav.home"), href: "/" },
              { icon: Users, label: t("nav.community"), href: "/members" },
              { icon: Building2, label: t("nav.organizations"), href: "/organizations" },
              { icon: Calendar, label: t("nav.events"), href: "/events" },
              { icon: Video, label: t("nav.meetings"), href: "/meetings" },
              { icon: Newspaper, label: t("nav.news"), href: "/news" },
              { icon: BookOpen, label: t("nav.library"), href: "/library" },
              { icon: MapPin, label: t("nav.map"), href: "/organizations" },
              { icon: Sparkles, label: t("nav.services"), href: "/services" },
              { icon: ShieldCheck, label: "الحوكمة", href: "/governance" },
              { icon: ShieldCheck, label: "الانتخابات", href: "/elections" },
              { icon: User, label: "بوابة العضو", href: "/portal" },
              { icon: HandHeart, label: "التطوع", href: "/portal/volunteer" },
            ].map((item, i) => (
              <a
                key={i}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-gray-50 text-gray-700"
              >
                <item.icon className="h-4 w-4 text-[#047857]" />
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
            <div className="pt-2 mt-1 border-t border-gray-100">
              <Button asChild className="w-full bg-[#047857] hover:bg-[#065f46] text-white">
                <a href="/auth/register">{t("nav.join")}</a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
