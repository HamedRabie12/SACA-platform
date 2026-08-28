"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { AdminGuard } from "@/components/layout/admin-guard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Flag, ShieldCheck, Trash2, CheckCircle2, X, User,
  FileText, AlertCircle, RefreshCw,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type Report = {
  id: string;
  reporter: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  createdAt: string;
};

const TYPE_LABEL: Record<string, { ar: string; en: string; icon: typeof Flag }> = {
  organization: { ar: "منظمة", en: "Organization", icon: ShieldCheck },
  event: { ar: "فعالية", en: "Event", icon: Flag },
  news: { ar: "خبر", en: "News", icon: FileText },
  comment: { ar: "تعليق", en: "Comment", icon: Flag },
  user: { ar: "حساب", en: "Account", icon: User },
};

const STATUS_BADGE: Record<string, { ar: string; en: string; color: string }> = {
  Open: { ar: "مفتوح", en: "Open", color: "bg-red-50 text-red-700" },
  Reviewing: { ar: "قيد المراجعة", en: "Reviewing", color: "bg-amber-50 text-amber-700" },
  Resolved: { ar: "تم الحل", en: "Resolved", color: "bg-emerald-50 text-emerald-700" },
  Dismissed: { ar: "مرفوض", en: "Dismissed", color: "bg-secondary text-muted-foreground" },
};

export default function AdminReportsPage() {
  const { lang } = useLanguage();
  // Auth handled by AdminGuard
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => { if (alive) setLoading(true); });
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/reports?${params}`, {
          })
      .then((r) => r.json())
      .then((d) => { if (alive) setReports(d.items ?? []); })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [statusFilter]);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/reports?id=${id}&status=${status}`, {
      method: "PATCH",
          });
    setReports((arr) =>
      arr.map((r) => (r.id === id ? { ...r, status } : r))
    );
  }

  

  const counts = {
    open: reports.filter((r) => r.status === "Open").length,
    reviewing: reports.filter((r) => r.status === "Reviewing").length,
    resolved: reports.filter((r) => r.status === "Resolved").length,
    dismissed: reports.filter((r) => r.status === "Dismissed").length,
  };

  return (
    <AdminGuard>
    <div className="flex-1">
      
      <PageHeader
        title={lang === "ar" ? "البلاغات والإشراف" : "Reports & Moderation"}
        subtitle={lang === "ar" ? "مراجعة البلاغات المُقدَّمة من المستخدمين واتخاذ إجراء." : "Review user-submitted reports and take action."}
        crumbs={[
          { label: lang === "ar" ? "الإدارة" : "Admin", href: "/admin" },
          { label: lang === "ar" ? "البلاغات" : "Reports" },
        ]}
      />

      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8 py-6 flex-1">
        {/* Status filter chips */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {[
            { value: "", label: lang === "ar" ? "الكل" : "All", count: reports.length, color: "bg-secondary text-foreground" },
            { value: "Open", label: lang === "ar" ? "مفتوح" : "Open", count: counts.open, color: "bg-red-50 text-red-700" },
            { value: "Reviewing", label: lang === "ar" ? "قيد المراجعة" : "Reviewing", count: counts.reviewing, color: "bg-amber-50 text-amber-700" },
            { value: "Resolved", label: lang === "ar" ? "تم الحل" : "Resolved", count: counts.resolved, color: "bg-emerald-50 text-emerald-700" },
            { value: "Dismissed", label: lang === "ar" ? "مرفوض" : "Dismissed", count: counts.dismissed, color: "bg-secondary text-muted-foreground" },
          ].map((c) => (
            <button
              key={c.value}
              onClick={() => setStatusFilter(c.value)}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-premium ${
                statusFilter === c.value ? "bg-emerald-700 text-white" : `${c.color} hover:opacity-80`
              }`}
            >
              {c.label}
              <span className="inline-flex items-center justify-center h-4 min-w-4 rounded-full bg-white/30 px-1 text-[10px] font-bold">
                {c.count}
              </span>
            </button>
          ))}
        </div>

        {/* Reports list */}
        <div className="rounded-2xl bg-card border border-border shadow-premium overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-700 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {lang === "ar" ? "لا توجد بلاغات مطابقة." : "No matching reports."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {reports.map((r) => {
                const meta = TYPE_LABEL[r.targetType] || { ar: r.targetType, en: r.targetType, icon: Flag };
                const Icon = meta.icon;
                const badge = STATUS_BADGE[r.status] || STATUS_BADGE.Open;
                return (
                  <div key={r.id} className="px-4 py-4 hover:bg-secondary/30 transition-premium">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 flex-shrink-0">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-bold text-foreground inline-flex items-center gap-1">
                            <Icon className="h-3 w-3" />
                            {lang === "ar" ? meta.ar : meta.en}
                          </span>
                          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold ${badge.color}`}>
                            {lang === "ar" ? badge.ar : badge.en}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(r.createdAt).toLocaleString(lang === "ar" ? "ar-EG" : "en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-xs text-foreground mb-1">{r.reason}</p>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1">
                            <User className="h-2.5 w-2.5" />
                            {lang === "ar" ? "المُبلِّغ:" : "Reporter:"} <code dir="ltr" className="font-mono">{r.reporter}</code>
                          </span>
                          <span>·</span>
                          <span>{lang === "ar" ? "الهدف:" : "Target:"} <code dir="ltr" className="font-mono">{r.targetId.slice(0, 12)}…</code></span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {r.status === "Open" && (
                          <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "Reviewing")} className="rounded-lg h-7 text-[10px]">
                            <RefreshCw className="h-3 w-3 me-1" />
                            {lang === "ar" ? "مراجعة" : "Review"}
                          </Button>
                        )}
                        {(r.status === "Open" || r.status === "Reviewing") && (
                          <>
                            <Button size="sm" onClick={() => updateStatus(r.id, "Resolved")} className="rounded-lg h-7 bg-emerald-700 hover:bg-emerald-deep text-white text-[10px]">
                              <CheckCircle2 className="h-3 w-3 me-1" />
                              {lang === "ar" ? "حل" : "Resolve"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "Dismissed")} className="rounded-lg h-7 text-[10px]">
                              <X className="h-3 w-3 me-1" />
                              {lang === "ar" ? "رفض" : "Dismiss"}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      
    </div>
    </AdminGuard>
  );
}
