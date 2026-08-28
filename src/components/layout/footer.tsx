"use client";

import {
  Bot,
  MapPin,
  Calendar,
  Video,
  FileText,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";

export function Footer() {
  const { t, lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  const year = new Date().getFullYear();

  const quickLinks = [
    {
      icon: MapPin,
      ar: "إرشادات الموقع",
      en: "Find Location",
      desc_ar: "ابحث عن منظمة قريبة",
      desc_en: "Find a nearby organization",
      color: "from-emerald-600 to-emerald-deep",
      href: "/organizations",
    },
    {
      icon: Calendar,
      ar: "الفعاليات هذا الأسبوع",
      en: "This Week's Events",
      desc_ar: "اكتشف الفعاليات القادمة",
      desc_en: "Discover upcoming events",
      href: "/events",
      color: "from-gold to-amber-700",
    },
    {
      icon: Video,
      ar: "الاجتماعات المشتركة",
      en: "Joint Meetings",
      desc_ar: "انضم للاجتماعات القادمة",
      desc_en: "Join upcoming meetings",
      color: "from-teal-600 to-emerald-deep",
      href: "/meetings",
    },
    {
      icon: FileText,
      ar: "أخر التحديثات",
      en: "Latest Updates",
      desc_ar: "آخر الأخبار والمستجدات",
      desc_en: "Latest news and updates",
      color: "from-amber-700 to-amber-900",
      href: "/news",
    },
  ];

  return (
    <footer className="bg-[#064e3b] text-white mt-0">
      {/* AI Assistant promo + quick links */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8 py-8 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* AI Assistant section */}
            <div className="lg:col-span-4 flex items-start gap-4">
              {/* Robot mascot */}
              <div className="relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0">
                <svg viewBox="0 0 80 80" className="h-full w-full">
                  <defs>
                    <linearGradient id="footer-robot-body" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor="#F3EEE3" />
                    </linearGradient>
                    <linearGradient id="footer-robot-eyes" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#C5A065" />
                      <stop offset="100%" stopColor="#9D7B3D" />
                    </linearGradient>
                  </defs>
                  {/* Body */}
                  <rect x="14" y="22" width="52" height="46" rx="14" fill="url(#footer-robot-body)" />
                  <rect x="14" y="22" width="52" height="46" rx="14" fill="none" stroke="#0F3D3E" strokeWidth="1.5" />
                  {/* Eyes */}
                  <circle cx="30" cy="42" r="6" fill="#0F3D3E" />
                  <circle cx="50" cy="42" r="6" fill="#0F3D3E" />
                  <circle cx="32" cy="40" r="1.5" fill="url(#footer-robot-eyes)" />
                  <circle cx="52" cy="40" r="1.5" fill="url(#footer-robot-eyes)" />
                  {/* Mouth */}
                  <path d="M 30 54 Q 40 60 50 54" stroke="#0F3D3E" strokeWidth="2" fill="none" strokeLinecap="round" />
                  {/* Antenna */}
                  <line x1="40" y1="22" x2="40" y2="12" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="40" cy="10" r="3" fill="url(#footer-robot-eyes)" />
                  {/* Side antennae */}
                  <line x1="14" y1="38" x2="6" y2="38" stroke="#FFFFFF" strokeWidth="2" />
                  <line x1="14" y1="46" x2="6" y2="46" stroke="#FFFFFF" strokeWidth="2" />
                  <line x1="66" y1="38" x2="74" y2="38" stroke="#FFFFFF" strokeWidth="2" />
                  <line x1="66" y1="46" x2="74" y2="46" stroke="#FFFFFF" strokeWidth="2" />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-lg md:text-xl font-bold mb-1.5">
                  {t("footer.aiTitle")}
                </h3>
                <p className="text-xs md:text-sm text-white/70 leading-relaxed max-w-md mb-3">
                  {lang === "ar"
                    ? "اسألني عن المنظمات، الفعاليات، الاحتياجات، وأي شيء آخر يخص الجالية السودانية في أمريكا."
                    : "Ask me about organizations, events, needs, and anything else about the Sudanese American community."}
                </p>
                <Button asChild className="bg-white text-emerald-deep hover:bg-white/90 font-bold rounded-lg px-5 h-10 shadow-premium" size="sm">
                  <a href="/auth/register">
                    {t("footer.aiStart")}
                    <Arrow className="h-4 w-4 ms-1.5" />
                  </a>
                </Button>
              </div>
            </div>

            {/* 4 quick-link columns */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickLinks.map((q, i) => (
                  <a
                    key={i}
                    href={q.href}
                    className="group flex flex-col gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 p-4 transition-premium"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${q.color} ring-2 ring-white/10 group-hover:ring-gold/40 transition-premium`}>
                      <q.icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white leading-tight mb-0.5">
                        {lang === "ar" ? q.ar : q.en}
                      </div>
                      <div className="text-[10px] text-white/60 leading-snug">
                        {lang === "ar" ? q.desc_ar : q.desc_en}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-full bg-emerald-700 flex items-center justify-center">
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <span>
              © {year} SACA ·{" "}
              {lang === "ar"
                ? "الجالية السودانية الأمريكية - ولاية ميريلاند"
                : "Sudanese American Community Association · Maryland"}{" "}
              · {t("footer.rights")}
            </span>
          </div>
          <div className="flex items-center gap-5">
            <a href="/services" className="hover:text-white transition-premium">{t("footer.about")}</a>
            <a href="/admin" className="hover:text-white transition-premium">{t("footer.contact")}</a>
            <a href="/my-community" className="hover:text-white transition-premium">{t("footer.privacy")}</a>
            <a href="/admin/settings" className="hover:text-white transition-premium">{t("footer.terms")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
