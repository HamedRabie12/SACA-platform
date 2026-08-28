"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { AdminGuard } from "@/components/layout/admin-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Video, Plus, Search, X, Edit3, Trash2, ShieldCheck,
  ChevronLeft, ChevronRight, ArrowLeft, ArrowRight,
  Circle, Play, Square, Users, Clock, MapPin,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type Meeting = {
  id: string;
  title: string;
  description: string;
  hostName: string;
  isLive: boolean;
  isPublic: boolean;
  viewerCount: number;
  scheduledAt: string;
  state?: { code: string; nameEn: string; nameAr: string } | null;
};

type StateLite = { code: string; nameEn: string; nameAr: string };

export default function AdminMeetingsPage() {
  const { lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  const PageArrow = lang === "ar" ? ChevronRight : ChevronLeft;
  // Auth handled by AdminGuard
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [states, setStates] = useState<StateLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ q: "", liveOnly: false });
  const [form, setForm] = useState({
    title: "", description: "", hostName: "", scheduledAt: "",
    stateCode: "", isPublic: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/community/states")
      .then((r) => r.json())
      .then((d) => setStates(d.states ?? []))
      .catch(() => {});
  }, []);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.liveOnly) params.set("liveOnly", "1");
    try {
      const res = await fetch(`/api/admin/meetings?${params}`, {
              });
      const data = await res.json();
      setMeetings(data.items ?? []);
    } catch {
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, [filter.liveOnly]);

  useEffect(() => {
    const t = setTimeout(fetchMeetings, 200);
    return () => clearTimeout(t);
  }, [fetchMeetings]);

  const filtered = filter.q
    ? meetings.filter((m) =>
        m.title.toLowerCase().includes(filter.q.toLowerCase()) ||
        (m.description ?? "").toLowerCase().includes(filter.q.toLowerCase()) ||
        (m.hostName ?? "").toLowerCase().includes(filter.q.toLowerCase())
      )
    : meetings;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormMsg(null);
    try {
      const res = await fetch("/api/admin/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
                  },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormMsg(`❌ ${data.error || "Failed"}`);
        return;
      }
      setShowForm(false);
      setFormMsg(`✅ ${lang === "ar" ? "تم إنشاء الاجتماع." : "Meeting created."}`);
      setForm({ title: "", description: "", hostName: "", scheduledAt: "", stateCode: "", isPublic: true });
      setTimeout(() => setFormMsg(null), 3000);
      fetchMeetings();
    } catch (err) {
      setFormMsg(`❌ ${(err as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleLive(id: string, currentLive: boolean) {
    const res = await fetch(`/api/admin/meetings/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
              },
      body: JSON.stringify({ isLive: !currentLive }),
    });
    if (res.ok) {
      setMeetings((arr) =>
        arr.map((m) => (m.id === id ? { ...m, isLive: !currentLive } : m))
      );
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(lang === "ar" ? "تأكيد حذف الاجتماع؟" : "Confirm delete?")) return;
    await fetch(`/api/admin/meetings/${id}`, {
      method: "DELETE",
          });
    setMeetings((arr) => arr.filter((m) => m.id !== id));
  }

  

  return (
    <AdminGuard>
    <div className="flex-1">
      
      <PageHeader
        title={lang === "ar" ? "إدارة الاجتماعات" : "Manage meetings"}
        subtitle={lang === "ar" ? `${meetings.filter((m) => m.isLive).length} مباشر، ${meetings.length} إجمالي` : `${meetings.filter((m) => m.isLive).length} live, ${meetings.length} total`}
        crumbs={[
          { label: lang === "ar" ? "الإدارة" : "Admin", href: "/admin" },
          { label: lang === "ar" ? "الاجتماعات" : "Meetings" },
        ]}
      />

      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8 py-6 flex-1">
        {/* Toolbar */}
        <div className="rounded-2xl bg-card border border-border shadow-premium p-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={lang === "ar" ? "ابحث عن اجتماع…" : "Search meetings…"}
                value={filter.q}
                onChange={(e) => setFilter((f) => ({ ...f, q: e.target.value }))}
                className="ps-9 rounded-xl"
              />
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filter.liveOnly}
                onChange={(e) => setFilter((f) => ({ ...f, liveOnly: e.target.checked }))}
                className="h-4 w-4 rounded border-border text-emerald-700 focus:ring-emerald-700"
              />
              <span className="text-sm inline-flex items-center gap-1">
                <Circle className="h-2 w-2 fill-red-500 text-red-500" />
                {lang === "ar" ? "المباشر فقط" : "Live only"}
              </span>
            </label>
            <Button onClick={() => setShowForm(true)} className="bg-emerald-700 hover:bg-emerald-deep text-white rounded-xl">
              <Plus className="h-4 w-4 me-1.5" />
              {lang === "ar" ? "جدولة اجتماع" : "Schedule meeting"}
            </Button>
          </div>
          {formMsg && (
            <div className="mt-3 rounded-lg bg-secondary/40 border px-3 py-2 text-xs font-medium">
              {formMsg}
            </div>
          )}
        </div>

        {/* Meetings list */}
        <div className="rounded-2xl bg-card border border-border shadow-premium overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <Video className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{lang === "ar" ? "لا توجد اجتماعات." : "No meetings."}</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {filtered.map((m) => {
                const d = new Date(m.scheduledAt);
                return (
                  <div key={m.id} className="px-4 py-3 flex items-center gap-3 hover:bg-secondary/30 transition-premium">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 ${
                      m.isLive ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
                    }`}>
                      {m.isLive ? <Circle className="h-4 w-4 fill-red-500 text-red-500 live-dot" /> : <Video className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-sm font-bold text-foreground truncate">{m.title}</div>
                        {m.isLive ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-red-50 text-red-600 px-1.5 py-0.5 text-[10px] font-bold">
                            <Circle className="h-2 w-2 fill-red-500 live-dot" />
                            {lang === "ar" ? "مباشر" : "LIVE"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-emerald-50 text-emerald-700 px-1.5 py-0.5 text-[10px] font-bold">
                            <Clock className="h-2.5 w-2.5" />
                            {d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { day: "numeric", month: "short" })} · {d.toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                        {m.viewerCount > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                            <Users className="h-2.5 w-2.5" />
                            {m.viewerCount}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">
                        {m.hostName}
                        {m.state && ` · ${m.state[lang === "ar" ? "nameAr" : "nameEn"]}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleLive(m.id, m.isLive)}
                        className={`h-8 px-2 rounded-lg text-[10px] ${
                          m.isLive
                            ? "border-red-300 text-red-600 hover:bg-red-50"
                            : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {m.isLive ? (
                          <><Square className="h-3 w-3 me-1" />{lang === "ar" ? "إيقاف" : "End"}</>
                        ) : (
                          <><Play className="h-3 w-3 me-1" />{lang === "ar" ? "ابدأ مباشر" : "Go live"}</>
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Edit3 className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)} className="h-8 w-8 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      

      {/* Schedule meeting drawer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full md:max-w-xl bg-card rounded-t-3xl md:rounded-3xl shadow-premium-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 px-5 py-3.5 bg-emerald-700 text-white flex items-center justify-between z-10">
              <h3 className="font-bold">{lang === "ar" ? "جدولة اجتماع جديد" : "Schedule new meeting"}</h3>
              <button onClick={() => setShowForm(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/15">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "عنوان الاجتماع *" : "Meeting title *"}</label>
                <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="rounded-xl" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "الوصف *" : "Description *"}</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-none" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "المضيف *" : "Host *"}</label>
                  <Input value={form.hostName} onChange={(e) => setForm((f) => ({ ...f, hostName: e.target.value }))} className="rounded-xl" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "التاريخ والوقت *" : "Date & time *"}</label>
                  <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))} className="rounded-xl" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "الولاية" : "State"}</label>
                  <select value={form.stateCode} onChange={(e) => setForm((f) => ({ ...f, stateCode: e.target.value }))} className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                    <option value="">{lang === "ar" ? "اختر الولاية…" : "Select state…"}</option>
                    {states.map((s) => (
                      <option key={s.code} value={s.code}>{lang === "ar" ? s.nameAr : s.nameEn} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div className="rounded-xl border border-border bg-secondary/20 px-4 py-3">
                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))} className="h-4 w-4 rounded border-border" />
                    {lang === "ar" ? "اجتماع عام" : "Public meeting"}
                  </label>
                  <p className="mt-1 text-[11px] text-muted-foreground">{lang === "ar" ? "صلاحية الدخول الفعلية يحددها نظام الاجتماع." : "Actual join permissions are enforced by the meeting service."}</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">{lang === "ar" ? "إلغاء" : "Cancel"}</Button>
                <Button type="submit" disabled={submitting} className="bg-emerald-700 hover:bg-emerald-deep text-white rounded-xl">
                  {submitting ? (lang === "ar" ? "جارٍ الحفظ…" : "Saving…") : (
                    <><Plus className="h-4 w-4 me-1.5" />{lang === "ar" ? "جدولة" : "Schedule"}</>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </AdminGuard>
  );
}
