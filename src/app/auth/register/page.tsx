"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type Channel = "email" | "phone";

export default function RegisterPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  const [channel, setChannel] = useState<Channel>("email");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countryOpen, setCountryOpen] = useState(false);
  const [country, setCountry] = useState<{ iso2: string; ar: string; en: string; dial: string }>({
    iso2: "US",
    ar: "الولايات المتحدة",
    en: "United States",
    dial: "+1",
  });
  const [countries, setCountries] = useState<typeof country[]>([]);
  const [countrySearch, setCountrySearch] = useState("");

  // Lazy load country list on first phone click
  async function loadCountries() {
    if (countries.length > 0) return;
    try {
      const res = await fetch("/api/community/home");
      // We don't have a separate countries endpoint yet, so use a hardcoded short list here.
      // (Database has these — admin can extend via portal.)
      const fallback = [
        { iso2: "US", ar: "الولايات المتحدة", en: "United States", dial: "+1" },
        { iso2: "SD", ar: "السودان", en: "Sudan", dial: "+249" },
        { iso2: "SA", ar: "السعودية", en: "Saudi Arabia", dial: "+966" },
        { iso2: "AE", ar: "الإمارات", en: "United Arab Emirates", dial: "+971" },
        { iso2: "EG", ar: "مصر", en: "Egypt", dial: "+20" },
        { iso2: "QA", ar: "قطر", en: "Qatar", dial: "+974" },
        { iso2: "KW", ar: "الكويت", en: "Kuwait", dial: "+965" },
        { iso2: "BH", ar: "البحرين", en: "Bahrain", dial: "+973" },
        { iso2: "OM", ar: "عمان", en: "Oman", dial: "+968" },
        { iso2: "JO", ar: "الأردن", en: "Jordan", dial: "+962" },
        { iso2: "GB", ar: "المملكة المتحدة", en: "United Kingdom", dial: "+44" },
        { iso2: "CA", ar: "كندا", en: "Canada", dial: "+1" },
        { iso2: "AU", ar: "أستراليا", en: "Australia", dial: "+61" },
        { iso2: "DE", ar: "ألمانيا", en: "Germany", dial: "+49" },
        { iso2: "FR", ar: "فرنسا", en: "France", dial: "+33" },
        { iso2: "TR", ar: "تركيا", en: "Turkey", dial: "+90" },
      ];
      setCountries(fallback);
      void res;
    } catch {
      // ignore
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const fullContact =
      channel === "phone"
        ? `${country.dial}${contact.replace(/^0+/, "")}`
        : contact;

    if (!fullContact) {
      setError(lang === "ar" ? "يرجى إدخال البريد أو الهاتف" : "Please enter email or phone");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/community/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: fullContact, channel }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      // Move to verification page — NO devOtp in URL
      const params = new URLSearchParams({
        verificationId: data.verificationId,
        channel,
        destination: data.destination,
        maskedDestination: data.maskedDestination,
        expiresIn: data.expiresAt,
      });
      router.push(`/auth/verify?${params.toString()}`);
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
        title={lang === "ar" ? "إنشاء حساب جديد" : "Create your account"}
        subtitle={
          lang === "ar"
            ? "اختر طريقة التسجيل — سنرسل لك رمز تحقق لمرة واحدة."
            : "Choose a registration method — we'll send you a one-time verification code."
        }
        crumbs={[{ label: lang === "ar" ? "التسجيل" : "Register" }]}
      />

      <div className="mx-auto w-full max-w-md px-4 md:px-6 py-8 flex-1">
        <div className="rounded-2xl bg-card border border-border shadow-premium p-6">
          {/* Channel selector */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <button
              type="button"
              onClick={() => setChannel("email")}
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition-premium ${
                channel === "email"
                  ? "bg-emerald-700 text-white shadow-premium"
                  : "bg-secondary text-foreground hover:bg-emerald-50"
              }`}
            >
              <Mail className="h-4 w-4" />
              {lang === "ar" ? "البريد" : "Email"}
            </button>
            <button
              type="button"
              onClick={() => { setChannel("phone"); loadCountries(); }}
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition-premium ${
                channel === "phone"
                  ? "bg-emerald-700 text-white shadow-premium"
                  : "bg-secondary text-foreground hover:bg-emerald-50"
              }`}
            >
              <Phone className="h-4 w-4" />
              {lang === "ar" ? "الهاتف" : "Phone"}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {channel === "email" ? (
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">
                  {lang === "ar" ? "البريد الإلكتروني" : "Email address"}
                </label>
                <Input
                  type="email"
                  dir="ltr"
                  placeholder="you@example.com"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="rounded-xl"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">
                  {lang === "ar" ? "رقم الهاتف" : "Phone number"}
                </label>
                <div className="flex gap-2">
                  {/* Country picker — fixed: stops click propagation to prevent dropdown from closing */}
                  <div
                    onClick={(e) => { e.stopPropagation(); setCountryOpen((v) => !v); }}
                    className="relative inline-flex items-center gap-1 rounded-xl border border-input bg-background px-3 h-10 text-sm font-medium cursor-pointer hover:bg-secondary/40 transition-premium flex-shrink-0"
                  >
                    <span className="text-lg">
                      {country.iso2 === "US" ? "🇺🇸" : country.iso2 === "SD" ? "🇸🇩" : country.iso2 === "SA" ? "🇸🇦" : country.iso2 === "AE" ? "🇦🇪" : country.iso2 === "EG" ? "🇪🇬" : country.iso2 === "GB" ? "🇬🇧" : "🌍"}
                    </span>
                    <span dir="ltr">{country.dial}</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                    {countryOpen && (
                      <div
                        className="absolute z-[100] top-full mt-1 start-0 max-w-[280px] w-[260px] rounded-xl bg-popover border border-border shadow-premium-lg overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-2 border-b border-border">
                          <Input
                            placeholder={lang === "ar" ? "ابحث عن دولة…" : "Search country…"}
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            className="h-8 text-xs"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {countries
                            .filter((c) =>
                              !countrySearch ||
                              c.en.toLowerCase().includes(countrySearch.toLowerCase()) ||
                              c.ar.includes(countrySearch) ||
                              c.dial.includes(countrySearch)
                            )
                            .map((c) => (
                              <div
                                key={c.iso2}
                                onClick={(e) => { e.stopPropagation(); setCountry(c); setCountryOpen(false); setCountrySearch(""); }}
                                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-secondary cursor-pointer text-start text-sm"
                              >
                                <span className="text-lg">
                                  {c.iso2 === "US" ? "🇺🇸" : c.iso2 === "SD" ? "🇸🇩" : c.iso2 === "SA" ? "🇸🇦" : c.iso2 === "AE" ? "🇦🇪" : c.iso2 === "EG" ? "🇪🇬" : c.iso2 === "GB" ? "🇬🇧" : "🌍"}
                                </span>
                                <span className="flex-1">{lang === "ar" ? c.ar : c.en}</span>
                                <span dir="ltr" className="text-muted-foreground text-xs">{c.dial}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <Input
                    type="tel"
                    dir="ltr"
                    placeholder="(555) 123-4567"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="rounded-xl flex-1"
                    required
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  {lang === "ar" ? "سيتم توحيد الرقم إلى صيغة E.164 قبل الإرسال." : "Number will be normalized to E.164 before sending."}
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-deep text-white rounded-xl h-11 font-bold"
            >
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

          {/* OAuth — Google Sign-In (real) */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-center text-muted-foreground mb-3">
              {lang === "ar" ? "أو سجّل عبر" : "Or sign up with"}
            </p>
            <div className="grid grid-cols-1 gap-2">
              <a
                href="/api/auth/signin/google"
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-premium"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                {lang === "ar" ? "التسجيل عبر Google" : "Sign up with Google"}
              </a>
            </div>
            {!process.env.NEXT_PUBLIC_GOOGLE_CONFIGURED && (
              <p className="text-[10px] text-center text-muted-foreground mt-2">
                {lang === "ar"
                  ? "يتطلب إعداد GOOGLE_CLIENT_ID في متغيرات البيئة"
                  : "Requires GOOGLE_CLIENT_ID in env vars"}
              </p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
