"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { AIAssistantWidget } from "@/components/community/ai-assistant-widget";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Building2, Calendar, Video, Sparkles, ArrowLeft, ArrowRight, PartyPopper } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

export default function OnboardingDonePage() {
  return (
    <Suspense fallback={null}>
      <OnboardingDoneContent />
    </Suspense>
  );
}

function OnboardingDoneContent() {
  const sp = useSearchParams();
  const { lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  const name = sp.get("name") || (lang === "ar" ? "عضوناً" : "member");

  const nextSteps = [
    { icon: Building2, ar: "اكتشف المنظمات", en: "Discover organizations", href: "/organizations" },
    { icon: Calendar, ar: "تصفح الفعاليات", en: "Browse events", href: "/events" },
    { icon: Video, ar: "شاهد الاجتماعات", en: "Watch meetings", href: "/meetings" },
    { icon: Sparkles, ar: "اسأل المساعد الذكي", en: "Ask the smart assistant", href: "/" },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <TopNav />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl text-center">
          {/* Hero */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-40 w-40 rounded-full bg-emerald-50 animate-pulse" />
            </div>
            <div className="relative inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-700 to-emerald-deep shadow-premium-lg ring-4 ring-emerald-100">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 mb-3">
            <PartyPopper className="h-3 w-3 text-gold" />
            <span className="text-[11px] font-semibold text-gold tracking-wider uppercase">
              {lang === "ar" ? "مرحبًا بك في SACA" : "Welcome to SACA"}
            </span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            {lang === "ar" ? `مرحبًا ${name}!` : `Welcome, ${name}!`}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto">
            {lang === "ar"
              ? "أصبحت الآن جزءًا من منصة الجالية السودانية الأمريكية. ابدأ رحلتك باستكشاف المنظمات والفعاليات في ولايتك."
              : "You're now part of the Sudanese American Community platform. Start your journey by exploring organizations and events in your state."}
          </p>

          {/* Next steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {nextSteps.map((s, i) => (
              <a
                key={i}
                href={s.href}
                className="group flex items-center gap-3 rounded-2xl bg-card border border-border shadow-premium hover:shadow-premium-lg hover:border-emerald-700/30 transition-premium p-4 text-start"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition-premium">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-foreground">
                    {lang === "ar" ? s.ar : s.en}
                  </div>
                </div>
                <Arrow className="h-4 w-4 text-muted-foreground group-hover:text-emerald-700 transition-premium" />
              </a>
            ))}
          </div>

          <Button asChild size="lg" className="bg-emerald-700 hover:bg-emerald-deep text-white rounded-full px-8">
            <a href="/">
              {lang === "ar" ? "ابدأ الاستكشاف" : "Start exploring"}
              <Arrow className="h-4 w-4 ms-1.5" />
            </a>
          </Button>
        </div>
      </div>

      <Footer />
      <AIAssistantWidget />
    </main>
  );
}
