"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminGuard } from "@/components/layout/admin-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell, Plus, Search, X, Trash2,
  Check, CheckCheck, Clock, AlertTriangle, Info,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type Notification = {
  id: string; type: string; title: string; body: string; priority: string;
  actionLabel: string | null; actionUrl: string | null; isRead: boolean; createdAt: string;
};

const PRIORITY_STYLE: Record<string, { color: string; icon: typeof Info }> = {
  Normal: { color: "bg-emerald-50 text-emerald-700", icon: Info },
  Important: { color: "bg-amber-50 text-amber-700", icon: AlertTriangle },
  Urgent: { color: "bg-orange-50 text-orange-700", icon: AlertTriangle },
  Critical: { color: "bg-red-50 text-red-700", icon: AlertTriangle },
};

const TYPE_LABEL: Record<string, { ar: string; en: string }> = {
  meeting: { ar: "اجتماع", en: "Meeting" }, event: { ar: "فعالية", en: "Event" },
  news: { ar: "خبر", en: "News" }, organization: { ar: "منظمة", en: "Organization" },
  system: { ar: "نظام", en: "System" }, announcement: { ar: "إعلان", en: "Announcement" }, follow: { ar: "متابعة", en: "Follow" },
};

export default function AdminNotificationsPage() {
  const { lang } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ type: "", unreadOnly: false });
  const [unreadCount, setUnreadCount] = useState(0);
  const [form, setForm] = useState({ type: "system", title: "", body: "", priority: "Normal", actionLabel: "", actionUrl: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState<string | null>(null);

  const fetchNotifs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.type) params.set("type", filter.type);
    if (filter.unreadOnly) params.set("unreadOnly", "1");
    try {
      const res = await fetch(`/api/community/notifications?${params}`);
      const data = await res.json();
      setNotifications(data.items ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch { setNotifications([]); } finally { setLoading(false); }
  }, [filter.type, filter.unreadOnly]);

  useEffect(() => { const t = setTimeout(fetchNotifs, 200); return () => clearTimeout(t); }, [fetchNotifs]);

  async function handleMarkAllRead() {
    await Promise.all(notifications.filter((n) => !n.isRead).map((n) =>
      fetch(`/api/community/notifications/${n.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isRead: true }) })
    ));
    setNotifications((arr) => arr.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }

  async function handleMarkRead(id: string, isRead: boolean) {
    await fetch(`/api/community/notifications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isRead }) });
    setNotifications((arr) => arr.map((n) => (n.id === id ? { ...n, isRead } : n)));
    setUnreadCount((c) => Math.max(0, c + (isRead ? -1 : 1)));
  }

  async function handleDelete(id: string) {
    await fetch(`/api/community/notifications/${id}`, { method: "DELETE", headers: {} });
    setNotifications((arr) => arr.filter((n) => n.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true); setFormMsg(null);
    try {
      const res = await fetch("/api/community/notifications", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, actionLabel: form.actionLabel || null, actionUrl: form.actionUrl || null }) });
      if (!res.ok) { const data = await res.json(); setFormMsg(`❌ ${data.error}`); return; }
      setShowForm(false); setFormMsg(`✅ ${lang === "ar" ? "تم إرسال الإشعار." : "Sent."}`);
      setForm({ type: "system", title: "", body: "", priority: "Normal", actionLabel: "", actionUrl: "" });
      setTimeout(() => setFormMsg(null), 3000); fetchNotifs();
    } catch { setFormMsg("❌ Error"); } finally { setSubmitting(false); }
  }

  return (
    <AdminGuard>
      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8 py-6 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{lang === "ar" ? "إدارة الإشعارات" : "Manage notifications"}</h1>
          <p className="text-sm text-gray-500">{unreadCount} {lang === "ar" ? "إشعار غير مقروء،" : "unread,"} {notifications.length} {lang === "ar" ? "إجمالي" : "total"}</p>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <select value={filter.type} onChange={(e) => setFilter((f) => ({ ...f, type: e.target.value }))} className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium">
              <option value="">{lang === "ar" ? "كل الأنواع" : "All types"}</option>
              {Object.entries(TYPE_LABEL).map(([k, v]) => (<option key={k} value={k}>{lang === "ar" ? v.ar : v.en}</option>))}
            </select>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={filter.unreadOnly} onChange={(e) => setFilter((f) => ({ ...f, unreadOnly: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-[#047857] focus:ring-[#047857]" />
              <span className="text-sm">{lang === "ar" ? "غير المقروء فقط" : "Unread only"}</span>
              {unreadCount > 0 && (<span className="inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold h-4 min-w-4 px-1">{unreadCount}</span>)}
            </label>
            <div className="flex-1" />
            <Button variant="outline" onClick={handleMarkAllRead} disabled={unreadCount === 0} className="rounded-xl border-gray-200">
              <CheckCheck className="h-4 w-4 me-1.5" />{lang === "ar" ? "تعليم الكل كمقروء" : "Mark all as read"}
            </Button>
            <Button onClick={() => setShowForm(true)} className="bg-[#047857] hover:bg-[#065f46] text-white rounded-xl">
              <Plus className="h-4 w-4 me-1.5" />{lang === "ar" ? "إنشاء إشعار" : "Create"}
            </Button>
          </div>
          {formMsg && (<div className="mt-3 rounded-lg bg-gray-50 border px-3 py-2 text-xs font-medium">{formMsg}</div>)}
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center"><Bell className="h-10 w-10 text-gray-300 mx-auto mb-2" /><p className="text-sm text-gray-500">{lang === "ar" ? "لا توجد إشعارات." : "No notifications."}</p></div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map((n) => {
                const meta = PRIORITY_STYLE[n.priority] || PRIORITY_STYLE.Normal;
                const Icon = meta.icon;
                const typeLabel = TYPE_LABEL[n.type] || { ar: n.type, en: n.type };
                return (
                  <div key={n.id} className={`px-4 py-3 flex items-start gap-3 transition-colors ${n.isRead ? "bg-white hover:bg-gray-50" : "bg-emerald-50/30 hover:bg-emerald-50/50"}`}>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 ${meta.color}`}><Icon className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-xs font-bold text-gray-900">{n.title}</span>
                        <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold bg-gray-100 text-gray-500">{lang === "ar" ? typeLabel.ar : typeLabel.en}</span>
                        {!n.isRead && (<span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-100 text-[#047857] px-1.5 py-0.5 text-[9px] font-bold"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{lang === "ar" ? "جديد" : "New"}</span>)}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{n.body}</p>
                      <div className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString(lang === "ar" ? "ar-EG" : "en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!n.isRead && (<Button variant="ghost" size="sm" onClick={() => handleMarkRead(n.id, true)} className="h-8 px-2 text-[#047857] hover:bg-emerald-50 rounded-lg"><Check className="h-3.5 w-3.5" /></Button>)}
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(n.id)} className="h-8 w-8 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full md:max-w-xl bg-white rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 px-5 py-3.5 bg-[#047857] text-white flex items-center justify-between z-10">
              <h3 className="font-bold">{lang === "ar" ? "إنشاء إشعار جديد" : "Create notification"}</h3>
              <button onClick={() => setShowForm(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/15"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div><label className="text-xs font-semibold text-gray-700 mb-1.5 block">{lang === "ar" ? "العنوان *" : "Title *"}</label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="rounded-xl" required /></div>
              <div><label className="text-xs font-semibold text-gray-700 mb-1.5 block">{lang === "ar" ? "المحتوى *" : "Body *"}</label><textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm min-h-[80px] resize-none" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-gray-700 mb-1.5 block">{lang === "ar" ? "النوع" : "Type"}</label><select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm">{Object.entries(TYPE_LABEL).map(([k, v]) => (<option key={k} value={k}>{lang === "ar" ? v.ar : v.en}</option>))}</select></div>
                <div><label className="text-xs font-semibold text-gray-700 mb-1.5 block">{lang === "ar" ? "الأولوية" : "Priority"}</label><select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm">{Object.keys(PRIORITY_STYLE).map((p) => (<option key={p} value={p}>{p}</option>))}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-gray-700 mb-1.5 block">{lang === "ar" ? "نص الزر" : "Action label"}</label><Input value={form.actionLabel} onChange={(e) => setForm((f) => ({ ...f, actionLabel: e.target.value }))} className="rounded-xl" /></div>
                <div><label className="text-xs font-semibold text-gray-700 mb-1.5 block">{lang === "ar" ? "رابط الزر" : "Action URL"}</label><Input value={form.actionUrl} onChange={(e) => setForm((f) => ({ ...f, actionUrl: e.target.value }))} className="rounded-xl" dir="ltr" /></div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100"><Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">{lang === "ar" ? "إلغاء" : "Cancel"}</Button><Button type="submit" disabled={submitting} className="bg-[#047857] hover:bg-[#065f46] text-white rounded-xl">{submitting ? (lang === "ar" ? "جارٍ..." : "Sending...") : (<><Bell className="h-4 w-4 me-1.5" />{lang === "ar" ? "إرسال" : "Send"}</>)}</Button></div>
            </form>
          </div>
        </div>
      )}
    </AdminGuard>
  );
}
