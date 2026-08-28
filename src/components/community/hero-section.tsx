"use client";

import { Button } from "@/components/ui/button";
import {
  Users, Building2, CalendarDays, Video, ArrowLeft, ArrowRight,
  Sparkles, MapPin,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type HeroStats = {
  members: number;
  organizations: number;
  eventsThisWeek: number;
  liveMeetings: number;
};

function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export function HeroSection({ stats }: { stats: HeroStats }) {
  const { t, lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  const statsList = [
    { icon: Users, value: stats.members, label: t("hero.members") },
    { icon: Building2, value: stats.organizations, label: t("hero.organizations") },
    { icon: CalendarDays, value: stats.eventsThisWeek, label: t("hero.eventsThisWeek") },
    { icon: Video, value: stats.liveMeetings, label: t("hero.liveMeetings") },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-[#061726]">
      {/* Background cityscape image — right 65% visible, left covered by dark panel */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1496564203457-11bb12075d90?q=80&w=2400&auto=format&fit=crop"
          alt="US City skyline at sunset"
          className="h-full w-full object-cover"
          loading="eager"
        />
        {/* Gradient: left dark → right transparent */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#061726] via-[#061726]/95 to-[#061726]/30 lg:from-[#061726] lg:via-[#061726]/92 lg:to-transparent" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* LEFT: Stats panel (dark, ~35% width on desktop) */}
          <aside className="lg:col-span-4 xl:col-span-4 order-2 lg:order-1">
            <div className="rounded-2xl bg-[#061726]/95 backdrop-blur-xl border border-white/10 p-5 md:p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                <span className="inline-flex h-2 w-2 rounded-full bg-red-500 live-dot" />
                <span className="text-xs font-bold text-white/80 tracking-wider uppercase">
                  {lang === "ar" ? "إحصاءات حية" : "Live Stats"}
                </span>
              </div>
              <div className="grid gap-1">
                {statsList.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 border-b border-white/5 last:border-0 transition-premium hover:bg-white/5"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10">
                      <s.icon className="h-4 w-4 text-[#10b981]" />
                    </div>
                    <div className="flex-1 flex items-baseline gap-2">
                      <span className="text-2xl md:text-3xl font-bold text-white font-display tabular-nums">
                        {formatNumber(s.value)}
                      </span>
                      <span className="text-xs md:text-sm text-gray-400">
                        {s.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {/* CTA: Explore More */}
              <Button asChild className="w-full mt-4 bg-[#047857] hover:bg-[#065f46] text-white font-bold rounded-lg h-11 justify-between px-4">
                <a href="/organizations">
                  {lang === "ar" ? "استكشف المزيد" : "Explore More"}
                  <Arrow className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </aside>

          {/* RIGHT: Hero text + buttons (image visible behind) */}
          <div className="lg:col-span-8 xl:col-span-8 order-1 lg:order-2 text-center lg:text-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#10b981]/40 bg-[#10b981]/10 px-3 py-1 mb-4 md:mb-6">
              <Sparkles className="h-3 w-3 text-[#10b981]" />
              <span className="text-[11px] font-semibold text-[#10b981] tracking-wider uppercase">
                {lang === "ar"
                  ? "SACA · الجالية السودانية الأمريكية"
                  : "SACA · Sudanese American Community"}
              </span>
            </div>

            <h1 className="font-display text-3xl md:text-5xl lg:text-[42px] font-bold text-white leading-[1.2] mb-4 max-w-3xl mx-auto lg:mx-0">
              {lang === "ar" ? "مجتمع واحد ... مستقبل واحد" : "One Community... One Future"}
            </h1>

            <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-md mx-auto lg:mx-0 mb-6 md:mb-8">
              {lang === "ar"
                ? "منصة تجمع السودانيين في الولايات المتحدة لخدمة مجتمعاتنا وبناء مستقبل أقوى معًا."
                : "A platform uniting Sudanese across the United States to serve our communities and build a stronger future together."}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
              <Button asChild size="lg" className="bg-[#047857] hover:bg-[#065f46] text-white font-bold rounded-xl px-8 h-12 shadow-lg">
                <a href="/auth/register">
                  <Users className="h-4 w-4 me-1.5" />
                  {lang === "ar" ? "انضم إلينا" : "Join Us"}
                </a>
              </Button>
              <Button asChild size="lg" className="bg-white/95 hover:bg-white text-gray-900 font-bold rounded-xl px-8 h-12 border border-white/30">
                <a href="/organizations">
                  {lang === "ar" ? "استكشف المنصة" : "Explore Platform"}
                  <Arrow className="h-4 w-4 ms-1.5" />
                </a>
              </Button>
            </div>

            {/* Location badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 px-4 py-2">
              <span className="text-lg">🏴</span>
              <span className="text-sm font-medium text-white">
                {lang === "ar" ? "ولاية ميريلاند" : "Maryland"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
