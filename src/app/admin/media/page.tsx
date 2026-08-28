"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { AdminGuard } from "@/components/layout/admin-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Image as ImageIcon, Video, FileText, File, Upload, Plus,
  Search, X, Trash2, ShieldCheck, Folder, FolderPlus, Edit3,
  ChevronLeft, ChevronRight, Eye, Download,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type Album = {
  id: string;
  name: string;
  nameAr: string | null;
  description: string | null;
  coverUrl: string | null;
  isPublic: boolean;
  itemCount: number;
};

type MediaItem = {
  id: string;
  name: string;
  type: string;
  url: string;
  thumbnailUrl: string | null;
  size: number;
  mimeType: string | null;
  description: string | null;
  tags: string | null;
  isPublic: boolean;
  albumId: string | null;
  createdAt: string;
  album: { id: string; name: string; nameAr: string | null } | null;
};

const TYPE_ICON: Record<string, typeof ImageIcon> = {
  image: ImageIcon,
  video: Video,
  pdf: FileText,
  doc: File,
};

const TYPE_COLOR: Record<string, string> = {
  image: "bg-emerald-50 text-emerald-700",
  video: "bg-purple-50 text-purple-700",
  pdf: "bg-rose-50 text-rose-700",
  doc: "bg-blue-50 text-blue-700",
};

