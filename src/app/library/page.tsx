"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { AIAssistantWidget } from "@/components/community/ai-assistant-widget";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText, Image as ImageIcon, Video, File, Upload, FolderOpen,
  Search, Filter, Download, Eye, Trash2, Folder, ChevronLeft, ChevronRight,
  X, ArrowLeft, Calendar, Tag,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type Album = {
  id: string;
  name: string;
  nameAr: string | null;
  description: string | null;
  coverUrl: string | null;
  itemCount: number;
  createdAt: string;
};

type MediaItem = {
  id: string;
  name: string;
  type: string; // image, video, pdf, doc
  url: string;
  thumbnailUrl: string | null;
  size: number;
  mimeType: string | null;
  description: string | null;
  tags: string | null;
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

export default function LibraryPage() {
  const { lang } = useLanguage();
  const Arrow = lang === "ar" ? ChevronLeft : ChevronRight;
  const [albums, setAlbums] = useState<Album[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [searchQ, setSearchQ] = useState("");
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch("/api/community/albums").then((r) => r.json()),
      fetch("/api/community/media?pageSize=60").then((r) => r.json()),
    ])
      .then(([albumData, mediaData]) => {
        if (!alive) return;
        setAlbums(albumData.items ?? []);
        setMediaItems(mediaData.items ?? []);
      })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  // Refetch media when album/type changes
  const fetchMedia = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("pageSize", "60");
    if (activeAlbum) params.set("albumId", activeAlbum);
    if (typeFilter) params.set("type", typeFilter);
    try {
      const res = await fetch(`/api/community/media?${params}`);
      const data = await res.json();
      setMediaItems(data.items ?? []);
    } catch {
      setMediaItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeAlbum, typeFilter]);

  useEffect(() => {
    const t = setTimeout(fetchMedia, 200);
    return () => clearTimeout(t);
  }, [fetchMedia]);

  // Client-side search filter
  const filtered = searchQ
    ? mediaItems.filter((m) =>
        m.name.toLowerCase().includes(searchQ.toLowerCase()) ||
        (m.description ?? "").toLowerCase().includes(searchQ.toLowerCase()) ||
        (m.tags ?? "").toLowerCase().includes(searchQ.toLowerCase())
      )
    : mediaItems;

  const totalItems = albums.reduce((sum, a) => sum + a.itemCount, 0);

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <PageHeader
        title={lang === "ar" ? "المكتبة الرقمية" : "Media Library"}
        subtitle={lang === "ar"
          ? `${albums.length} ألبوم · ${totalItems} ملف — صور، فيديوهات، مستندات، وأرشيف مناسبات الجالية السودانية.`
          : `${albums.length} albums · ${totalItems} files — photos, videos, documents, and event archives.`
        }
        crumbs={[{ label: lang === "ar" ? "المكتبة" : "Library" }]}
      />

      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 lg:px-8 py-6 flex-1">
        {/* Stats bar */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: lang === "ar" ? "ألبومات" : "Albums", value: albums.length, icon: Folder, color: "text-emerald-700" },
              { label: lang === "ar" ? "صور" : "Images", value: mediaItems.filter((m) => m.type === "image").length, icon: ImageIcon, color: "text-gold" },
              { label: lang === "ar" ? "فيديوهات" : "Videos", value: mediaItems.filter((m) => m.type === "video").length, icon: Video, color: "text-purple-700" },
              { label: lang === "ar" ? "مستندات" : "Documents", value: mediaItems.filter((m) => m.type === "pdf" || m.type === "doc").length, icon: FileText, color: "text-rose-700" },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="rounded-2xl bg-card border border-border shadow-premium p-4">
                  <Icon className={`h-5 w-5 mb-2 ${s.color}`} />
                  <div className="text-2xl font-bold tabular-nums">{s.value}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Albums row */}
        <div className="mb-6">
          <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-emerald-700" />
            {lang === "ar" ? "الألبومات" : "Albums"}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              onClick={() => setActiveAlbum(null)}
              className={`group relative overflow-hidden rounded-2xl border p-4 text-start transition-premium ${
                !activeAlbum ? "border-emerald-700 bg-emerald-50/40 shadow-premium" : "border-border bg-card hover:shadow-premium"
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg mb-2 ${
                !activeAlbum ? "bg-emerald-700 text-white" : "bg-secondary text-muted-foreground group-hover:bg-emerald-50 group-hover:text-emerald-700"
              }`}>
                <Folder className="h-5 w-5" />
              </div>
              <div className="text-xs font-bold text-foreground">{lang === "ar" ? "الكل" : "All"}</div>
              <div className="text-[10px] text-muted-foreground">{totalItems} {lang === "ar" ? "ملف" : "items"}</div>
            </button>

            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
            ) : (
              albums.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setActiveAlbum(activeAlbum === a.id ? null : a.id)}
                  className={`group relative overflow-hidden rounded-2xl border p-4 text-start transition-premium ${
                    activeAlbum === a.id ? "border-emerald-700 bg-emerald-50/40 shadow-premium" : "border-border bg-card hover:shadow-premium"
                  }`}
                >
                  {a.coverUrl && (
                    <div className="absolute inset-0 opacity-10">
                      <img src={a.coverUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className={`relative flex h-10 w-10 items-center justify-center rounded-lg mb-2 ${
                    activeAlbum === a.id ? "bg-emerald-700 text-white" : "bg-secondary text-muted-foreground group-hover:bg-emerald-50 group-hover:text-emerald-700"
                  }`}>
                    <Folder className="h-5 w-5" />
                  </div>
                  <div className="relative text-xs font-bold text-foreground line-clamp-2 mb-0.5">
                    {lang === "ar" && a.nameAr ? a.nameAr : a.name}
                  </div>
                  <div className="relative text-[10px] text-muted-foreground">{a.itemCount} {lang === "ar" ? "ملف" : "items"}</div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="rounded-2xl bg-card border border-border shadow-premium p-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={lang === "ar" ? "ابحث في المكتبة…" : "Search library…"}
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                className="w-full h-10 ps-9 pe-3 rounded-xl border border-input bg-background text-sm"
              />
            </div>
            <div className="flex items-center gap-1">
              {["", "image", "video", "pdf", "doc"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-premium ${
                    typeFilter === t ? "bg-emerald-700 text-white" : "bg-secondary text-foreground hover:bg-emerald-50"
                  }`}
                >
                  {t === "" ? (lang === "ar" ? "الكل" : "All") : t === "image" ? (lang === "ar" ? "صور" : "Images") : t === "video" ? (lang === "ar" ? "فيديو" : "Videos") : t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Media grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {lang === "ar" ? "لا توجد ملفات مطابقة." : "No matching files."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((m) => {
              const Icon = TYPE_ICON[m.type] || ImageIcon;
              const color = TYPE_COLOR[m.type] || "bg-emerald-50 text-emerald-700";
              return (
                <div
                  key={m.id}
                  className="group rounded-xl border border-border overflow-hidden hover:shadow-premium transition-premium bg-card"
                >
                  <button
                    onClick={() => m.type === "image" || m.type === "video" ? setPreviewItem(m) : null}
                    className="block w-full"
                  >
                    <div className="relative aspect-square bg-secondary/30 overflow-hidden">
                      {m.type === "image" && m.url && m.url !== "#" ? (
                        <img src={m.url} alt={m.name} className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : m.type === "video" && m.thumbnailUrl ? (
                        <>
                          <img src={m.thumbnailUrl} alt={m.name} className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Video className="h-8 w-8 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className={`absolute inset-0 flex items-center justify-center ${color}`}>
                          <Icon className="h-12 w-12" />
                        </div>
                      )}
                      <span className={`absolute top-2 start-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold ${color}`}>
                        <Icon className="h-2.5 w-2.5" />
                        {m.type.toUpperCase()}
                      </span>
                    </div>
                  </button>
                  <div className="p-2.5">
                    <div className="text-xs font-semibold text-foreground truncate mb-0.5">{m.name}</div>
                    <div className="text-[10px] text-muted-foreground flex items-center justify-between">
                      <span>{formatSize(m.size)}</span>
                      <span>{new Date(m.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { day: "numeric", month: "short" })}</span>
                    </div>
                    {m.album && (
                      <div className="text-[9px] text-emerald-700 mt-0.5 truncate">
                        {lang === "ar" && m.album.nameAr ? m.album.nameAr : m.album.name}
                      </div>
                    )}
                  </div>
                  {/* Hover actions */}
                  <div className="px-2.5 pb-2.5 flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 flex-1 rounded-lg text-[10px]"
                      onClick={() => setPreviewItem(m)}
                    >
                      <Eye className="h-3 w-3 me-1" />
                      {lang === "ar" ? "عرض" : "View"}
                    </Button>
                    {m.url && m.url !== "#" && (
                      <Button asChild variant="outline" size="sm" className="h-7 w-7 p-0 rounded-lg">
                        <a href={m.url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
      <AIAssistantWidget />

      {/* Preview modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setPreviewItem(null)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-4xl bg-card rounded-2xl shadow-premium-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-3 end-3 z-10">
              <button onClick={() => setPreviewItem(null)} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="bg-black flex items-center justify-center min-h-[300px] max-h-[70vh]">
              {previewItem.type === "image" ? (
                <img src={previewItem.url} alt={previewItem.name} className="max-h-[70vh] w-auto object-contain" />
              ) : previewItem.type === "video" && previewItem.thumbnailUrl ? (
                <div className="relative">
                  <img src={previewItem.thumbnailUrl} alt={previewItem.name} className="max-h-[70vh] w-auto object-contain" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button className="bg-white/20 backdrop-blur text-white rounded-full h-14 w-14 p-0">
                      <Video className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className={`flex flex-col items-center justify-center p-12 ${TYPE_COLOR[previewItem.type] || "bg-emerald-50 text-emerald-700"}`}>
                  {(() => {
                    const Icon = TYPE_ICON[previewItem.type] || FileText;
                    return <Icon className="h-16 w-16 mb-3" />;
                  })()}
                  <p className="text-sm font-bold">{previewItem.name}</p>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-base font-bold text-foreground mb-1">{previewItem.name}</h3>
              {previewItem.description && <p className="text-sm text-muted-foreground mb-2">{previewItem.description}</p>}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(previewItem.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { day: "numeric", month: "long", year: "numeric" })}
                </span>
                <span>· {formatSize(previewItem.size)}</span>
                {previewItem.tags && (
                  <span className="inline-flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {previewItem.tags}
                  </span>
                )}
                {previewItem.album && (
                  <span>· {lang === "ar" && previewItem.album.nameAr ? previewItem.album.nameAr : previewItem.album.name}</span>
                )}
              </div>
              {previewItem.url && previewItem.url !== "#" && (
                <Button asChild className="mt-3 bg-emerald-700 hover:bg-emerald-deep text-white rounded-xl">
                  <a href={previewItem.url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 me-1.5" />
                    {lang === "ar" ? "تحميل" : "Download"}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
