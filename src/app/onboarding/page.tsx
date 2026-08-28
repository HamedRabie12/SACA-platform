"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { TopNav } from "@/components/layout/top-nav";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, ArrowRight, User, MapPin, Heart, Briefcase, Bell, Camera,
  CheckCircle2, Sparkles,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type USStateLite = { code: string; nameEn: string; nameAr: string };
type USCityLite = { nameEn: string; nameAr: string };

const INTERESTS = [
  { ar: "ثقافة وفنون", en: "Culture & Arts", icon: "🎭" },
  { ar: "تعليم", en: "Education", icon: "📚" },
  { ar: "أعمال ومشاريع", en: "Business", icon: "💼" },
  { ar: "رياضة", en: "Sports", icon: "⚽" },
  { ar: "دين وروحانيات", en: "Religion", icon: "🕌" },
  { ar: "تكنولوجيا", en: "Technology", icon: "💻" },
  { ar: "صحة", en: "Health", icon: "❤️" },
  { ar: "أسرة وأطفال", en: "Family & Kids", icon: "👨‍👩‍👧" },
  { ar: "شباب", en: "Youth", icon: "🌟" },
  { ar: "كبار السن", en: "Seniors", icon: "👴" },
];

const STEPS = [
  { key: "name", icon: User, ar: "الاسم", en: "Name" },
  { key: "location", icon: MapPin, ar: "الموقع", en: "Location" },
  { key: "interests", icon: Heart, ar: "الاهتمامات", en: "Interests" },
  { key: "profession", icon: Briefcase, ar: "المجال المهني", en: "Profession" },
  { key: "notifications", icon: Bell, ar: "الإشعارات", en: "Notifications" },
  { key: "avatar", icon: Camera, ar: "الصورة", en: "Avatar" },
];

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const { lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  const memberId = sp.get("memberId") ?? "";

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    stateCode: "",
    cityName: "",
    interests: [] as string[],
    profession: "",
    bio: "",
    notifEmail: true,
    notifPush: true,
    notifSms: false,
    avatarUrl: "",
  });

  const [states, setStates] = useState<USStateLite[]>([]);
  const [cities, setCities] = useState<USCityLite[]>([]);

  useEffect(() => {
    fetch("/api/community/states")
      .then((r) => r.json())
      .then((d) => setStates(d.states ?? []))
      .catch(() => {});
  }, []);

  // When state changes, load its cities.
  const stateCode = form.stateCode;
  useEffect(() => {
    if (!stateCode) return;
    let alive = true;
    // Set loading inside the promise chain so we don't setState synchronously during the effect body.
    fetch(`/api/community/states/${stateCode}`)
      .then((r) => r.json())
      .then((d) => { if (alive) { setCities(d.state?.cities ?? []); setLoading(false); } })
      .catch(() => { if (alive) { setCities([]); setLoading(false); } });
    // Initialize loading state via microtask to avoid synchronous setState in effect body
    Promise.resolve().then(() => { if (alive) setLoading(true); });
    return () => { alive = false; };
  }, [stateCode]);

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleSubmit();
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await fetch("/api/community/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          name: form.name,
          stateCode: form.stateCode,
          cityName: form.cityName,
          interests: form.interests,
          profession: form.profession,
          bio: form.bio,
        }),
      });
    } catch {
      // ignore — still navigate to welcome
    }
    router.push(`/onboarding/done?name=${encodeURIComponent(form.name)}`);
  }

  function toggleInterest(it: string) {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(it)
        ? f.interests.filter((x) => x !== it)
        : [...f.interests, it],
    }));
  }

  const currentStep = STEPS[step];
  const StepIcon = currentStep.icon;
  const canProceed =
    step === 0 ? form.name.trim().length >= 2 :
    step === 1 ? !!form.stateCode :
    step === 2 ? form.interests.length > 0 :
    step === 5 ? true :
    true;

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <PageHeader
        title={lang === "ar" ? "إكمال ملفك الشخصي" : "Complete your profile"}
        subtitle={
          lang === "ar"
            ? "خطوات سريعة لمساعدتنا على تخصيص تجربتك داخل منصة SACA."
            : "A few quick steps to personalize your SACA experience."
        }
        crumbs={[{ label: lang === "ar" ? "الترحيب" : "Onboarding" }]}
      />

      <div className="mx-auto w-full max-w-2xl px-4 md:px-6 py-6 flex-1">
        {/* Progress */}
        <div className="flex items-center justify-between mb-6">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2 flex-1">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full transition-premium ${
                i < step ? "bg-emerald-700 text-white" :
                i === step ? "bg-emerald-700 text-white ring-4 ring-emerald-100" :
                "bg-secondary text-muted-foreground"
              }`}>
                {i < step ? <CheckCircle2 className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 rounded-full ${i < step ? "bg-emerald-700" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-card border border-border shadow-premium p-6 min-h-[320px]">
          {/* Step 0: Name */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">{lang === "ar" ? "ما اسمك؟" : "What's your name?"}</h3>
                <p className="text-sm text-muted-foreground">{lang === "ar" ? "سيظهر اسمك في الملف الشخصي للجالية." : "This will be shown on your community profile."}</p>
              </div>
              <Input
                autoFocus
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder={lang === "ar" ? "مثال: أحمد محمد" : "e.g., Ahmed Mohamed"}
                className="rounded-xl h-12 text-base"
              />
            </div>
          )}

          {/* Step 1: Location */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">{lang === "ar" ? "في أي ولاية تقيم؟" : "Where do you live in the United States?"}</h3>
                <p className="text-sm text-muted-foreground">{lang === "ar" ? "الولاية التي أفاد بها العضو — تُستخدم لتخصيص المحتوى فقط." : "Member-reported state — used only to personalize your feed."}</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <select
                  value={form.stateCode}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, stateCode: e.target.value, cityName: "" }));
                    setCities([]);
                  }}
                  className="h-11 rounded-xl border border-input bg-background px-3 text-sm font-medium"
                >
                  <option value="">{lang === "ar" ? "اختر الولاية…" : "Select a state…"}</option>
                  {states.map((s) => (
                    <option key={s.code} value={s.code}>
                      {lang === "ar" ? s.nameAr : s.nameEn} ({s.code})
                    </option>
                  ))}
                </select>
                {loading ? (
                  <Skeleton className="h-11 w-full rounded-xl" />
                ) : form.stateCode && cities.length > 0 ? (
                  <select
                    value={form.cityName}
                    onChange={(e) => setForm((f) => ({ ...f, cityName: e.target.value }))}
                    className="h-11 rounded-xl border border-input bg-background px-3 text-sm font-medium"
                  >
                    <option value="">{lang === "ar" ? "اختر المدينة (اختياري)…" : "Select city (optional)…"}</option>
                    {cities.map((c) => (
                      <option key={c.nameEn} value={c.nameEn}>
                        {lang === "ar" ? c.nameAr : c.nameEn}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>
            </div>
          )}

          {/* Step 2: Interests */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">{lang === "ar" ? "ما الذي يهمك؟" : "What are you interested in?"}</h3>
                <p className="text-sm text-muted-foreground">{lang === "ar" ? "اختر اهتماماتك — سنوصي بفعاليات ومنظمات تناسبك." : "Pick a few — we'll suggest matching events and organizations."}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {INTERESTS.map((it) => {
                  const sel = form.interests.includes(it.en);
                  return (
                    <button
                      key={it.en}
                      onClick={() => toggleInterest(it.en)}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-premium ${
                        sel ? "bg-emerald-700 text-white shadow-premium" : "bg-secondary text-foreground hover:bg-emerald-50"
                      }`}
                    >
                      <span>{it.icon}</span>
                      <span>{lang === "ar" ? it.ar : it.en}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Profession */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">{lang === "ar" ? "مجالك المهني (اختياري)" : "Profession (optional)"}</h3>
                <p className="text-sm text-muted-foreground">{lang === "ar" ? "ساعدنا على ربطك بمهنيين في مجالك." : "Help us connect you with peers in your field."}</p>
              </div>
              <Input
                autoFocus
                value={form.profession}
                onChange={(e) => setForm((f) => ({ ...f, profession: e.target.value }))}
                placeholder={lang === "ar" ? "مثال: مهندس برمجيات" : "e.g., Software engineer"}
                className="rounded-xl h-12"
              />
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">{lang === "ar" ? "نبذة قصيرة (اختياري)" : "Short bio (optional)"}</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  placeholder={lang === "ar" ? "أخبر المجتمع عن نفسك بجملتين…" : "Tell the community about yourself in a sentence or two…"}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-none"
                  maxLength={280}
                />
                <div className="text-[10px] text-muted-foreground mt-1 text-end">{form.bio.length}/280</div>
              </div>
            </div>
          )}

          {/* Step 4: Notifications */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">{lang === "ar" ? "إعدادات الإشعارات" : "Notification preferences"}</h3>
                <p className="text-sm text-muted-foreground">{lang === "ar" ? "اختر كيف تريد أن نُبقيك على اطلاع." : "Choose how you'd like us to keep you in the loop."}</p>
              </div>
              <div className="space-y-2">
                {[
                  { key: "notifEmail", ar: "البريد الإلكتروني", en: "Email", desc_ar: "تنبيهات حول الاجتماعات والفعاليات المهمة", desc_en: "Alerts about important meetings and events" },
                  { key: "notifPush", ar: "إشعارات الويب", en: "Web push", desc_ar: "إشعارات فورية على متصفحك", desc_en: "Instant notifications in your browser" },
                  { key: "notifSms", ar: "الرسائل النصية", en: "SMS", desc_ar: "تنبيهات عاجلة فقط (قد تُطبّق رسوم)", desc_en: "Urgent alerts only (carrier fees may apply)" },
                ].map((opt) => (
                  <label key={opt.key} className="flex items-start gap-3 rounded-xl border border-border/60 p-3 cursor-pointer hover:bg-secondary/30 transition-premium">
                    <input
                      type="checkbox"
                      checked={form[opt.key as "notifEmail" | "notifPush" | "notifSms"]}
                      onChange={(e) => setForm((f) => ({ ...f, [opt.key]: e.target.checked }))}
                      className="mt-0.5 h-4 w-4 rounded border-border text-emerald-700 focus:ring-emerald-700"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-foreground">{lang === "ar" ? opt.ar : opt.en}</div>
                      <div className="text-xs text-muted-foreground">{lang === "ar" ? opt.desc_ar : opt.desc_en}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Avatar */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">{lang === "ar" ? "صورتك الشخصية (اختياري)" : "Profile photo (optional)"}</h3>
                <p className="text-sm text-muted-foreground">{lang === "ar" ? "يمكنك إضافتها الآن أو لاحقًا من إعدادات الحساب." : "You can add it now or later from your account settings."}</p>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 py-6 border-2 border-dashed border-border rounded-xl">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-700 to-emerald-deep flex items-center justify-center text-white text-3xl font-bold ring-4 ring-emerald-50 overflow-hidden">
                  {form.avatarUrl ? <img src={form.avatarUrl} alt="" className="h-full w-full object-cover" /> : (form.name ? form.name.charAt(0) : "?")}
                </div>
                <label className="w-full max-w-md text-xs font-semibold text-foreground">
                  {lang === "ar" ? "رابط صورة الملف الشخصي" : "Profile image URL"}
                  <input value={form.avatarUrl ?? ""} onChange={(e)=>setForm((f)=>({...f,avatarUrl:e.target.value}))} className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" placeholder="https://..." inputMode="url" />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="mt-5 flex items-center justify-between">
          <Button variant="ghost" onClick={back} disabled={step === 0} className="rounded-xl">
            <Arrow className="h-4 w-4 me-1.5 rtl:rotate-180" />
            {lang === "ar" ? "السابق" : "Back"}
          </Button>
          <span className="text-xs text-muted-foreground">{step + 1} / {STEPS.length}</span>
          <Button
            onClick={next}
            disabled={!canProceed || submitting}
            className="bg-emerald-700 hover:bg-emerald-deep text-white rounded-xl"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                {lang === "ar" ? "جارٍ الحفظ…" : "Saving…"}
              </span>
            ) : step === STEPS.length - 1 ? (
              <>
                <Sparkles className="h-4 w-4 me-1.5" />
                {lang === "ar" ? "إكمال" : "Finish"}
              </>
            ) : (
              <>
                {lang === "ar" ? "التالي" : "Next"}
                <Arrow className="h-4 w-4 ms-1.5" />
              </>
            )}
          </Button>
        </div>
      </div>

      <Footer />
    </main>
  );
}