function formatSize(bytes: number) {
  if (bytes === 0) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// Preset image URLs for quick upload (admin picks from gallery)
const PRESET_IMAGES = [
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1609220136736-443140cffec6?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1499488935264-8d2d6d92e26c?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1529390079861-591de354faf5?q=80&w=800&auto=format&fit=crop",
];

export default function AdminMediaPage() {
  const { lang } = useLanguage();
  // Auth handled by AdminGuard
  const [albums, setAlbums] = useState<Album[]>([]);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAlbum, setActiveAlbum] = useState<string>("");
  const [searchQ, setSearchQ] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: "", type: "image", url: "", description: "", tags: "", albumId: "", isPublic: true,
  });
  const [albumForm, setAlbumForm] = useState({
    name: "", nameAr: "", description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState<string | null>(null);

  const fetchAlbums = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/albums", {
              });
      const data = await res.json();
      setAlbums(data.items ?? []);
    } catch {}
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeAlbum) params.set("albumId", activeAlbum);
    params.set("pageSize", "100");
    try {
      const res = await fetch(`/api/admin/media?${params}`, {
              });
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeAlbum]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  useEffect(() => {
    const t = setTimeout(fetchItems, 200);
    return () => clearTimeout(t);
  }, [fetchItems]);

  const filtered = searchQ
    ? items.filter((m) =>
        m.name.toLowerCase().includes(searchQ.toLowerCase()) ||
        (m.description ?? "").toLowerCase().includes(searchQ.toLowerCase())
      )
    : items;

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormMsg(null);
    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...uploadForm,
          albumId: uploadForm.albumId || null,
          thumbnailUrl: uploadForm.type === "image" ? uploadForm.url.replace("w=800", "w=300") : null,
          size: 2000000,
          mimeType: uploadForm.type === "image" ? "image/jpeg" : uploadForm.type === "video" ? "video/mp4" : "application/octet-stream",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormMsg(`❌ ${data.error || "Failed"}`);
        return;
      }
      setFormMsg(`✅ ${lang === "ar" ? "تم رفع الملف." : "File uploaded."}`);
      setUploadForm({ name: "", type: "image", url: "", description: "", tags: "", albumId: "", isPublic: true });
      setTimeout(() => { setFormMsg(null); setShowUpload(false); }, 1500);
      fetchItems();
      fetchAlbums();
    } catch {
      setFormMsg("❌ Error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateAlbum(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(albumForm),
      });
      if (res.ok) {
        setAlbumForm({ name: "", nameAr: "", description: "" });
        setShowAlbumForm(false);
        fetchAlbums();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteItem(id: string) {
    if (!confirm(lang === "ar" ? "تأكيد حذف الملف؟" : "Confirm delete?")) return;
    await fetch(`/api/admin/media/${id}`, {
      method: "DELETE",
          });
    setItems((arr) => arr.filter((m) => m.id !== id));
    fetchAlbums();
  }

  async function handleDeleteAlbum(id: string) {
    if (!confirm(lang === "ar" ? "تأكيد حذف الألبوم؟ سيتم فصل الملفات عنه." : "Confirm delete album? Files will be detached.")) return;
    await fetch(`/api/admin/albums/${id}`, {
      method: "DELETE",
          });
    setAlbums((arr) => arr.filter((a) => a.id !== id));
    if (activeAlbum === id) setActiveAlbum("");
  }

  

  return (
    <AdminGuard>
    <div className="flex-1">
      
      <PageHeader
        title={lang === "ar" ? "إدارة المكتبة الرقمية" : "Manage Media Library"}
        subtitle={lang === "ar" ? `${albums.length} ألبوم · ${items.length} ملف — رفع وإدارة الصور والفيديوهات والمستندات` : `${albums.length} albums · ${items.length} files`}
        crumbs={[
          { label: lang === "ar" ? "الإدارة" : "Admin", href: "/admin" },
          { label: lang === "ar" ? "المكتبة" : "Media" },
        ]}
      />

      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8 py-6 flex-1">
        {/* Toolbar */}
        <div className="rounded-2xl bg-card border border-border shadow-premium p-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder={lang === "ar" ? "ابحث في الملفات…" : "Search files…"} value={searchQ} onChange={(e) => setSearchQ(e.target.value)} className="ps-9 rounded-xl" />
            </div>
            <select value={activeAlbum} onChange={(e) => setActiveAlbum(e.target.value)} className="h-10 rounded-xl border border-input bg-background px-3 text-sm font-medium">
              <option value="">{lang === "ar" ? "كل الألبومات" : "All albums"}</option>
              {albums.map((a) => (
                <option key={a.id} value={a.id}>{lang === "ar" && a.nameAr ? a.nameAr : a.name} ({a.itemCount})</option>
              ))}
            </select>
            <Button variant="outline" onClick={() => setShowAlbumForm(true)} className="rounded-xl">
              <FolderPlus className="h-4 w-4 me-1.5" />
              {lang === "ar" ? "ألبوم جديد" : "New album"}
            </Button>
            <Button onClick={() => setShowUpload(true)} className="bg-emerald-700 hover:bg-emerald-deep text-white rounded-xl">
              <Upload className="h-4 w-4 me-1.5" />
              {lang === "ar" ? "رفع ملف" : "Upload"}
            </Button>
          </div>
          {formMsg && <div className="mt-3 rounded-lg bg-secondary/40 border px-3 py-2 text-xs font-medium">{formMsg}</div>}
        </div>

        {/* Albums management */}
        <div className="mb-5">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Folder className="h-4 w-4 text-emerald-700" />
            {lang === "ar" ? "الألبومات" : "Albums"} ({albums.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {albums.map((a) => (
              <div key={a.id} className={`group relative rounded-xl border p-3 transition-premium ${activeAlbum === a.id ? "border-emerald-700 bg-emerald-50/40" : "border-border bg-card"}`}>
                <button onClick={() => setActiveAlbum(activeAlbum === a.id ? "" : a.id)} className="block w-full text-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-700 to-emerald-deep text-white mb-2">
                    <Folder className="h-5 w-5" />
                  </div>
                  <div className="text-xs font-bold text-foreground line-clamp-1">{lang === "ar" && a.nameAr ? a.nameAr : a.name}</div>
                  <div className="text-[10px] text-muted-foreground">{a.itemCount} {lang === "ar" ? "ملف" : "items"}</div>
                </button>
                <button onClick={() => handleDeleteAlbum(a.id)} className="absolute top-1 end-1 opacity-0 group-hover:opacity-100 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Media grid */}
        <div className="rounded-2xl bg-card border border-border shadow-premium overflow-hidden">
          <div className="px-4 py-3 border-b border-border/60">
            <h3 className="text-sm font-bold text-foreground">{filtered.length} {lang === "ar" ? "ملف" : "files"}</h3>
          </div>
          {loading ? (
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{lang === "ar" ? "لا توجد ملفات." : "No files."}</p>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filtered.map((m) => {
                const Icon = TYPE_ICON[m.type] || ImageIcon;
                const color = TYPE_COLOR[m.type] || "bg-emerald-50 text-emerald-700";
                return (
                  <div key={m.id} className="group rounded-xl border border-border overflow-hidden">
                    <div className="relative aspect-square bg-secondary/30 overflow-hidden">
                      {m.type === "image" && m.url && m.url !== "#" ? (
                        <img src={m.url} alt={m.name} className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : (
                        <div className={`absolute inset-0 flex items-center justify-center ${color}`}>
                          <Icon className="h-10 w-10" />
                        </div>
                      )}
                      <span className={`absolute top-1 start-1 inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[8px] font-bold ${color}`}>
                        {m.type.toUpperCase()}
                      </span>
                      {!m.isPublic && (
                        <span className="absolute top-1 end-1 inline-flex items-center rounded bg-amber-100 text-amber-800 px-1 py-0.5 text-[8px] font-bold">
                          {lang === "ar" ? "خاص" : "Private"}
                        </span>
                      )}
                      {/* Hover delete */}
                      <button onClick={() => handleDeleteItem(m.id)} className="absolute bottom-1 end-1 opacity-0 group-hover:opacity-100 inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="p-2">
                      <div className="text-[10px] font-semibold text-foreground truncate">{m.name}</div>
                      <div className="text-[9px] text-muted-foreground">{formatSize(m.size)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      

      {/* Upload drawer */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowUpload(false)} />
          <div className="relative w-full md:max-w-2xl bg-card rounded-t-3xl md:rounded-3xl shadow-premium-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 px-5 py-3.5 bg-emerald-700 text-white flex items-center justify-between z-10">
              <h3 className="font-bold">{lang === "ar" ? "رفع ملف جديد" : "Upload new file"}</h3>
              <button onClick={() => setShowUpload(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/15">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "اسم الملف *" : "File name *"}</label>
                <Input value={uploadForm.name} onChange={(e) => setUploadForm((f) => ({ ...f, name: e.target.value }))} className="rounded-xl" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "النوع" : "Type"}</label>
                  <select value={uploadForm.type} onChange={(e) => setUploadForm((f) => ({ ...f, type: e.target.value }))} className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                    <option value="image">{lang === "ar" ? "صورة" : "Image"}</option>
                    <option value="video">{lang === "ar" ? "فيديو" : "Video"}</option>
                    <option value="pdf">PDF</option>
                    <option value="doc">{lang === "ar" ? "مستند" : "Document"}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "الألبوم" : "Album"}</label>
                  <select value={uploadForm.albumId} onChange={(e) => setUploadForm((f) => ({ ...f, albumId: e.target.value }))} className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                    <option value="">{lang === "ar" ? "بدون ألبوم" : "No album"}</option>
                    {albums.map((a) => (
                      <option key={a.id} value={a.id}>{lang === "ar" && a.nameAr ? a.nameAr : a.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "رابط الملف *" : "File URL *"}</label>
                <Input type="url" dir="ltr" value={uploadForm.url} onChange={(e) => setUploadForm((f) => ({ ...f, url: e.target.value }))} className="rounded-xl" placeholder="https://..." required />
                <p className="text-[10px] text-muted-foreground mt-1">
                  {lang === "ar"
                    ? "يجب أن يكون الرابط إلى ملف موجود في التخزين المُدار المعتمد للجالية؛ لا تستخدم روابط مؤقتة أو ملفات محلية في الإنتاج."
                    : "Use a URL from the approved managed object storage service; local/temporary file URLs are not permitted in production."}
                </p>
              </div>
              {/* Quick-pick images */}
              {uploadForm.type === "image" && (
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "أو اختر صورة جاهزة:" : "Or pick a preset:"}</label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_IMAGES.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setUploadForm((f) => ({ ...f, url }))}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 ${uploadForm.url === url ? "border-emerald-700" : "border-transparent"}`}
                      >
                        <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "الوصف" : "Description"}</label>
                <textarea value={uploadForm.description} onChange={(e) => setUploadForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm min-h-[60px] resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "الوسوم (مفصولة بفواصل)" : "Tags (comma-separated)"}</label>
                <Input value={uploadForm.tags} onChange={(e) => setUploadForm((f) => ({ ...f, tags: e.target.value }))} className="rounded-xl" placeholder={lang === "ar" ? "مؤتمر, ميريلاند" : "conference, maryland"} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={uploadForm.isPublic} onChange={(e) => setUploadForm((f) => ({ ...f, isPublic: e.target.checked }))} className="h-4 w-4 rounded border-border text-emerald-700 focus:ring-emerald-700" />
                <span className="text-sm">{lang === "ar" ? "ملف عام (مرئي للجميع)" : "Public file (visible to all)"}</span>
              </label>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowUpload(false)} className="rounded-xl">{lang === "ar" ? "إلغاء" : "Cancel"}</Button>
                <Button type="submit" disabled={submitting} className="bg-emerald-700 hover:bg-emerald-deep text-white rounded-xl">
                  {submitting ? (lang === "ar" ? "جارٍ الرفع…" : "Uploading…") : (
                    <><Upload className="h-4 w-4 me-1.5" />{lang === "ar" ? "رفع" : "Upload"}</>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create album drawer */}
      {showAlbumForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAlbumForm(false)} />
          <div className="relative w-full md:max-w-md bg-card rounded-t-3xl md:rounded-3xl shadow-premium-lg">
            <div className="sticky top-0 px-5 py-3.5 bg-emerald-700 text-white flex items-center justify-between z-10 rounded-t-3xl">
              <h3 className="font-bold">{lang === "ar" ? "إنشاء ألبوم" : "Create album"}</h3>
              <button onClick={() => setShowAlbumForm(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/15">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAlbum} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "اسم الألبوم (إنجليزي) *" : "Album name (English) *"}</label>
                <Input value={albumForm.name} onChange={(e) => setAlbumForm((f) => ({ ...f, name: e.target.value }))} className="rounded-xl" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "الاسم (عربي)" : "Name (Arabic)"}</label>
                <Input value={albumForm.nameAr} onChange={(e) => setAlbumForm((f) => ({ ...f, nameAr: e.target.value }))} className="rounded-xl" dir="rtl" />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "الوصف" : "Description"}</label>
                <textarea value={albumForm.description} onChange={(e) => setAlbumForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm min-h-[60px] resize-none" />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowAlbumForm(false)} className="rounded-xl">{lang === "ar" ? "إلغاء" : "Cancel"}</Button>
                <Button type="submit" disabled={submitting} className="bg-emerald-700 hover:bg-emerald-deep text-white rounded-xl">
                  {submitting ? (lang === "ar" ? "جارٍ الحفظ…" : "Saving…") : (
                    <><FolderPlus className="h-4 w-4 me-1.5" />{lang === "ar" ? "إنشاء" : "Create"}</>
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
