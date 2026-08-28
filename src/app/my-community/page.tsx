"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { AIAssistantWidget } from "@/components/community/ai-assistant-widget";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, Building2, Calendar, Newspaper, Bell, Heart,
  MapPin, Briefcase, Sparkles, ArrowLeft, ArrowRight,
  ShieldCheck, Clock, Bookmark,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type Org = { id: string; name: string; type: string; rating: number; state: { code: string; nameEn: string; nameAr: string } | null };
type EventItem = { id: string; title: string; eventDate: string; location: string | null };

export default function MyCommunityPage() {
  const { lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<{
    name: string; stateCode: string; stateNameAr: string; stateNameEn: string;
    city: string; interests: string; profession: string; membershipType: string; createdAt: string;
  } | null>(null);
  const [recommendations, setRecommendations] = useState<{ orgs: Org[]; events: EventItem[] }>({ orgs: [], events: [] });
  const [notifications, setNotifications] = useState<Array<{ id: string; type: string; title: string; body: string; createdAt: string }>>([]);
  const [stats, setStats] = useState({ registeredEvents: 0, followingOrgs: 0, savedNews: 0, unreadNotifs: 0 });

  useEffect(() => {
    let alive = true;
    async function loadMember() {
      try {
        const meRes = await fetch("/api/community/me", { cache: "no-store" });
        if (!meRes.ok) { window.location.href = "/auth/login"; return; }
        const meData = await meRes.json();
        const currentMember = meData.member;

        const [orgsRes, eventsRes, notifsRes] = await Promise.all([
          fetch(`/api/community/organizations?state=MD&pageSize=3`).then((r) => r.json()),
          fetch(`/api/community/events?state=MD&pageSize=3`).then((r) => r.json()),
          fetch(`/api/community/notifications?pageSize=3`).then((r) => r.json()),
        ]);

        if (!alive) return;
        setRecommendations({
          orgs: (orgsRes.items ?? []).map((o: Record<string, unknown>) => ({
            id: o.id as string, name: o.name as string, type: o.type as string,
            rating: o.rating as number,
            state: o.state as { code: string; nameEn: string; nameAr: string } | null,
          })),
          events: (eventsRes.items ?? []).map((e: Record<string, unknown>) => ({
            id: e.id as string, title: e.title as string,
            eventDate: e.eventDate as string, location: e.location as string | null,
          })),
        });
        setNotifications((notifsRes.items ?? []).map((n: Record<string, unknown>) => ({
          id: n.id as string, type: n.type as string, title: n.title as string,
          body: n.body as string, createdAt: n.createdAt as string,
        })));
        setStats({
          registeredEvents: eventsRes.pagination?.total ?? 0,
          followingOrgs: orgsRes.pagination?.total ?? 0,
          savedNews: 0,
          unreadNotifs: notifsRes.unreadCount ?? 0,
        });
        setMember({
          name: currentMember.name,
          stateCode: currentMember.state?.code ?? "",
          stateNameAr: currentMember.state?.nameAr ?? "",
          stateNameEn: currentMember.state?.nameEn ?? "",
          city: currentMember.city?.nameEn ?? "",
          interests: currentMember.interests ?? "",
          profession: currentMember.profession ?? "",
          membershipType: currentMember.membershipType,
          createdAt: currentMember.createdAt,
        });
      } catch {}
      setLoading(false);
    }
    loadMember();
    return () => { alive = false; };
  }, []);

  const statsList = [
    { icon: Calendar, label: lang === "ar" ? "فعاليات مسجّل بها" : "Registered events", value: stats.registeredEvents, color: "text-emerald-700" },
    { icon: Building2, label: lang === "ar" ? "منظمات متابَعة" : "Following organizations", value: stats.followingOrgs, color: "text-gold" },
    { icon: Newspaper, label: lang === "ar" ? "أخبار محفوظة" : "Saved news", value: stats.savedNews, color: "text-teal-700" },
    { icon: Bell, label: lang === "ar" ? "إشعارات جديدة" : "New notifications", value: stats.unreadNotifs, color: "text-rose-700" },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <PageHeader
        title={`${lang === "ar" ? "مرحبًا" : "Welcome"}, ${member?.name ?? ""}`}
        subtitle={lang === "ar" ? "هذه مساحتك الشخصية في منصة SACA." : "Your personal space on SACA."}
        crumbs={[{ label: lang === "ar" ? "مجتمعي" : "My Community" }]}
      />

      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8 py-6 flex-1">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Skeleton className="h-64 rounded-2xl" />
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
            </div>
          </div>
        ) : (
          <>
            {/* Profile + stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-deep text-white shadow-premium p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-2xl font-bold ring-4 ring-white/20">
                    {member?.name?.charAt(0) ?? "?"}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{member?.name}</h2>
                    {member?.membershipType === "Verified" && (
                      <span className="inline-flex items-center gap-1 text-xs text-white/70">
                        <ShieldCheck className="h-3 w-3 text-gold" /> {lang === "ar" ? "عضو موثّق" : "Verified member"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-white/80">
                    <MapPin className="h-3 w-3 text-gold" />
                    <span>{member ? `${member.stateNameAr} (${member.stateCode})` : ""}</span>
                  </div>
                </div>
                <Button variant="outline" className="mt-4 w-full bg-white/5 border-white/20 text-white hover:bg-white/15 hover:text-white rounded-xl">
                  <Settings className="h-4 w-4 me-1.5" />
                  {lang === "ar" ? "تعديل الملف الشخصي" : "Edit profile"}
                </Button>
              </div>

              <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                {statsList.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="rounded-2xl bg-card border border-border shadow-premium p-4 flex flex-col justify-between">
                      <Icon className={`h-5 w-5 ${s.color}`} />
                      <div>
                        <div className="text-2xl font-bold text-foreground tabular-nums">{s.value}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendations */}
            <div className="rounded-2xl bg-card border border-border shadow-premium p-5 mb-6">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold" />
                {lang === "ar" ? "مُستحسَن لك في ولايتك" : "Recommended for you"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/60 p-3">
                  <div className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-emerald-700" />
                    {lang === "ar" ? "منظمات قريبة" : "Organizations near you"}
                  </div>
                  {recommendations.orgs.length === 0 ? (
                    <p className="text-xs text-muted-foreground">{lang === "ar" ? "لا توجد منظمات." : "No organizations."}</p>
                  ) : (
                    <div className="space-y-1.5">
                      {recommendations.orgs.map((o) => (
                        <a key={o.id} href={`/organizations/${o.id}`} className="block rounded-lg px-2 py-1.5 hover:bg-secondary/40">
                          <div className="text-xs font-semibold text-foreground truncate">{o.name}</div>
                          <div className="text-[10px] text-muted-foreground">{o.type} · ⭐ {o.rating.toFixed(1)}</div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-border/60 p-3">
                  <div className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-emerald-700" />
                    {lang === "ar" ? "فعاليات قادمة" : "Upcoming events"}
                  </div>
                  {recommendations.events.length === 0 ? (
                    <p className="text-xs text-muted-foreground">{lang === "ar" ? "لا توجد فعاليات." : "No events."}</p>
                  ) : (
                    <div className="space-y-1.5">
                      {recommendations.events.map((e) => (
                        <a key={e.id} href={`/events/${e.id}`} className="block rounded-lg px-2 py-1.5 hover:bg-secondary/40">
                          <div className="text-xs font-semibold text-foreground truncate">{e.title}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {new Date(e.eventDate).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { day: "numeric", month: "short" })}
                            {e.location && ` · ${e.location}`}
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notifications from DB */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="rounded-2xl bg-card border border-border shadow-premium p-5">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-emerald-700" />
                  {lang === "ar" ? "آخر الإشعارات" : "Recent notifications"}
                </h3>
                <div className="space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-muted-foreground">{lang === "ar" ? "لا توجد إشعارات." : "No notifications."}</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="rounded-lg px-2 py-1.5 hover:bg-secondary/40">
                        <div className="text-xs font-semibold text-foreground line-clamp-1">{n.title}</div>
                        <div className="text-[10px] text-muted-foreground">{n.body.slice(0, 60)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
      <AIAssistantWidget />
    </main>
  );
}

function Settings({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
}
