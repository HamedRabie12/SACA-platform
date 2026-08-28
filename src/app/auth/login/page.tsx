"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail, Phone, ArrowLeft, ArrowRight, ShieldCheck, Globe2, ChevronDown,
  Lock, RefreshCw, AlertCircle, CheckCircle2, Clock,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type Channel = "email" | "phone";
type Stage = "send" | "verify" | "done";

export default function LoginPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  const [channel, setChannel] = useState<Channel>("email");
  const [contact, setContact] = useState("");
  const [stage, setStage] = useState<Stage>("send");
  const [verificationId, setVerificationId] = useState("");
  const [maskedDestination, setMaskedDestination] = useState("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memberName, setMemberName] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(300);

  // Country picker state
  const [country, setCountry] = useState({ iso2: "US", ar: "الولايات المتحدة", en: "United States", dial: "+1" });
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [countries] = useState([
    { iso2: "US", ar: "الولايات المتحدة", en: "United States", dial: "+1" },
    { iso2: "SD", ar: "السودان", en: "Sudan", dial: "+249" },
    { iso2: "SA", ar: "السعودية", en: "Saudi Arabia", dial: "+966" },
    { iso2: "AE", ar: "الإمارات", en: "United Arab Emirates", dial: "+971" },
    { iso2: "EG", ar: "مصر", en: "Egypt", dial: "+20" },
    { iso2: "QA", ar: "قطر", en: "Qatar", dial: "+974" },
    { iso2: "KW", ar: "الكويت", en: "Kuwait", dial: "+965" },
    { iso2: "GB", ar: "المملكة المتحدة", en: "United Kingdom", dial: "+44" },
    { iso2: "CA", ar: "كندا", en: "Canada", dial: "+1" },
  ]);

  // Countdown
  useEffect(() => {
    if (stage !== "verify" || secondsLeft <= 0) return;
    const i = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(i);
  }, [stage, secondsLeft]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const fullContact =
      channel === "phone" ? `${country.dial}${contact.replace(/^0+/, "")}` : contact;
    if (!fullContact) {
      setError(lang === "ar" ? "يرجى إدخال البريد أو الهاتف" : "Please enter email or phone");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/community/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", contact: fullContact, channel }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed");
        return;
      }
      setVerificationId(data.verificationId);
      setMaskedDestination(data.maskedDestination);
      setExpiresAt(data.expiresAt);
      setIsLogin(data.isLogin);
      setSecondsLeft(300);
      setStage("verify");
    } catch {
      setError(lang === "ar" ? "تعذر الاتصال بالخادم" : "Could not reach server");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (otp.length < 6) {
      setError(lang === "ar" ? "أدخل الرمز المكون من 6 أرقام" : "Enter the 6-digit code");
      return;
    }

    const fullContact =
      channel === "phone" ? `${country.dial}${contact.replace(/^0+/, "")}` : contact;

    setLoading(true);
    try {
      const res = await fetch("/api/community/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          contact: fullContact,
          channel,
          otp,
          verificationId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed");
        return;
      }
      setMemberName(data.memberName || "Member");
      setStage("done");
      setTimeout(() => {
        router.push(data.next);
      }, 1500);
    } catch {
      setError(lang === "ar" ? "تعذر الاتصال بالخادم" : "Could not reach server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <PageHeader
        title={lang === "ar" ? "تسجيل الدخول" : "Sign in"}
        subtitle={
          lang === "ar"
            ? "ادخل ببريدك أو هاتفك — سنرسل لك رمز تحقق. إذا لم يكن لديك حساب، ننشئه لك تلقائيًا."
            : "Enter your email or phone — we'll send a verification code. If you don't have an account, we'll create one for you."
        }
        crumbs={[{ label: lang === "ar" ? "الدخول" : "Login" }]}
      />

      <div className="mx-auto w-full max-w-md px-4 md:px-6 py-8 flex-1">
        <div className="rounded-2xl bg-card border border-border shadow-premium p-6">
          {stage === "done" ? (
            <div className="text-center py-6">
              <CheckCircle2 className="h-16 w-16 text-emerald-700 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-foreground mb-1">
                {lang === "ar" ? "تم تسجيل الدخول بنجاح!" : "Logged in successfully!"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {lang === "ar" ? `مرحبًا ${memberName}، جارٍ توجيهك…` : `Welcome ${memberName}, redirecting…`}
              </p>
            </div>
          ) : (
            <>
              {stage === "send" && (
                <>
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    <button
                      type="button"
                      onClick={() => setChannel("email")}
                      className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition-premium ${
                        channel === "email" ? "bg-emerald-700 text-white shadow-premium" : "bg-secondary text-foreground hover:bg-emerald-50"
                      }`}
                    >
                      <Mail className="h-4 w-4" />
                      {lang === "ar" ? "البريد" : "Email"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannel("phone")}
                      className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition-premium ${
                        channel === "phone" ? "bg-emerald-700 text-white shadow-premium" : "bg-secondary text-foreground hover:bg-emerald-50"
                      }`}
                    >
                      <Phone className="h-4 w-4" />
                      {lang === "ar" ? "الهاتف" : "Phone"}
                    </button>
                  </div>

                  <form onSubmit={handleSend} className="space-y-4">
                    {channel === "email" ? (
                      <div>
                        <label className="text-xs font-semibold text-foreground mb-1.5 block">
                          {lang === "ar" ? "البريد الإلكتروني" : "Email address"}
                        </label>
                        <Input type="email" dir="ltr" placeholder="you@example.com" value={contact} onChange={(e) => setContact(e.target.value)} className="rounded-xl" required />
                      </div>
                    ) : (
                      <div>
                        <label className="text-xs font-semibold text-foreground mb-1.5 block">
                          {lang === "ar" ? "رقم الهاتف" : "Phone number"}
                        </label>
                        <div className="flex gap-2">
                          <div onClick={(e) => { e.stopPropagation(); setCountryOpen((v) => !v); }} className="relative inline-flex items-center gap-1 rounded-xl border border-input bg-background px-3 h-10 text-sm font-medium cursor-pointer hover:bg-secondary/40 transition-premium flex-shrink-0">
                            <span className="text-lg">{country.iso2 === "US" ? "🇺🇸" : country.iso2 === "SD" ? "🇸🇩" : country.iso2 === "SA" ? "🇸🇦" : "🌍"}</span>
                            <span dir="ltr">{country.dial}</span>
                            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                            {countryOpen && (
                              <div className="absolute z-[100] top-full mt-1 start-0 max-w-[280px] w-[260px] rounded-xl bg-popover border border-border shadow-premium-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                                <div className="p-2 border-b border-border">
                                  <Input placeholder={lang === "ar" ? "ابحث عن دولة…" : "Search country…"} value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} className="h-8 text-xs" onClick={(e) => e.stopPropagation()} />
                                </div>
                                <div className="max-h-48 overflow-y-auto">
                                  {countries
                                    .filter((c) => !countrySearch || c.en.toLowerCase().includes(countrySearch.toLowerCase()) || c.ar.includes(countrySearch))
                                    .map((c) => (
                                      <div key={c.iso2} onClick={(e) => { e.stopPropagation(); setCountry(c); setCountryOpen(false); setCountrySearch(""); }} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-secondary cursor-pointer text-start text-sm">
                                        <span className="text-lg">{c.iso2 === "US" ? "🇺🇸" : c.iso2 === "SD" ? "🇸🇩" : c.iso2 === "SA" ? "🇸🇦" : "🌍"}</span>
                                        <span className="flex-1">{lang === "ar" ? c.ar : c.en}</span>
                                        <span dir="ltr" className="text-muted-foreground text-xs">{c.dial}</span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <Input type="tel" dir="ltr" placeholder="(555) 123-4567" value={contact} onChange={(e) => setContact(e.target.value)} className="rounded-xl flex-1" required />
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    <Button type="submit" disabled={loading} className="w-full bg-emerald-700 hover:bg-emerald-deep text-white rounded-xl h-11 font-bold">
                      {loading ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                          {lang === "ar" ? "جارٍ الإرسال…" : "Sending…"}
                        </span>
                      ) : (
                        <>
                          {lang === "ar" ? "إرسال رمز التحقق" : "Send verification code"}
                          <Arrow className="h-4 w-4 ms-1.5" />
                        </>
                      )}
                    </Button>
                  </form>
                </>
              )}

              {stage === "verify" && (
                <>
                  <div className="rounded-xl bg-secondary/40 border border-border/60 p-3 mb-4">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      {channel === "email" ? (lang === "ar" ? "البريد" : "Email") : (lang === "ar" ? "الهاتف" : "Phone")}
                    </div>
                    <div dir="ltr" className="text-sm font-bold text-foreground">{maskedDestination}</div>
                    {isLogin && (
                      <div className="mt-1 text-[10px] text-emerald-700 font-semibold inline-flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        {lang === "ar" ? "حساب موجود — تسجيل دخول" : "Existing account — logging in"}
                      </div>
                    )}
                  </div>

                  {/* Info: code sent */}
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 mb-4 text-xs text-emerald-700 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>
                      {channel === "email"
                        ? (lang === "ar" ? "تم إرسال رمز التحقق إلى بريدك الإلكتروني." : "Verification code sent to your email.")
                        : (lang === "ar" ? "تم إرسال رمز التحقق إلى هاتفك." : "Verification code sent to your phone.")}
                    </span>
                  </div>

                  <form onSubmit={handleVerify} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1.5 block">
                        {lang === "ar" ? "رمز التحقق (6 أرقام)" : "Verification code (6 digits)"}
                      </label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        dir="ltr"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        className="rounded-xl text-center text-2xl font-bold tracking-widest h-14"
                        autoFocus
                      />
                    </div>

                    {error && (
                      <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    <Button type="submit" disabled={loading || otp.length < 6} className="w-full bg-emerald-700 hover:bg-emerald-deep text-white rounded-xl h-11 font-bold">
                      {loading ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                          {lang === "ar" ? "جارٍ التحقق…" : "Verifying…"}
                        </span>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4 me-1.5" />
                          {lang === "ar" ? "تأكيد ودخول" : "Confirm & sign in"}
                        </>
                      )}
                    </Button>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {lang === "ar" ? "ينتهي خلال" : "Expires in"} <span className="tabular-nums font-bold" dir="ltr">{Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}</span>
                      </span>
                      <button type="button" onClick={() => setStage("send")} className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-deep">
                        <RefreshCw className="h-3.5 w-3.5" />
                        {lang === "ar" ? "تغيير البريد/الهاتف" : "Change contact"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </>
          )}

          {/* Trust signals */}
          <div className="mt-6 pt-4 border-t border-border space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5 text-emerald-700" />
              <span>{lang === "ar" ? "تشفير OTP لمرة واحدة — لا يُحفظ كنص صريح" : "Single-use OTP — never stored as plain text"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe2 className="h-3.5 w-3.5 text-emerald-700" />
              <span>{lang === "ar" ? "دعم دولي لأرقام الهاتف" : "International phone number support"}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              {lang === "ar" ? "ليس لديك حساب؟ " : "Don't have an account? "}
              <a href="/auth/register" className="font-bold text-emerald-700 hover:text-emerald-deep">
                {lang === "ar" ? "أنشئ حسابًا جديدًا" : "Create a new account"}
              </a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
