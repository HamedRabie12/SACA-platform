"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { AIAssistantWidget } from "@/components/community/ai-assistant-widget";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Video, Calendar, Users, Circle } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type MeetingItem = {
  id: string;
  title: string;
  description: string;
  hostName: string;
  isLive: boolean;
  isPublic: boolean;
  scheduledAt: string;
  endsAt: string | null;
  state?: { code: string; nameEn: string; nameAr: string } | null;
};

export default function MeetingsPage() {
  const { lang } = useLanguage();
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [states, setStates] = useState<Array<{ code: string; nameEn: string; nameAr: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ state: "", liveOnly: false });

  useEffect(() => {
    fetch("/api/community/states")
      .then((r) => r.json())
      .then((d) => setStates(d.states ?? []))
      .catch(() => {});
  }, []);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.state) params.set("state", filter.state);
    if (filter.liveOnly) params.set("liveOnly", "1");
    try {
      const res = await fetch(`/api/community/meetings?${params}`);
      const data = await res.json();
      setMeetings(data.items ?? []);
    } catch {
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const t = setTimeout(fetchMeetings, 200);
    return () => clearTimeout(t);
  }, [fetchMeetings]);

  const live = meetings.filter((m) => m.isLive);
  const upcoming = meetings.filter((m) => !m.isLive);

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <PageHeader
        title={lang === "ar" ? "الاجتماعات المباشرة" : "Community Meetings"}
        subtitle={
          lang === "ar"
            ? "تابع الاجتماعات المباشرة والقادمة للجالية السودانية في الولايات المتحدة."
            : "Follow live and upcoming Sudanese community meetings across the United States."
        }
        crumbs={[{ label: lang === "ar" ? "الاجتماعات" : "Meetings" }]}
      />

      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8 py-6 flex-1">
        {/* Filters */}
        <div className="rounded-2xl bg-card border border-border shadow-premium p-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filter.state}
              onChange={(e) => setFilter((f) => ({ ...f, state: e.target.value }))}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm font-medium"
            >
              <option value="">{lang === "ar" ? "كل الولايات" : "All states"}</option>
              {states.map((s) => (
                <option key={s.code} value={s.code}>
                  {lang === "ar" ? s.nameAr : s.nameEn} ({s.code})
                </option>
              ))}
            </select>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filter.liveOnly}
                onChange={(e) => setFilter((f) => ({ ...f, liveOnly: e.target.checked }))}
                className="h-4 w-4 rounded border-border text-emerald-700 focus:ring-emerald-700"
              />
              <span className="text-sm text-foreground">{lang === "ar" ? "المباشر فقط" : "Live only"}</span>
            </label>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Live */}
            {live.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">
                    <Circle className="h-2 w-2 fill-red-500 live-dot" />
                    {lang === "ar" ? "مباشر الآن" : "LIVE NOW"}
                  </span>
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {live.map((m) => (
                    <MeetingCard key={m.id} meeting={m} lang={lang} />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-700" />
                  {lang === "ar" ? "الاجتماعات القادمة" : "Upcoming meetings"}
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {upcoming.map((m) => (
                    <MeetingCard key={m.id} meeting={m} lang={lang} />
                  ))}
                </div>
              </section>
            )}

            {!loading && meetings.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <Video className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {lang === "ar" ? "لا توجد اجتماعات." : "No meetings."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
      <AIAssistantWidget />
    </main>
  );
}

function MeetingCard({ meeting, lang }: { meeting: MeetingItem; lang: "ar" | "en" }) {
  const d = new Date(meeting.scheduledAt);
  return (
    <div className={`rounded-2xl border shadow-premium overflow-hidden ${
      meeting.isLive ? "border-red-200 bg-gradient-to-br from-red-50/40 to-card" : "border-border bg-card"
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          {meeting.isLive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-bold text-red-600">
              <Circle className="h-2 w-2 fill-red-500 live-dot" />
              {lang === "ar" ? "مباشر" : "LIVE"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
              <Calendar className="h-2.5 w-2.5" />
              {lang === "ar" ? "قادم" : "Upcoming"}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {meeting.isLive ? (
              <>{lang === "ar" ? "بث مباشر" : "Live room"}</>
            ) : (
              <>{d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { day: "numeric", month: "short" })} · {d.toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit" })}</>
            )}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-base font-bold text-foreground leading-snug mb-1.5 line-clamp-2">{meeting.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">{meeting.description}</p>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-3">
          <Users className="h-3 w-3 text-emerald-700" />
          <span>{meeting.hostName}</span>
        </div>
        <Button asChild className={`w-full rounded-xl font-bold ${
          meeting.isLive ? "bg-red-600 hover:bg-red-700 text-white" : "bg-emerald-700 hover:bg-emerald-deep text-white"
        }`}>
          <a href={`/meetings/${meeting.id}`}>
          <Video className="h-4 w-4 me-1.5" />
          {meeting.isLive ? (lang === "ar" ? "فتح الاجتماع" : "Open meeting") : (lang === "ar" ? "عرض الاجتماع" : "View meeting")}
          </a>
        </Button>
      </div>
    </div>
  );
}
