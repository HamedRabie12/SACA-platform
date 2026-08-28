"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Lang = "ar" | "en";

type LanguageContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: string) => string;
  dir: "rtl" | "ltr";
};

const dict: Record<Lang, Record<string, string>> = {
  ar: {
    "nav.home": "الرئيسية",
    "nav.community": "المجتمع",
    "nav.organizations": "المنظمات",
    "nav.events": "الفعاليات",
    "nav.meetings": "الاجتماعات",
    "nav.news": "الأخبار",
    "nav.library": "المكتبة",
    "nav.map": "الخريطة",
    "nav.services": "الخدمات",
    "nav.search": "بحث",
    "nav.notifications": "الإشعارات",
    "nav.account": "الحساب",
    "nav.join": "انضم",
    "nav.explore": "استكشاف المجتمع",
    "nav.eventsBtn": "الفعاليات",
    "mega.members": "الأعضاء",
    "mega.groups": "المجموعات",
    "mega.initiatives": "المبادرات",
    "mega.services": "الخدمات",
    "mega.communityHelp": "المساعدات المجتمعية",
    "mega.sudaneseOrgs": "المنظمات السودانية",
    "mega.associations": "الجمعيات",
    "mega.centers": "المراكز",
    "mega.mosques": "المساجد والمراكز المجتمعية",
    "mega.educational": "المؤسسات التعليمية",
    "mega.professional": "المؤسسات المهنية",
    "mega.upcomingEvents": "الفعاليات القادمة",
    "mega.liveEvents": "الفعاليات المباشرة",
    "mega.pastEvents": "الفعاليات السابقة",
    "mega.conferences": "المؤتمرات",
    "mega.seminars": "الندوات",
    "mega.occasions": "المناسبات",
    "hero.title": "مجتمع سوداني أقوى، أينما كنت في أمريكا",
    "hero.subtitle": "منصة رقمية موحدة تربط الجالية السودانية في جميع الولايات الأمريكية — منظمات، فعاليات، اجتماعات مباشرة، أخبار، وخدمات مجتمعية حقيقية.",
    "hero.join": "انضم الآن",
    "hero.explore": "استكشاف المجتمع",
    "hero.events": "تصفح الفعاليات",
    "hero.members": "عضوًا",
    "hero.organizations": "منظمة مسجلة",
    "hero.eventsThisWeek": "فعالية هذا الأسبوع",
    "hero.liveMeetings": "اجتماعات مباشرة قادمة",
    "pulse.title": "نبض المجتمع الآن",
    "liveNow.title": "مباشر الآن",
    "liveNow.joinNow": "انضم الآن",
    "liveNow.watching": "مشاهد الآن",
    "liveNow.joinLiveSession": "الانضمام للجلسة المباشرة الآن",
    "nextEvent.title": "الحدث القادم",
    "nextEvent.eventDate": "يوم الحدث",
    "notifications.title": "التنبيهات",
    "events.upcoming": "الفعاليات القادمة",
    "events.viewAll": "عرض الكل",
    "events.registered": "مسجل",
    "events.capacity": "المقاعد",
    "map.title": "خريطة المنظمات السودانية في الولايات المتحدة",
    "map.subtitle": "اعرض المنظمات على الخريطة التفاعلية",
    "map.activeCenter": "مركز مجتمعي نشط",
    "map.viewLocation": "عرض الموقع",
    "map.distance": "المسافة",
    "news.title": "آخر الأخبار",
    "news.viewAll": "عرض الكل",
    "news.readMore": "اقرأ المزيد",
    "footer.aiTitle": "المساعد الذكي الخاص بك",
    "footer.aiDesc": "اسأل أي سؤال عن الجالية السودانية في أمريكا — يجيب بناءً على بيانات المنصة فقط.",
    "footer.aiStart": "ابدأ الآن",
    "footer.nearestPoint": "أقرب نقطة",
    "footer.thisWeekEvents": "الفعاليات لهذا الأسبوع",
    "footer.jointMeetings": "الاجتماعات المشتركة",
    "footer.latestPublications": "آخر النشرات",
    "footer.rights": "جميع الحقوق محفوظة",
    "footer.about": "عن المنصة",
    "footer.contact": "تواصل معنا",
    "footer.privacy": "الخصوصية",
    "footer.terms": "الشروط",
    "ai.title": "المساعد الذكي للمجتمع",
    "ai.subtitle": "مدعوم ببيانات المنصة",
    "ai.placeholder": "اسأل عن منظمة، فعالية، أو خدمة…",
    "ai.greeting": "مرحبًا! أنا المساعد الذكي للمنصة. أساعدك في العثور على المنظمات والفعاليات والخدمات داخل المنصة فقط. كيف أقدر أساعدك؟",
    "ai.disclaimer": "أجيب بناءً على بيانات المنصة فقط. لا أختلق معلومات غير موجودة.",
    "ai.send": "إرسال",
    "ai.sources": "المصادر",
    "common.viewAll": "عرض الكل",
    "common.viewDetails": "عرض التفاصيل",
    "common.register": "تسجيل",
    "common.search": "ابحث…",
    "common.allStates": "كل الولايات",
    "common.allCategories": "كل الفئات",
    "common.liveBadge": "مباشر",
    "common.verified": "موثقة",
    "common.unverified": "غير موثقة",
    "common.pending": "قيد المراجعة",
  },
  en: {
    "nav.home": "Home",
    "nav.community": "Community",
    "nav.organizations": "Organizations",
    "nav.events": "Events",
    "nav.meetings": "Meetings",
    "nav.news": "News",
    "nav.library": "Library",
    "nav.map": "Map",
    "nav.services": "Services",
    "nav.search": "Search",
    "nav.notifications": "Notifications",
    "nav.account": "Account",
    "nav.join": "Join",
    "nav.explore": "Explore Community",
    "nav.eventsBtn": "Events",
    "mega.members": "Members",
    "mega.groups": "Groups",
    "mega.initiatives": "Initiatives",
    "mega.services": "Services",
    "mega.communityHelp": "Community Help",
    "mega.sudaneseOrgs": "Sudanese Organizations",
    "mega.associations": "Associations",
    "mega.centers": "Centers",
    "mega.mosques": "Mosques & Community Centers",
    "mega.educational": "Educational",
    "mega.professional": "Professional",
    "mega.upcomingEvents": "Upcoming Events",
    "mega.liveEvents": "Live Events",
    "mega.pastEvents": "Past Events",
    "mega.conferences": "Conferences",
    "mega.seminars": "Seminars",
    "mega.occasions": "Occasions",
    "hero.title": "A Stronger Sudanese Community, Wherever You Are in America",
    "hero.subtitle": "A unified digital platform connecting the Sudanese community across all US states — real organizations, events, live meetings, news, and community services.",
    "hero.join": "Join Now",
    "hero.explore": "Explore Community",
    "hero.events": "Browse Events",
    "hero.members": "Members",
    "hero.organizations": "Registered Organizations",
    "hero.eventsThisWeek": "Events This Week",
    "hero.liveMeetings": "Upcoming Live Meetings",
    "pulse.title": "Community Pulse Now",
    "liveNow.title": "Live Now",
    "liveNow.joinNow": "Join Now",
    "liveNow.watching": "watching now",
    "liveNow.joinLiveSession": "Join the live session now",
    "nextEvent.title": "Next Event",
    "nextEvent.eventDate": "Event day",
    "notifications.title": "Notifications",
    "events.upcoming": "Upcoming Events",
    "events.viewAll": "View All",
    "events.registered": "registered",
    "events.capacity": "seats",
    "map.title": "Sudanese Organizations Across the United States",
    "map.subtitle": "Browse organizations on the interactive map",
    "map.activeCenter": "Active community center",
    "map.viewLocation": "View Location",
    "map.distance": "Distance",
    "news.title": "Latest News",
    "news.viewAll": "View All",
    "news.readMore": "Read More",
    "footer.aiTitle": "Your Smart Assistant",
    "footer.aiDesc": "Ask any question about the Sudanese community in America — answered only from platform data.",
    "footer.aiStart": "Start Now",
    "footer.nearestPoint": "Nearest Point",
    "footer.thisWeekEvents": "This Week's Events",
    "footer.jointMeetings": "Joint Meetings",
    "footer.latestPublications": "Latest Publications",
    "footer.rights": "All rights reserved",
    "footer.about": "About",
    "footer.contact": "Contact",
    "footer.privacy": "Privacy",
    "footer.terms": "Terms",
    "ai.title": "Community Smart Assistant",
    "ai.subtitle": "Powered by platform data",
    "ai.placeholder": "Ask about an organization, event, or service…",
    "ai.greeting": "Hello! I'm the platform's smart assistant. I help you find organizations, events, and services within the platform only. How can I help?",
    "ai.disclaimer": "I answer based on platform data only. I never make up information that doesn't exist.",
    "ai.send": "Send",
    "ai.sources": "Sources",
    "common.viewAll": "View All",
    "common.viewDetails": "View Details",
    "common.register": "Register",
    "common.search": "Search…",
    "common.allStates": "All States",
    "common.allCategories": "All Categories",
    "common.liveBadge": "LIVE",
    "common.verified": "Verified",
    "common.unverified": "Unverified",
    "common.pending": "Pending",
  },
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

// Lazy init: read from localStorage on first client render, fallback to "ar".
function getInitialLang(): Lang {
  if (typeof window === "undefined") return "ar";
  try {
    const saved = window.localStorage.getItem("lang") as Lang | null;
    if (saved === "ar" || saved === "en") return saved;
  } catch {
    // ignore
  }
  return "ar";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // useState initializer only runs on first render (client-side hydration included).
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  // Sync <html lang/dir> + persist to localStorage when lang changes.
  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    if (typeof window !== "undefined") window.localStorage.setItem("lang", lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const toggleLang = useCallback(() => setLangState((p) => (p === "ar" ? "en" : "ar")), []);

  const t = useCallback(
    (key: string) => {
      return dict[lang][key] ?? key;
    },
    [lang]
  );

  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
