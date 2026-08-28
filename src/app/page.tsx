"use client";

import { useEffect, useState } from "react";
import { TopNav } from "@/components/layout/top-nav";
import { IconNavBar } from "@/components/layout/icon-nav-bar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/community/hero-section";
import { LiveNowPanel } from "@/components/community/live-now-panel";
import { NextEventCard } from "@/components/community/next-event-card";
import { NotificationsPanel } from "@/components/community/notifications-panel";
import { UpcomingEventsList } from "@/components/community/upcoming-events-list";
import { CommunityMap } from "@/components/community/community-map";
import { LatestNews } from "@/components/community/latest-news";
import { AIAssistantWidget } from "@/components/community/ai-assistant-widget";
import { AnnouncementBanner } from "@/components/community/announcement-banner";
import { OrganizationListSchema } from "@/components/seo/structured-data";
import { CommunityActions } from "@/components/community/community-actions";
import { Skeleton } from "@/components/ui/skeleton";

type HomeData = {
  stats: { members: number; organizations: number; eventsThisWeek: number; liveMeetings: number };
  liveMeeting: { id: string; title: string; hostName: string; viewerCount: number } | null;
  nextMeeting: { id: string; title: string; scheduledAt: string } | null;
  upcomingEvents: Array<Record<string, unknown>>;
  featuredNews: Array<Record<string, unknown>>;
  notifications: Array<Record<string, unknown>>;
  organizations: Array<Record<string, unknown>>;
  sections: Array<{ key: string; title: string; sortOrder: number }>;
  settings: Record<string, string>;
};

export default function Home() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/community/home", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (alive) { setData(json); setError(null); }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (alive) setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <AnnouncementBanner />
      <TopNav />

      {/* Hero — dark left panel + cityscape right */}
      {loading ? (
        <div className="bg-[#061726] py-16 px-6">
          <Skeleton className="h-64 w-full bg-white/10" />
        </div>
      ) : (
        <HeroSection stats={data?.stats ?? { members: 0, organizations: 0, eventsThisWeek: 0, liveMeetings: 0 }} />
      )}

      {/* Icon Navigation Bar — overlapping hero */}
      <IconNavBar active="" />
      <CommunityActions lang="ar" />

      {/* Main content — 3-column layout */}
      <div className="flex-1 mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
          {/* LEFT COLUMN — Events list */}
          <aside className="lg:col-span-3 order-2 lg:order-1">
            <div className="lg:sticky lg:top-36">
              {loading ? (
                <Skeleton className="h-[400px] w-full rounded-2xl" />
              ) : (
                <UpcomingEventsList events={(data?.upcomingEvents ?? []) as never} />
              )}
            </div>
          </aside>

          {/* CENTER COLUMN — Map + News */}
          <section className="lg:col-span-6 order-1 lg:order-2 space-y-5">
            {loading ? (
              <>
                <Skeleton className="h-[460px] w-full rounded-2xl" />
                <Skeleton className="h-[400px] w-full rounded-2xl" />
              </>
            ) : (
              <>
                <CommunityMap organizations={(data?.organizations ?? []) as never} />
                <LatestNews news={(data?.featuredNews ?? []) as never} />
              </>
            )}
          </section>

          {/* RIGHT COLUMN — Live + Next Event + Notifications */}
          <aside className="lg:col-span-3 order-3 space-y-5">
            <div className="lg:sticky lg:top-36 space-y-5">
              {loading ? (
                <>
                  <Skeleton className="h-[280px] w-full rounded-2xl" />
                  <Skeleton className="h-[200px] w-full rounded-2xl" />
                  <Skeleton className="h-[280px] w-full rounded-2xl" />
                </>
              ) : (
                <>
                  <LiveNowPanel
                    meeting={
                      data?.liveMeeting
                        ? {
                            id: data.liveMeeting.id,
                            title: data.liveMeeting.title,
                            hostName: data.liveMeeting.hostName,
                            viewerCount: data.liveMeeting.viewerCount,
                          }
                        : null
                    }
                  />
                  <NextEventCard
                    event={
                      data?.nextMeeting
                        ? {
                            id: data.nextMeeting.id,
                            title: data.nextMeeting.title,
                            scheduledAt: data.nextMeeting.scheduledAt,
                          }
                        : null
                    }
                  />
                  <NotificationsPanel items={(data?.notifications ?? []) as never} />
                </>
              )}
            </div>
          </aside>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load community data: {error}. Please retry.
          </div>
        )}
      </div>

      <Footer />

      {data && data.organizations.length > 0 && (
        <OrganizationListSchema orgs={data.organizations as never} />
      )}

      <AIAssistantWidget />
    </main>
  );
}
