"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { AdminGuard } from "@/components/layout/admin-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Settings as SettingsIcon, ShieldCheck, Save, GripVertical,
  Eye, EyeOff, Plus, RefreshCw, AlertCircle, Database,
  Trash2, Bot, KeyRound, Globe2, Layout, Activity, Download,
  CheckCircle2, X, Zap,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type Section = { key: string; title: string; isEnabled: boolean; sortOrder: number };
type Setting = { key: string; value: string };
type TableStat = { name: string; label: string; count: number };

export default function AdminSettingsPage() {
  const { lang } = useLanguage();
  // Auth handled by AdminGuard
  const [sections, setSections] = useState<Section[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [tableStats, setTableStats] = useState<TableStat[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"identity" | "sections" | "data" | "features">("identity");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [homeRes, settingsRes, dataRes] = await Promise.all([
        fetch("/api/community/home"),
        fetch("/api/admin/settings", { headers: {} }),
        fetch("/api/admin/data", { headers: {} }),
      ]);
      const [homeData, settingsData, dataData] = await Promise.all([
        homeRes.json(),
        settingsRes.json(),
        dataRes.json(),
      ]);
      setSections(homeData.sections ?? []);
      setSettings(
        Object.entries(homeData.settings ?? {}).map(([key, value]) => ({ key, value: String(value) }))
      );
      setTableStats(dataData.tables ?? []);
      setTotalRecords(dataData.totalRecords ?? 0);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  function moveSection(idx: number, dir: -1 | 1) {
    setSections((arr) => {
      const next = [...arr];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return arr;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next.map((s, i) => ({ ...s, sortOrder: i + 1 }));
    });
  }

  function toggleSection(key: string) {
    setSections((arr) =>
      arr.map((s) => (s.key === key ? { ...s, isEnabled: !s.isEnabled } : s))
    );
  }

  function updateSetting(key: string, value: string) {
    setSettings((arr) => arr.map((s) => (s.key === key ? { ...s, value } : s)));
  }

  async function handleSave() {
    setSaving(true);
    setSavedMsg(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: settings.map((s) => ({ key: s.key, value: s.value })),
          sections: sections.map((s, i) => ({ key: s.key, isEnabled: s.isEnabled, sortOrder: i + 1, title: s.title })),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setSavedMsg(lang === "ar" ? "✅ تم حفظ التغييرات في قاعدة البيانات." : "✅ Changes saved to database.");
      setTimeout(() => setSavedMsg(null), 3000);
    } catch {
      setSavedMsg(lang === "ar" ? "❌ فشل الحفظ" : "❌ Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleClearTable(tableName: string, label: string) {
    if (!confirm(lang === "ar" ? `تأكيد حذف جميع بيانات: ${label}؟` : `Confirm clear: ${label}?`)) return;
    setActionLoading(tableName);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear-table", table: tableName }),
      });
      if (res.ok) {
        setSavedMsg(`✅ ${lang === "ar" ? "تم حذف البيانات." : "Data cleared."}`);
        setTimeout(() => setSavedMsg(null), 3000);
        fetchAll();
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRebuildAI() {
    if (!confirm(lang === "ar" ? "إعادة بناء قاعدة المعرفة للذكاء الاصطناعي؟" : "Rebuild AI knowledge base?")) return;
    setActionLoading("ai");
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rebuild-ai-knowledge" }),
      });
      const data = await res.json();
      if (res.ok) {
        setSavedMsg(`✅ ${lang === "ar" ? "تم إعادة بناء" : "Rebuilt"} ${data.count} ${lang === "ar" ? "وثيقة معرفية." : "knowledge docs."}`);
        setTimeout(() => setSavedMsg(null), 4000);
        fetchAll();
      }
    } finally {
      setActionLoading(null);
    }
  }

  

  const TABS = [
    { key: "identity" as const, ar: "هوية المنصة", en: "Site Identity", icon: Globe2 },
    { key: "sections" as const, ar: "أقسام الصفحة", en: "Homepage Sections", icon: Layout },
    { key: "data" as const, ar: "إدارة البيانات", en: "Data Management", icon: Database },
    { key: "features" as const, ar: "وحدات مستقبلية", en: "Future Modules", icon: Zap },
  ];

  return (
    <AdminGuard>
    <div className="flex-1">
      
      <PageHeader
        title={lang === "ar" ? "إعدادات المنصة" : "Platform Settings"}
        subtitle={lang === "ar" ? "تحكم كامل في هوية المنصة، الأقسام، قاعدة البيانات، والميزات." : "Full control of platform identity, sections, database, and features."}
        crumbs={[
          { label: lang === "ar" ? "الإدارة" : "Admin", href: "/admin" },
          { label: lang === "ar" ? "الإعدادات" : "Settings" },
        ]}
      />

      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8 py-6 flex-1">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        ) : (
          <>
            {/* Tab bar */}
            <div className="flex items-center gap-1 mb-5 overflow-x-auto no-scrollbar bg-card border border-border rounded-2xl p-1.5 shadow-premium">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-premium whitespace-nowrap ${
                      activeTab === tab.key
                        ? "bg-emerald-700 text-white shadow-premium"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {lang === "ar" ? tab.ar : tab.en}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            {activeTab === "identity" && (
              <div className="rounded-2xl bg-card border border-border shadow-premium p-5 md:p-6">
                <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-emerald-700" />
                  {lang === "ar" ? "هوية المنصة" : "Site identity"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {settings.map((s) => (
                    <div key={s.key}>
                      <label className="text-xs font-semibold text-foreground mb-1 block font-mono">{s.key}</label>
                      <Input
                        value={s.value}
                        onChange={(e) => updateSetting(s.key, e.target.value)}
                        className="rounded-xl text-sm"
                        dir={s.key.endsWith("_en") ? "ltr" : "rtl"}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "sections" && (
              <div className="rounded-2xl bg-card border border-border shadow-premium p-5 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Layout className="h-4 w-4 text-emerald-700" />
                    {lang === "ar" ? "أقسام الصفحة الرئيسية" : "Homepage sections"}
                  </h3>
                  <span className="text-[10px] text-muted-foreground">{sections.filter((s) => s.isEnabled).length}/{sections.length} {lang === "ar" ? "مفعّل" : "active"}</span>
                </div>
                <div className="space-y-2">
                  {sections.map((s, idx) => (
                    <div key={s.key} className={`flex items-center gap-2 rounded-xl border p-3 transition-premium ${s.isEnabled ? "border-border bg-card" : "border-border/40 bg-secondary/30 opacity-70"}`}>
                      <GripVertical className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold flex-shrink-0">#{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-foreground truncate">{s.title}</div>
                        <code className="text-[10px] text-muted-foreground font-mono">{s.key}</code>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => moveSection(idx, -1)} disabled={idx === 0} className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-secondary disabled:opacity-30 text-muted-foreground text-sm">↑</button>
                        <button onClick={() => moveSection(idx, 1)} disabled={idx === sections.length - 1} className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-secondary disabled:opacity-30 text-muted-foreground text-sm">↓</button>
                        <button onClick={() => toggleSection(s.key)} className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${s.isEnabled ? "text-emerald-700 hover:bg-emerald-50" : "text-muted-foreground hover:bg-secondary"}`}>
                          {s.isEnabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "data" && (
              <div className="space-y-5">
                {/* DB stats */}
                <div className="rounded-2xl bg-card border border-border shadow-premium p-5 md:p-6">
                  <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                    <Database className="h-4 w-4 text-emerald-700" />
                    {lang === "ar" ? "إحصائيات قاعدة البيانات" : "Database statistics"}
                  </h3>
                  <div className="mb-4 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-deep text-white p-4">
                    <div className="text-[10px] uppercase tracking-wider opacity-80">{lang === "ar" ? "إجمالي السجلات" : "Total records"}</div>
                    <div className="text-3xl font-bold tabular-nums">{totalRecords.toLocaleString()}</div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {tableStats.map((t) => (
                      <div key={t.name} className="rounded-xl border border-border/60 p-3 hover:shadow-premium transition-premium">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{lang === "ar" ? t.label : t.name}</div>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-foreground tabular-nums">{t.count}</span>
                          {t.count > 0 && ["notifications", "reports", "auditLogs", "mediaItems", "albums", "events", "news", "meetings"].includes(t.name) && (
                            <button
                              onClick={() => handleClearTable(t.name, lang === "ar" ? t.label : t.name)}
                              disabled={actionLoading === t.name}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                              title={lang === "ar" ? "حذف الكل" : "Clear all"}
                            >
                              {actionLoading === t.name ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI knowledge rebuild */}
                <div className="rounded-2xl bg-card border border-border shadow-premium p-5 md:p-6">
                  <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                    <Bot className="h-4 w-4 text-emerald-700" />
                    {lang === "ar" ? "قاعدة معرفة الذكاء الاصطناعي" : "AI Knowledge Base"}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    {lang === "ar"
                      ? "إعادة بناء قاعدة المعرفة من جميع المنظمات والفعاليات والأخبار المنشورة. يستخدمها المساعد الذكي للإجابة على أسئلة المستخدمين."
                      : "Rebuild knowledge base from all organizations, events, and published news. Used by the smart assistant."}
                  </p>
                  <Button
                    onClick={handleRebuildAI}
                    disabled={actionLoading === "ai"}
                    className="bg-emerald-700 hover:bg-emerald-deep text-white rounded-xl"
                  >
                    {actionLoading === "ai" ? (
                      <span className="inline-flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" /> {lang === "ar" ? "جارٍ البناء…" : "Building…"}</span>
                    ) : (
                      <><Zap className="h-4 w-4 me-1.5" />{lang === "ar" ? "إعادة بناء المعرفة" : "Rebuild knowledge"}</>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "features" && (
              <div className="rounded-2xl bg-card border border-border shadow-premium p-5 md:p-6">
                <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-700" />
                  {lang === "ar" ? "وحدات مستقبلية" : "Future modules"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { ar: "الإعلانات المستقبلية", en: "Future Ads", desc_ar: "محتوى مدفوع مميّز", desc_en: "Paid featured content" },
                    { ar: "قائمة الأعمال", en: "Business Listings", desc_ar: "دليل أعمال الجالية", desc_en: "Community business directory" },
                    { ar: "فعاليات مميّزة", en: "Featured Events", desc_ar: "فعاليات بارزة مدفوعة", desc_en: "Paid featured events" },
                  ].map((m, i) => (
                    <label key={i} className="flex items-start gap-2 rounded-xl border border-border/60 p-3 cursor-pointer hover:bg-secondary/30">
                      <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-border text-emerald-700 focus:ring-emerald-700" />
                      <div className="flex-1">
                        <div className="text-xs font-bold text-foreground">{lang === "ar" ? m.ar : m.en}</div>
                        <div className="text-[10px] text-muted-foreground">{lang === "ar" ? m.desc_ar : m.desc_en}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <span>{lang === "ar" ? "الوحدات المستقبلية ستُميَّز بوضوح كمحتوى مدفوع عند تفعيلها." : "Future modules will be clearly marked as paid content when enabled."}</span>
                </div>
              </div>
            )}

            {/* Sticky save bar */}
            {(activeTab === "identity" || activeTab === "sections") && (
              <div className="sticky bottom-4 mt-5">
                <div className="rounded-2xl bg-card border border-border shadow-premium-lg p-4 flex items-center justify-between gap-4">
                  {savedMsg ? (
                    <div className="inline-flex items-center gap-2 text-xs font-semibold">
                      {savedMsg.startsWith("✅") ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" /> : <AlertCircle className="h-3.5 w-3.5 text-red-600" />}
                      {savedMsg}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground hidden md:block">
                      {lang === "ar" ? "التغييرات تُحفظ في قاعدة البيانات." : "Changes are saved to the database."}
                    </span>
                  )}
                  <Button onClick={handleSave} disabled={saving} className="bg-emerald-700 hover:bg-emerald-deep text-white rounded-xl">
                    {saving ? (
                      <span className="inline-flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" />{lang === "ar" ? "جارٍ الحفظ…" : "Saving…"}</span>
                    ) : (
                      <><Save className="h-4 w-4 me-1.5" />{lang === "ar" ? "حفظ التغييرات" : "Save changes"}</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      
    </div>
    </AdminGuard>
  );
}
