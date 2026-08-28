"use client";

import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/layout/admin-header";
import { AdminGuard } from "@/components/layout/admin-guard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2, Calendar, Newspaper, Video, Users, Bell, Activity,
  MapPin, ShieldCheck, KeyRound, CheckCircle2, Clock,
  Upload, FileText, ArrowLeft,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type AdminData = {
  stats: { members: number; organizations: number; eventsThisWeek: number; liveMeetings: number };
  sections: Array<{ key: string; title: string; sortOrder: number }>;
  settings: Record<string, string>;
};

const ADMIN_NAV = [
  { key: "dashboard", ar: "لوحة القيادة", en: "Dashboard", icon: Activity, href: "/admin" },
  { key: "members", ar: "الأعضاء", en: "Members", icon: Users, href: "/admin/members" },
  { key: "organizations", ar: "المنظمات", en: "Organizations", icon: Building2, href: "/admin/organizations" },
  { key: "events", ar: "الفعاليات", en: "Events", icon: Calendar, href: "/admin/events" },
  { key: "meetings", ar: "الاجتماعات", en: "Meetings", icon: Video, href: "/admin/meetings" },
  { key: "news", ar: "الأخبار", en: "News", icon: Newspaper, href: "/admin/news" },
  { key: "media", ar: "المكتبة الرقمية", en: "Media Library", icon: FileText, href: "/admin/media" },
  { key: "notifications", ar: "الإشعارات", en: "Notifications", icon: Bell, href: "/admin/notifications" },
  { key: "map", ar: "الخريطة الجغرافية", en: "Geographic Intelligence", icon: MapPin, href: "/admin/geographic" },
  { key: "verification", ar: "قائمة التحقق", en: "Verification queue", icon: ShieldCheck, href: "/admin/organizations?verification=PendingVerification" },
  { key: "reports", ar: "البلاغات", en: "Reports & Moderation", icon: FileText, href: "/admin/reports" },
  { key: "import", ar: "استيراد البيانات", en: "Import data", icon: Upload, href: "/admin/import" },
  { key: "monitoring", ar: "مراقبة النظام", en: "System Monitoring", icon: Activity, href: "/admin/monitoring" },
  { key: "audit", ar: "سجلات التدقيق", en: "Audit Logs", icon: FileText, href: "/admin/audit-logs" },
  { key: "settings", ar: "إعدادات المنصة", en: "Settings", icon: KeyRound, href: "/admin/settings" },
];

export default function AdminPage() {
  const { lang } = useLanguage();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [activity, setActivity] = useState<Array<{id:string;action:string;entity:string;createdAt:string}>>([]);

  useEffect(() => {
    let alive = true;
    fetch("/api/community/home")
      .then((r) => r.json())
      .then((d) => { if (alive) setData(d); })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  return (
    <AdminGuard>
      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8 py-6 flex-1">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {lang === "ar" ? "مركز قيادة الإدارة" : "Admin Command Center"}
          </h1>
          <p className="text-sm text-gray-500">
            {lang === "ar"
              ? "لوحة قيادة موحدة لإدارة الأعضاء والمنظمات والفعاليات والتحقق والمحتوى."
              : "Unified dashboard for managing members, organizations, events, verification, and content."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Nav */}
          <aside className="lg:col-span-3">
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-2 sticky top-20">
              <div className="px-3 py-2 mb-1">
                <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                  {lang === "ar" ? "الأقسام" : "Sections"}
                </div>
              </div>
              <div className="space-y-0.5 max-h-[600px] overflow-y-auto">
                {ADMIN_NAV.map((n) => (
                  <a key={n.key} href={n.href} onClick={() => setActiveNav(n.key)}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-start ${
                      activeNav === n.key ? "bg-[#047857] text-white shadow-sm" : "text-gray-700 hover:bg-gray-50"
                    }`}>
                    <n.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{lang === "ar" ? n.ar : n.en}</span>
                  </a>
                ))}
              </div>
            </div>
          </aside>

          {/* Main */}
          <section className="lg:col-span-9 space-y-5">
            {loading ? (
              <>
                <Skeleton className="h-40 w-full rounded-2xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
              </>
            ) : (
              <>
                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: Users, label: lang === "ar" ? "الأعضاء" : "Members", value: data?.stats.members ?? 0, color: "from-[#047857] to-[#064e3b]" },
                    { icon: Building2, label: lang === "ar" ? "المنظمات الموثقة" : "Verified orgs", value: data?.stats.organizations ?? 0, color: "from-[#C5A065] to-[#9D7B3D]" },
                    { icon: Calendar, label: lang === "ar" ? "فعاليات الأسبوع" : "Events this week", value: data?.stats.eventsThisWeek ?? 0, color: "from-teal-600 to-[#047857]" },
                    { icon: Video, label: lang === "ar" ? "اجتماعات مباشرة" : "Live meetings", value: data?.stats.liveMeetings ?? 0, color: "from-red-600 to-red-800" },
                  ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <div key={i} className={`rounded-2xl bg-gradient-to-br ${s.color} text-white p-4 shadow-sm`}>
                        <Icon className="h-5 w-5 mb-2 opacity-80" />
                        <div className="text-2xl md:text-3xl font-bold tabular-nums">{s.value}</div>
                        <div className="text-[10px] uppercase tracking-wider opacity-80">{s.label}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick actions */}
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[#047857]" />
                    {lang === "ar" ? "إجراءات سريعة" : "Quick actions"}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { ar: "إضافة منظمة", en: "Add organization", icon: Building2 },
                      { ar: "إنشاء فعالية", en: "Create event", icon: Calendar },
                      { ar: "نشر خبر", en: "Publish news", icon: Newspaper },
                      { ar: "جدولة اجتماع", en: "Schedule meeting", icon: Video },
                    ].map((a, i) => (
                      <a key={i} href={["/admin/organizations", "/admin/events", "/admin/news", "/admin/meetings"][i]}
                        className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 hover:bg-emerald-50 p-3 transition-colors text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#047857] text-white">
                          <a.icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-semibold text-gray-700">{lang === "ar" ? a.ar : a.en}</span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Homepage sections config */}
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[#047857]" />
                    {lang === "ar" ? "أقسام الصفحة الرئيسية" : "Homepage sections"}
                  </h3>
                  <div className="space-y-2">
                    {data?.sections.map((s) => (
                      <div key={s.key} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-[#047857] bg-emerald-50 rounded-md px-1.5 py-0.5">#{s.sortOrder}</span>
                          <span className="text-sm text-gray-700">{s.title}</span>
                          <code className="text-[10px] text-gray-400 font-mono">{s.key}</code>
                        </div>
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 text-[#047857] px-2 py-0.5 text-[10px] font-bold">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          {lang === "ar" ? "مفعّل" : "Enabled"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent activity */}
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#047857]" />
                    {lang === "ar" ? "آخر النشاطات" : "Recent activity"}
                  </h3>
                  <div className="space-y-2 text-xs">
                    {activity.map((a) => (
                      <div key={a.id} className="flex items-center gap-2 text-gray-500 border-b border-gray-50 pb-2 last:border-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#047857]" />
                        <span className="flex-1">{a.action} · {a.entity}</span>
                        <span className="text-[10px]">{new Date(a.createdAt).toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}</span>
                      </div>
                    ))}
                    {activity.length === 0 && <div className="text-sm text-gray-400">{lang === "ar" ? "لا توجد نشاطات مسجلة." : "No recorded activity."}</div>}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </AdminGuard>
  );
}
