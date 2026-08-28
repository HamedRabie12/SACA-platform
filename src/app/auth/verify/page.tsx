"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, RefreshCw, ShieldCheck, Clock, AlertCircle, Edit3, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyContent />
    </Suspense>
  );
}

function VerifyContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const { lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  const verificationId = sp.get("verificationId") ?? "";
  const channel = (sp.get("channel") as "email" | "phone") ?? "email";
  const destination = sp.get("destination") ?? "";
  const maskedDestination = sp.get("maskedDestination") ?? destination;
  const expiresIn = sp.get("expiresIn") ?? "";

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(300); // 5 min
  const [resendIn, setResendIn] = useState(60);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const i = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(i);
  }, [secondsLeft]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const i = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(i);
  }, [resendIn]);

  // Auto-focus first input
  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  function handleChange(idx: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    setError(null);
    // Auto-advance
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) inputs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) inputs.current[idx + 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    if (pasted.length < 6) inputs.current[pasted.length]?.focus();
    else inputs.current[5]?.blur();
  }

  async function handleVerify() {
    setError(null);
    const otp = digits.join("");
    if (otp.length < 6) {
      setError(lang === "ar" ? "أدخل الرمز المكون من 6 أرقام" : "Enter the 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/community/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationId, otp, contact: destination, channel }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed");
        return;
      }
      setSuccess(true);
      // Redirect to onboarding after 1.5s
      setTimeout(() => {
        router.push(`/onboarding?memberId=${data.memberId}`);
      }, 1500);
    } catch {
      setError(lang === "ar" ? "تعذر الاتصال بالخادم" : "Could not reach server");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendIn > 0) return;
    setError(null);
    setDigits(Array(6).fill(""));
    setResendIn(60);
    try {
      const res = await fetch("/api/community/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: destination, channel }),
      });
      const data = await res.json();
      if (data.verificationId) {
        router.replace(
          `/auth/verify?verificationId=${data.verificationId}&channel=${channel}&destination=${encodeURIComponent(data.destination)}&maskedDestination=${encodeURIComponent(data.maskedDestination)}&expiresIn=${encodeURIComponent(data.expiresAt)}`
        );
      }
    } catch {
      setError(lang === "ar" ? "تعذّر إعادة الإرسال" : "Could not resend");
    }
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <PageHeader
        title={lang === "ar" ? "تحقق من الحساب" : "Verify your account"}
        subtitle={
          lang === "ar"
            ? "أدخل رمز التحقق المرسل إلى"
            : "Enter the verification code sent to"
        }
        crumbs={[{ label: lang === "ar" ? "التحقق" : "Verify" }]}
      />

      <div className="mx-auto w-full max-w-md px-4 md:px-6 py-8 flex-1">
        <div className="rounded-2xl bg-card border border-border shadow-premium p-6">
          {/* Destination display */}
          <div className="rounded-xl bg-secondary/40 border border-border/60 p-4 mb-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                {channel === "email" ? (lang === "ar" ? "البريد" : "Email") : (lang === "ar" ? "الهاتف" : "Phone")}
              </span>
              <a href="/auth/register" className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-deep">
                <Edit3 className="h-2.5 w-2.5" />
                {lang === "ar" ? "تعديل" : "Edit"}
              </a>
            </div>
            <div dir="ltr" className="text-sm font-bold text-foreground text-start">
              {maskedDestination}
            </div>
          </div>

          {/* Info: code sent */}
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 mb-4 text-xs text-emerald-700 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
            <span>
              {channel === "email"
                ? (lang === "ar" ? "تم إرسال رمز التحقق إلى بريدك الإلكتروني. تحقق من صندوق الوارد." : "A verification code has been sent to your email. Check your inbox.")
                : (lang === "ar" ? "تم إرسال رمز التحقق إلى هاتفك." : "A verification code has been sent to your phone.")}
            </span>
          </div>

          {/* OTP inputs */}
          {success ? (
            <div className="text-center py-6">
              <CheckCircle2 className="h-16 w-16 text-emerald-700 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-foreground mb-1">
                {lang === "ar" ? "تم التحقق بنجاح!" : "Verified successfully!"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {lang === "ar" ? "جارٍ توجيهك لإكمال ملفك الشخصي…" : "Redirecting to complete your profile…"}
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-center gap-2 mb-5" onPaste={handlePaste} dir="ltr">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { if (el) inputs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    className="h-14 w-12 rounded-xl border-2 border-border bg-background text-center text-2xl font-bold text-foreground focus:border-emerald-700 focus:outline-none transition-premium"
                  />
                ))}
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 mb-3 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                onClick={handleVerify}
                disabled={loading || digits.some((d) => !d)}
                className="w-full bg-emerald-700 hover:bg-emerald-deep text-white rounded-xl h-11 font-bold mb-3"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    {lang === "ar" ? "جارٍ التحقق…" : "Verifying…"}
                  </span>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 me-1.5" />
                    {lang === "ar" ? "تأكيد الرمز" : "Confirm code"}
                  </>
                )}
              </Button>

              {/* Timer */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {lang === "ar" ? "ينتهي خلال" : "Expires in"} <span className="tabular-nums font-bold" dir="ltr">{mm}:{ss}</span>
                </span>
                <button
                  onClick={handleResend}
                  disabled={resendIn > 0}
                  className={`inline-flex items-center gap-1 font-bold ${
                    resendIn > 0 ? "text-muted-foreground/50 cursor-not-allowed" : "text-emerald-700 hover:text-emerald-deep"
                  }`}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${resendIn > 0 ? "" : "animate-pulse"}`} />
                  {resendIn > 0 ? (
                    <span>{lang === "ar" ? `إعادة الإرسال خلال ${resendIn}ث` : `Resend in ${resendIn}s`}</span>
                  ) : (
                    <span>{lang === "ar" ? "إعادة إرسال الرمز" : "Resend code"}</span>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Security note */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-[10px] text-muted-foreground leading-relaxed text-center">
              {lang === "ar"
                ? "لأسباب أمنية، لا يُحفظ الرمز في السجلات، ويعمل لمرة واحدة فقط. عند إعادة الإرسال يُلغى الرمز القديم ويُولّد رمز جديد."
                : "For security, the code is never logged, single-use only. Resending generates a new code and invalidates the old one."}
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
