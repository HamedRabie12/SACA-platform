"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { AIAssistantWidget } from "@/components/community/ai-assistant-widget";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users, Search, MapPin, Briefcase, Heart, ShieldCheck,
  ArrowLeft, ArrowRight, Calendar, Mail,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type Member = {
  id: string;
  name: string;
  profession: string | null;
  interests: string | null;
  membershipType: string;
  accountState: string;
  state: { code: string; nameEn: string; nameAr: string } | null;
  city: { nameEn: string; nameAr: string } | null;
  createdAt: string;
};

export default function MembersDirectoryPage() {
  const { lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  const [members, setMembers] = useState<Member[]>([]);
  const [states, setStates] = useState<Array<{ code: string; nameEn: string; nameAr: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ q: "", state: "" });

  useEffect(() => {
    fetch("/api/community/states")
      .then((r) => r.json())
      .then((d) => setStates(d.states ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => { if (alive) setLoading(true); });
    fetch("/api/community/members")
      .then((r) => r.json())
      .then((d) => { if (alive) setMembers(d.items ?? []); })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const filtered = members
    .filter((m) => m.accountState === "Active" || m.accountState === "Verified")
    .filter((m) => {
      if (filter.state && m.state?.code !== filter.state) return false;
      if (filter.q) {
        const q = filter.q.toLowerCase();
        return m.name.toLowerCase().includes(q) ||
          (m.profession ?? "").toLowerCase().includes(q) ||
          (m.interests ?? "").toLowerCase().includes(q);
      }
      return true;
    });

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <PageHeader
        title={lang === "ar" ? "دليل الأعضاء" : "Members Directory"}
        subtitle={lang === "ar" ? "تعرّف على أعضاء الجالية السودانية في الولايات المتحدة." : "Meet members of the Sudanese American community."}
        crumbs={[{ label: lang === "ar" ? "الأعضاء" : "Members" }]}
      />

      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8 py-6 flex-1">
        {/* Filters */}
        <div className="rounded-2xl bg-card border border-border shadow-premium p-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={lang === "ar" ? "ابحث بالاسم/المهنة/الاهتمام…" : "Search by name/profession/interest…"}
                value={filter.q}
                onChange={(e) => setFilter((f) => ({ ...f, q: e.target.value }))}
                className="ps-9 rounded-xl"
              />
            </div>
            <select
              value={filter.state}
              onChange={(e) => setFilter((f) => ({ ...f, state: e.target.value }))}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm font-medium"
            >
              <option value="">{lang === "ar" ? "كل الولايات" : "All states"}</option>
              {states.map((s) => (
                <option key={s.code} value={s.code}>{lang === "ar" ? s.nameAr : s.nameEn} ({s.code})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {loading ? (lang === "ar" ? "جارٍ التحميل…" : "Loading…") : (
              <>
                <span className="font-bold text-foreground">{filtered.length}</span>{" "}
                {lang === "ar" ? "عضوًا" : "members"}
              </>
            )}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {lang === "ar"
                ? "لا يوجد أعضاء مطابقون. كن أول من ينضم من ولايتك!"
                : "No matching members. Be the first from your state!"}
            </p>
            <Button asChild className="mt-3 bg-emerald-700 hover:bg-emerald-deep text-white rounded-xl">
              <a href="/auth/register">{lang === "ar" ? "انضم الآن" : "Join now"}</a>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((m) => {
              const interests = (m.interests ?? "").split(",").filter(Boolean).slice(0, 3);
              const joinedDate = new Date(m.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { month: "short", year: "numeric" });
              return (
                <a
                  key={m.id}
                  href={`/members/${m.id}`}
                  className="group rounded-2xl bg-card border border-border shadow-premium hover:shadow-premium-lg hover:border-emerald-700/30 transition-premium p-5 block"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative flex-shrink-0">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-700 to-emerald-deep flex items-center justify-center text-white text-xl font-bold ring-2 ring-white shadow-premium">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      {m.membershipType === "Verified" && (
                        <div className="absolute -bottom-0.5 -end-0.5 h-5 w-5 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center">
                          <ShieldCheck className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-foreground truncate group-hover:text-emerald-700 transition-premium">{m.name}</h3>
                      {m.state && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {m.state[lang === "ar" ? "nameAr" : "nameEn"]}
                          {m.city && ` · ${m.city[lang === "ar" ? "nameAr" : "nameEn"]}`}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-0.5 inline-flex items-center gap-0.5">
                        <Calendar className="h-2.5 w-2.5" />
                        {lang === "ar" ? "انضم في" : "Joined"} {joinedDate}
                      </p>
                    </div>
                  </div>

                  {m.profession && (
                    <p className="text-xs text-foreground mb-2 flex items-center gap-1.5">
                      <Briefcase className="h-3 w-3 text-emerald-700 flex-shrink-0" />
                      <span className="truncate">{m.profession}</span>
                    </p>
                  )}

                  {interests.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {interests.map((it, i) => (
                        <span key={i} className="inline-flex items-center gap-0.5 rounded-md bg-secondary/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          <Heart className="h-2 w-2" />
                          {it.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </a>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
      <AIAssistantWidget />
    </main>
  );
}
