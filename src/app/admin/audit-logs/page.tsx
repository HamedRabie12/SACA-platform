"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { AdminGuard } from "@/components/layout/admin-guard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  FileText, Search, ShieldCheck, User, LogIn, KeyRound, Trash2,
  Edit3, Plus, Activity, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type AuditLog = {
  id: string;
  actor: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
};

const ACTION_ICON: Record<string, { icon: typeof User; color: string; ar: string; en: string }> = {
  "register-otp-request": { icon: KeyRound, color: "text-amber-600", ar: "طلب OTP", en: "OTP request" },
  "register-otp-failed": { icon: ShieldCheck, color: "text-red-600", ar: "OTP خاطئ", en: "OTP failed" },
  "register-otp-consumed": { icon: ShieldCheck, color: "text-emerald-600", ar: "تحقق ناجح", en: "Verified" },
  "onboarding-completed": { icon: User, color: "text-emerald-600", ar: "إكمال الـ onboarding", en: "Onboarding completed" },
  "member-created": { icon: User, color: "text-emerald-600", ar: "إنشاء عضو", en: "Member created" },
  "organization-added": { icon: Plus, color: "text-emerald-600", ar: "إضافة منظمة", en: "Organization added" },
  "organization-updated": { icon: Edit3, color: "text-blue-600", ar: "تعديل منظمة", en: "Organization updated" },
  "organization-deleted": { icon: Trash2, color: "text-red-600", ar: "حذف منظمة", en: "Organization deleted" },
};

export default function AdminAuditLogsPage() {
  const { lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  const PageArrow = lang === "ar" ? ChevronRight : ChevronLeft;
    const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ q: "", action: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", "30");
    if (filter.action) params.set("action", filter.action);
    try {
      const res = await fetch(`/api/community/audit?${params}`);
      const data = await res.json();
      setLogs(data.items ?? []);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, filter.action]);

  useEffect(() => {
    const t = setTimeout(fetchLogs, 200);
    return () => clearTimeout(t);
  }, [fetchLogs]);

  

  // Filter client-side by q (since API doesn't support q yet)
  const filtered = filter.q
    ? logs.filter((l) =>
        l.actor.toLowerCase().includes(filter.q.toLowerCase()) ||
        l.action.toLowerCase().includes(filter.q.toLowerCase()) ||
        (l.details ?? "").toLowerCase().includes(filter.q.toLowerCase())
      )
    : logs;

  return (
    <AdminGuard>
    <div className="flex-1">
      
      <PageHeader
        title={lang === "ar" ? "سجلات التدقيق" : "Audit Logs"}
        subtitle={lang === "ar" ? "كل الإجراءات الحساسة مسجَّلة: التسجيل، التحقق، إضافة/تعديل المنظمات، الأخبار، الفعاليات." : "All sensitive actions are logged: registration, verification, organization add/edit, news, events."}
        crumbs={[
          { label: lang === "ar" ? "الإدارة" : "Admin", href: "/admin" },
          { label: lang === "ar" ? "سجلات التدقيق" : "Audit logs" },
        ]}
      />

      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8 py-6 flex-1">
        {/* Filters */}
        <div className="rounded-2xl bg-card border border-border shadow-premium p-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={lang === "ar" ? "ابحث في السجلات…" : "Search logs…"}
                value={filter.q}
                onChange={(e) => setFilter((f) => ({ ...f, q: e.target.value }))}
                className="ps-9 rounded-xl"
              />
            </div>
            <select
              value={filter.action}
              onChange={(e) => { setFilter((f) => ({ ...f, action: e.target.value })); setPage(1); }}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm font-medium"
            >
              <option value="">{lang === "ar" ? "كل الإجراءات" : "All actions"}</option>
              <option value="register-otp">{lang === "ar" ? "تسجيل/تحقق" : "Registration/OTP"}</option>
              <option value="onboarding">{lang === "ar" ? "إكمال الملف" : "Onboarding"}</option>
              <option value="organization">{lang === "ar" ? "منظمات" : "Organizations"}</option>
            </select>
          </div>
        </div>

        {/* Logs table */}
        <div className="rounded-2xl bg-card border border-border shadow-premium overflow-hidden">
          <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-700" />
              {filtered.length} {lang === "ar" ? "سجل" : "entries"}
            </h2>
          </div>
          {loading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{lang === "ar" ? "لا توجد سجلات مطابقة." : "No matching logs."}</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {filtered.map((l) => {
                const meta = ACTION_ICON[l.action] || { icon: Activity, color: "text-muted-foreground", ar: l.action, en: l.action };
                const Icon = meta.icon;
                const time = new Date(l.createdAt).toLocaleString(lang === "ar" ? "ar-EG" : "en-US", {
                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                });
                return (
                  <div key={l.id} className="px-4 py-3 hover:bg-secondary/30 transition-premium">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-secondary flex-shrink-0 ${meta.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-xs font-bold text-foreground">{lang === "ar" ? meta.ar : meta.en}</span>
                          <code className="text-[10px] text-muted-foreground font-mono">{l.action}</code>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          <span className="font-medium">{lang === "ar" ? "الفاعل:" : "Actor:"}</span> <code dir="ltr" className="text-emerald-700 font-mono">{l.actor}</code>
                          {l.entityId && (
                            <>
                              <span className="mx-1.5">·</span>
                              <span>{lang === "ar" ? "الكيان:" : "Entity:"} <code className="font-mono text-[10px]">{l.entity}</code></span>
                            </>
                          )}
                        </div>
                        {l.details && (
                          <details className="mt-1">
                            <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground">{lang === "ar" ? "التفاصيل" : "Details"}</summary>
                            <pre className="mt-1 text-[10px] text-muted-foreground bg-secondary/40 p-2 rounded-lg overflow-x-auto" dir="ltr">
                              {l.details}
                            </pre>
                          </details>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-muted-foreground">
              {lang === "ar" ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl"
              >
                <PageArrow className="h-3.5 w-3.5" />
                {lang === "ar" ? "السابق" : "Prev"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-xl"
              >
                {lang === "ar" ? "التالي" : "Next"}
                <Arrow className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      
    </div>
    </AdminGuard>
  );
}
