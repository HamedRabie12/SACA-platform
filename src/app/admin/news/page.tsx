"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { AdminGuard } from "@/components/layout/admin-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Newspaper, Plus, Search, X, Edit3, Trash2, ShieldCheck,
  ChevronLeft, ChevronRight, Clock, FileText,
  ArrowLeft, ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type NewsItem = {
  id: string;
  title: string;
  summary: string;
  category: string;
  publishedAt: string;
  orgName: string | null;
  authorName: string | null;
  status: string;
};

const CATEGORIES = [
  { value: "Community", ar: "مجتمع", en: "Community" },
  { value: "Education", ar: "تعليم", en: "Education" },
  { value: "Business", ar: "أعمال", en: "Business" },
  { value: "Health", ar: "صحة", en: "Health" },
  { value: "Immigration", ar: "هجرة", en: "Immigration" },
  { value: "Announcement", ar: "إعلان", en: "Announcement" },
];

const STATUS_BADGE: Record<string, { ar: string; en: string; color: string }> = {
  Published: { ar: "منشور", en: "Published", color: "bg-emerald-50 text-emerald-700" },
  Draft: { ar: "مسودة", en: "Draft", color: "bg-secondary text-muted-foreground" },
  PendingReview: { ar: "قيد المراجعة", en: "Pending review", color: "bg-amber-50 text-amber-700" },
  Archived: { ar: "مؤرشف", en: "Archived", color: "bg-secondary text-muted-foreground" },
};

