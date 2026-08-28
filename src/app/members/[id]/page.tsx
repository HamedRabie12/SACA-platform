"use client";

import { use, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { AIAssistantWidget } from "@/components/community/ai-assistant-widget";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin, Briefcase, Heart, ShieldCheck, Calendar,
  ArrowLeft, ArrowRight, UserPlus, MessageCircle,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type Member = {
  id: string;
  name: string;
  profession: string | null;
  interests: string | null;
  bio: string | null;
  membershipType: string;
  accountState: string;
  state: { code: string; nameEn: string; nameAr: string } | null;
  city: { nameEn: string; nameAr: string } | null;
  createdAt: string;
};

export default function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Use the public members list endpoint and find this member
        const res = await fetch(`/api/community/members?pageSize=100`);
        const data = await res.json();
        const m = (data.items ?? []).find((x: Member) => x.id === id);
        setMember(m ?? null);
      } catch {
        setMember(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-background">
        <TopNav />
        <div className="mx-auto max-w-4xl px-6 py-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <Footer />
      </main>
    );
  }

  if (!member) {
    return (
      <main className="min-h-screen flex flex-col bg-background">
        <TopNav />
        <PageHeader title={lang === "ar" ? "العضو غير موجود" : "Member not found"}
          crumbs={[{ label: lang === "ar" ? "الأعضاء" : "Members", href: "/members" }]} />
        <div className="mx-auto max-w-4xl px-6 py-12 text-center">
          <Button asChild>
            <a href="/members">
              <Arrow className="h-4 w-4 me-1.5" />
              {lang === "ar" ? "العودة للدليل" : "Back to directory"}
            </a>
          </Button>
        </div>
        <Footer />
      </main>
    );
  }

  const interests = (member.interests ?? "").split(",").filter(Boolean);
  const joinedDate = new Date(member.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <PageHeader
        title={member.name}
        crumbs={[
          { label: lang === "ar" ? "الأعضاء" : "Members", href: "/members" },
          { label: member.name },
        ]}
      />

      <div className="mx-auto w-full max-w-4xl px-4 md:px-6 lg:px-8 py-6 flex-1">
        {/* Profile card */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-deep text-white shadow-premium-lg p-6 mb-5">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className="h-20 w-20 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-3xl font-bold ring-4 ring-white/30">
                {member.name.charAt(0).toUpperCase()}
              </div>
              {member.membershipType === "Verified" && (
                <div className="absolute -bottom-1 -end-1 h-7 w-7 rounded-full bg-emerald-500 border-4 border-emerald-deep flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display text-xl font-bold">{member.name}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 backdrop-blur px-2 py-0.5 text-[10px] font-bold">
                  <ShieldCheck className="h-2.5 w-2.5 text-gold" />
                  {member.membershipType === "Verified"
                    ? (lang === "ar" ? "عضو موثّق" : "Verified member")
                    : (lang === "ar" ? "عضو" : "Member")}
                </span>
              </div>
              <div className="space-y-1 text-xs text-white/80">
                {member.profession && (
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-3 w-3 text-gold" />
                    <span>{member.profession}</span>
                  </div>
                )}
                {member.state && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-gold" />
                    <span>
                      {member.state[lang === "ar" ? "nameAr" : "nameEn"]}
                      {member.city && ` · ${member.city[lang === "ar" ? "nameAr" : "nameEn"]}`}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-gold" />
                  <span>{lang === "ar" ? "انضم في" : "Joined"} {joinedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {member.bio && (
          <div className="rounded-2xl bg-card border border-border shadow-premium p-5 mb-5">
            <h3 className="text-base font-bold text-foreground mb-2">{lang === "ar" ? "نبذة" : "About"}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
          </div>
        )}

        {/* Interests */}
        {interests.length > 0 && (
          <div className="rounded-2xl bg-card border border-border shadow-premium p-5 mb-5">
            <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-600" />
              {lang === "ar" ? "الاهتمامات" : "Interests"}
            </h3>
            <div className="flex flex-wrap gap-2">
              {interests.map((it, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-3 py-1.5 text-xs font-semibold text-foreground">
                  {it.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="rounded-2xl bg-card border border-border shadow-premium p-5">
          <h3 className="text-base font-bold text-foreground mb-3">{lang === "ar" ? "تواصل" : "Connect"}</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Button className="bg-emerald-700 hover:bg-emerald-deep text-white rounded-xl">
              <UserPlus className="h-4 w-4 me-1.5" />
              {lang === "ar" ? "متابعة" : "Follow"}
            </Button>
            <Button variant="outline" className="rounded-xl">
              <MessageCircle className="h-4 w-4 me-1.5" />
              {lang === "ar" ? "رسالة" : "Message"}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">
            {lang === "ar"
              ? "لحماية الخصوصية، لا يتم عرض البريد الإلكتروني أو الهاتف للعامة. استخدم زر المتابعة للتواصل عبر المنصة."
              : "For privacy, email and phone are not shown publicly. Use Follow to connect via the platform."}
          </p>
        </div>
      </div>

      <Footer />
      <AIAssistantWidget />
    </main>
  );
}
