"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, Trash2, Clock, AlertTriangle, Info, Video, Calendar, Newspaper } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  priority: string;
  actionLabel: string | null;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
};

const PRIORITY_ICON: Record<string, typeof Info> = {
  Normal: Info,
  Important: AlertTriangle,
  Urgent: AlertTriangle,
  Critical: AlertTriangle,
};

const PRIORITY_COLOR: Record<string, string> = {
  Normal: "bg-emerald-50 text-emerald-600",
  Important: "bg-amber-50 text-amber-600",
  Urgent: "bg-orange-50 text-orange-600",
  Critical: "bg-red-50 text-red-600",
};

const TYPE_ICON: Record<string, typeof Bell> = {
  meeting: Video,
  event: Calendar,
  news: Newspaper,
  organization: Info,
  system: Bell,
  announcement: AlertTriangle,
  follow: Bell,
};

// Generate a soft notification sound using Web Audio API
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Soft two-tone bell (E5 → A5)
    osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    // Audio not supported or blocked
  }
}

function timeAgo(dateStr: string, lang: "ar" | "en") {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (lang === "ar") {
    if (mins < 1) return "الآن";
    if (mins < 60) return `قبل ${mins} دقيقة`;
    if (hours < 24) return `قبل ${hours} ساعة`;
    return `قبل ${days} يوم`;
  }
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function NotificationBell() {
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevUnreadRef = useRef(0);

  // Fetch notifications
  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch("/api/community/notifications?pageSize=10");
      const data = await res.json();
      setNotifications(data.items ?? []);
      setUnreadCount(data.unreadCount ?? 0);

      // Play sound if new notifications arrived
      if (data.unreadCount > prevUnreadRef.current && prevUnreadRef.current !== -1) {
        playNotificationSound();
      }
      prevUnreadRef.current = data.unreadCount;
      setHasFetched(true);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }

  // Initial fetch + poll every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleMarkRead(id: string) {
    await fetch(`/api/community/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    setNotifications((arr) => arr.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  async function handleMarkAllRead() {
    await Promise.all(
      notifications.filter((n) => !n.isRead).map((n) =>
        fetch(`/api/community/notifications/${n.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRead: true }),
        })
      )
    );
    setNotifications((arr) => arr.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/community/notifications/${id}`, {
      method: "DELETE",
          });
    setNotifications((arr) => arr.filter((n) => n.id !== id));
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!hasFetched) fetchNotifications();
        }}
        aria-label={lang === "ar" ? "الإشعارات" : "Notifications"}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#047857] transition-colors"
      >
        <Bell className={`h-4 w-4 ${unreadCount > 0 ? "animate-bounce" : ""}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -end-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {/* Pulse ring for unread */}
        {unreadCount > 0 && (
          <span className="absolute inset-0 rounded-full ring-2 ring-red-400/50 animate-ping" style={{ animationDuration: "2s" }} />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-2 end-0 z-[100] w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-white border border-gray-100 shadow-xl overflow-hidden animate-fade-up">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-[#047857] to-[#064e3b] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">
                {lang === "ar" ? "الإشعارات" : "Notifications"}
              </span>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-white/80 hover:text-white"
              >
                <CheckCheck className="h-3 w-3" />
                {lang === "ar" ? "تعليم الكل" : "Mark all"}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-200 border-t-[#047857] animate-spin" />
                <p className="text-[10px] text-gray-400 mt-2">{lang === "ar" ? "جارٍ التحميل..." : "Loading..."}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400">
                  {lang === "ar" ? "لا توجد إشعارات" : "No notifications"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((n) => {
                  const PriorityIcon = PRIORITY_ICON[n.priority] || Info;
                  const TypeIcon = TYPE_ICON[n.type] || Bell;
                  const color = PRIORITY_COLOR[n.priority] || "bg-gray-50 text-gray-500";
                  return (
                    <div
                      key={n.id}
                      className={`px-3 py-3 hover:bg-gray-50 transition-colors cursor-pointer group ${!n.isRead ? "bg-emerald-50/30" : ""}`}
                      onClick={() => !n.isRead && handleMarkRead(n.id)}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${color}`}>
                          <TypeIcon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-bold text-gray-900 truncate">{n.title}</span>
                            {!n.isRead && (
                              <span className="h-1.5 w-1.5 rounded-full bg-[#047857] flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{n.body}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-2.5 w-2.5 text-gray-300" />
                            <span className="text-[9px] text-gray-400">{timeAgo(n.createdAt, lang)}</span>
                            {n.priority !== "Normal" && (
                              <span className={`ms-auto inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[8px] font-bold ${color}`}>
                                <PriorityIcon className="h-2 w-2" />
                                {n.priority}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-gray-300 hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-50 bg-gray-50/50">
              <a href="/admin/notifications" className="block text-center text-[10px] font-semibold text-[#047857] hover:text-[#065f46]">
                {lang === "ar" ? "عرض الكل" : "View all"}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