export default function AdminNewsPage() {
  const { lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  const PageArrow = lang === "ar" ? ChevronRight : ChevronLeft;
  // Auth handled by AdminGuard
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ q: "", category: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState({
    title: "", summary: "", content: "", category: "Community",
    authorName: "", orgName: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => { if (alive) setLoading(true); });
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", "20");
    if (filter.category) params.set("category", filter.category);
    fetch(`/api/community/news?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setNews(d.items ?? []);
        setTotalPages(d.pagination?.totalPages ?? 1);
      })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [page, filter.category]);

  const filtered = filter.q
    ? news.filter((n) =>
        n.title.toLowerCase().includes(filter.q.toLowerCase()) ||
        (n.summary ?? "").toLowerCase().includes(filter.q.toLowerCase())
      )
    : news;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormSuccess(null);
    try {
      const res = await fetch("/api/admin/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
                  },
        body: JSON.stringify({ ...form, status: "PendingReview" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormSuccess(`❌ ${data.error || "Failed"}`);
        return;
      }
      setShowForm(false);
      setFormSuccess(lang === "ar" ? "✅ تم حفظ الخبر في طابور المراجعة." : "✅ News saved to review queue.");
      setForm({ title: "", summary: "", content: "", category: "Community", authorName: "", orgName: "" });
      setTimeout(() => setFormSuccess(null), 4000);
      setPage(1);
    } catch (err) {
      setFormSuccess(`❌ ${(err as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApprove(id: string) {
    const res = await fetch(`/api/admin/news/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
              },
      body: JSON.stringify({ status: "Published" }),
    });
    if (res.ok) {
      setNews((arr) =>
        arr.map((n) => (n.id === id ? { ...n, status: "Published" } : n))
      );
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(lang === "ar" ? "تأكيد حذف الخبر؟" : "Confirm delete?")) return;
    await fetch(`/api/admin/news/${id}`, {
      method: "DELETE",
          });
    setNews((arr) => arr.filter((n) => n.id !== id));
  }

  

  return (
    <AdminGuard>
    <div className="flex-1">
      
      <PageHeader
        title={lang === "ar" ? "إدارة الأخبار" : "Manage news"}
        subtitle={lang === "ar" ? "إنشاء، نشر، تعديل، أو أرشفة الأخبار. تمر عبر Moderation Workflow قبل النشر." : "Create, publish, edit, or archive news. Goes through moderation workflow before publishing."}
        crumbs={[
          { label: lang === "ar" ? "الإدارة" : "Admin", href: "/admin" },
          { label: lang === "ar" ? "الأخبار" : "News" },
        ]}
      />

      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8 py-6 flex-1">
        {/* Toolbar */}
        <div className="rounded-2xl bg-card border border-border shadow-premium p-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={lang === "ar" ? "ابحث في الأخبار…" : "Search news…"}
                value={filter.q}
                onChange={(e) => setFilter((f) => ({ ...f, q: e.target.value }))}
                className="ps-9 rounded-xl"
              />
            </div>
            <select
              value={filter.category}
              onChange={(e) => { setFilter((f) => ({ ...f, category: e.target.value })); setPage(1); }}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm font-medium"
            >
              <option value="">{lang === "ar" ? "كل الفئات" : "All categories"}</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{lang === "ar" ? c.ar : c.en}</option>
              ))}
            </select>
            <Button onClick={() => setShowForm(true)} className="bg-emerald-700 hover:bg-emerald-deep text-white rounded-xl">
              <Plus className="h-4 w-4 me-1.5" />
              {lang === "ar" ? "نشر خبر" : "Publish news"}
            </Button>
          </div>
          {formSuccess && (
            <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">
              {formSuccess}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-card border border-border shadow-premium overflow-hidden">
          <div className="px-4 py-3 border-b border-border/60">
            <h2 className="text-sm font-bold text-foreground">{filtered.length} {lang === "ar" ? "خبر" : "news"}</h2>
          </div>
          {loading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <Newspaper className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{lang === "ar" ? "لا توجد أخبار." : "No news."}</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {filtered.map((n) => {
                const badge = STATUS_BADGE[n.status] || STATUS_BADGE.Draft;
                const cat = CATEGORIES.find((c) => c.value === n.category);
                return (
                  <div key={n.id} className="px-4 py-3 flex items-center gap-3 hover:bg-secondary/30 transition-premium">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 flex-shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-foreground truncate">{n.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(n.publishedAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span>·</span>
                        <span>{lang === "ar" ? cat?.ar : cat?.en}</span>
                        {n.orgName && (
                          <><span>·</span><span className="truncate">{n.orgName}</span></>
                        )}
                      </div>
                    </div>
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${badge.color}`}>
                      {lang === "ar" ? badge.ar : badge.en}
                    </span>
                    <div className="flex items-center gap-1">
                      {n.status !== "Published" && (
                        <Button variant="ghost" size="sm" onClick={() => handleApprove(n.id)} className="h-8 px-2 text-emerald-700 hover:bg-emerald-50" title={lang === "ar" ? "نشر" : "Publish"}>
                          <ShieldCheck className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Edit3 className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(n.id)} className="h-8 w-8 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></Button>
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
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-xl">
                <PageArrow className="h-3.5 w-3.5" />
                {lang === "ar" ? "السابق" : "Prev"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-xl">
                {lang === "ar" ? "التالي" : "Next"}
                <Arrow className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full md:max-w-2xl bg-card rounded-t-3xl md:rounded-3xl shadow-premium-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 px-5 py-3.5 bg-emerald-700 text-white flex items-center justify-between z-10">
              <h3 className="font-bold">{lang === "ar" ? "نشر خبر جديد" : "Publish new news"}</h3>
              <button onClick={() => setShowForm(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/15">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "العنوان *" : "Title *"}</label>
                <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="rounded-xl" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "الفئة" : "Category"}</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{lang === "ar" ? c.ar : c.en}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "المنظمة" : "Organization"}</label>
                  <Input value={form.orgName} onChange={(e) => setForm((f) => ({ ...f, orgName: e.target.value }))} className="rounded-xl" placeholder="SACA - Maryland" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "الملخص *" : "Summary *"}</label>
                <textarea value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm min-h-[60px] resize-none" placeholder={lang === "ar" ? "ملخص قصير يظهر في القوائم" : "Short summary for listings"} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "المحتوى الكامل *" : "Full content *"}</label>
                <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm min-h-[160px] resize-none" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "الكاتب" : "Author"}</label>
                <Input value={form.authorName} onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))} className="rounded-xl" placeholder={lang === "ar" ? "فريق التحرير" : "Editorial team"} />
              </div>
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
                {lang === "ar"
                  ? "سيتم نشر الخبر بعد مراجعته من فريق التحرير. يمكنك حفظه كمسودة أولًا."
                  : "The news will be published after review by the editorial team. You can save as draft first."}
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">{lang === "ar" ? "إلغاء" : "Cancel"}</Button>
                <Button type="submit" disabled={submitting} className="bg-emerald-700 hover:bg-emerald-deep text-white rounded-xl">
                  {submitting ? (lang === "ar" ? "جارٍ الحفظ…" : "Saving…") : (
                    <><Plus className="h-4 w-4 me-1.5" />{lang === "ar" ? "إرسال للنشر" : "Submit for publish"}</>
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
