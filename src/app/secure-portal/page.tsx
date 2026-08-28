"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SACALogo } from "@/components/brand/saca-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Lock, User, ShieldCheck, AlertCircle, Eye, EyeOff,
  Fingerprint, ArrowLeft, Activity, Database, Sparkles,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

export default function SecurePortalPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/secure-portal/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setError(data.error);
        setAttemptsLeft(0);
      } else if (res.status === 401) {
        setError(data.error);
        setAttemptsLeft((prev) => (prev === null ? 4 : Math.max(0, prev - 1)));
      } else if (!res.ok) {
        setError(data.error || "Authentication failed");
      } else {
        router.push("/secure-portal/mfa");
      }
    } catch {
      setError("Connection failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex overflow-hidden">
      {/* Left: Cinematic image panel */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1600&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#061726]/80 via-[#064e3b]/60 to-[#061726]/90" />
        <div className="absolute inset-0 flex flex-col justify-between p-12 z-10">
          {/* Top: Logo */}
          <div className="flex items-center gap-3">
            <SACALogo size="lg" showText={false} />
            <div>
              <h2 className="text-xl font-bold text-white">SACA</h2>
              <p className="text-[10px] text-white/60">Sudanese American Community Association</p>
            </div>
          </div>

          {/* Center: Tagline */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur border border-white/20 px-3 py-1">
              <Sparkles className="h-3 w-3 text-[#C5A065]" />
              <span className="text-[10px] font-semibold text-white/80 tracking-wider uppercase">Administration Portal</span>
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight max-w-md">
              {lang === "ar" ? "إدارة المجتمع السوداني الأمريكي" : "Managing the Sudanese American Community"}
            </h1>
            <p className="text-sm text-white/60 max-w-sm leading-relaxed">
              {lang === "ar"
                ? "منصة متكاملة لإدارة الأعضاء والمنظمات والفعاليات والاجتماعات ببيانات حقيقية من قاعدة البيانات."
                : "A comprehensive platform for managing members, organizations, events, and meetings with real database data."}
            </p>
          </div>

          {/* Bottom: Security features */}
          <div className="flex items-center gap-6">
            {[
              { icon: ShieldCheck, label: lang === "ar" ? "محمي" : "Secured" },
              { icon: Database, label: lang === "ar" ? "قاعدة بيانات" : "Database" },
              { icon: Activity, label: lang === "ar" ? "مراقبة" : "Monitored" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-[#C5A065]" />
                  <span className="text-xs text-white/60">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Login panel */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#F8FAF9] to-[#F0FDF4] px-6 py-12 relative">
        {/* Back button */}
        <a href="/" className="absolute top-6 start-6 inline-flex items-center gap-2 text-gray-500 hover:text-[#047857] transition-colors">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          <span className="text-xs font-medium">{lang === "ar" ? "العودة للموقع" : "Back to site"}</span>
        </a>

        {/* Security badge */}
        <div className="absolute top-6 end-6 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1">
          <Fingerprint className="h-3 w-3 text-[#047857]" />
          <span className="text-[10px] font-bold text-[#047857] tracking-wider uppercase">Secured</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Mobile logo (hidden on desktop) */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <SACALogo size="xl" showText={false} />
            <h1 className="mt-3 text-xl font-bold text-gray-900">SACA Admin</h1>
            <p className="text-[10px] text-gray-400">Sudanese American Community Association</p>
          </div>

          {/* Card */}
          <div className="rounded-3xl bg-white border border-gray-100 shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-50">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#047857] ring-1 ring-emerald-100">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {lang === "ar" ? "مصادقة مطلوبة" : "Authentication Required"}
                </h2>
                <p className="text-[10px] text-gray-400">
                  {lang === "ar" ? "جميع المحاولات مراقبة ومسجلة" : "All attempts are logged"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  {lang === "ar" ? "اسم المستخدم" : "Username"}
                </label>
                <div className="relative">
                  <User className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-gray-300" />
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="ps-10 h-11 rounded-xl border-gray-200 focus:border-[#047857] focus:ring-[#047857]/20"
                    placeholder={lang === "ar" ? "أدخل اسم المستخدم" : "Enter username"}
                    required
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  {lang === "ar" ? "كلمة المرور" : "Password"}
                </label>
                <div className="relative">
                  <Lock className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-gray-300" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="ps-10 pe-10 h-11 rounded-xl border-gray-200 focus:border-[#047857] focus:ring-[#047857]/20"
                    placeholder={lang === "ar" ? "أدخل كلمة المرور" : "Enter password"}
                    required
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-300 hover:text-gray-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-3 py-2.5 text-xs text-red-600 flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {attemptsLeft !== null && attemptsLeft > 0 && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-100 px-3 py-1">
                    <span className="text-[10px] text-amber-600 font-semibold">
                      {attemptsLeft} {lang === "ar" ? "محاولات متبقية" : "attempts remaining"}
                    </span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#047857] hover:bg-[#065f46] text-white font-bold rounded-xl h-12 transition-colors"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    {lang === "ar" ? "جارٍ المصادقة..." : "Authenticating..."}
                  </span>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 me-1.5" />
                    {lang === "ar" ? "دخول آمن" : "Secure Login"}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-gray-50">
              <div className="flex items-center justify-center gap-4">
                {[
                  { label: lang === "ar" ? "حماية" : "Rate Limit", color: "text-emerald-500" },
                  { label: lang === "ar" ? "تدقيق" : "Audit Log", color: "text-blue-500" },
                  { label: lang === "ar" ? "حماية CSRF" : "CSRF", color: "text-purple-500" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <ShieldCheck className={`h-3 w-3 ${item.color}`} />
                    <span className="text-[9px] text-gray-400 uppercase tracking-wide">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center mt-6 text-[10px] text-gray-300">
            {lang === "ar"
              ? "الدخول غير المصروح به ممنوع وقد يعرضك للمساءلة القانونية"
              : "Unauthorized access is prohibited and subject to legal action"}
          </p>
        </div>
      </div>
    </div>
  );
}
