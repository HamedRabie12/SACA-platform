"use client";

import { useState } from "react";
import { Flag, X, Send, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";

const REASONS_AR = [
  "محتوى غير لائق",
  "معلومات مضللة",
  "انتهاك الخصوصية",
  "محتوى مسيء",
  "بريد مزعج",
  "أخرى",
];
const REASONS_EN = [
  "Inappropriate content",
  "Misinformation",
  "Privacy violation",
  "Abusive content",
  "Spam",
  "Other",
];

export function ReportContentModal({
  open,
  onClose,
  targetType,
  targetId,
  targetName,
}: {
  open: boolean;
  onClose: () => void;
  targetType: string;
  targetId: string;
  targetName: string;
}) {
  const { lang } = useLanguage();
  const reasons = lang === "ar" ? REASONS_AR : REASONS_EN;
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit() {
    if (!reason) {
      setError(lang === "ar" ? "اختر سبب البلاغ" : "Select a reason");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const fullReason = details ? `${reason} — ${details}` : reason;
      const res = await fetch("/api/community/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporter: "user-session",
          targetType,
          targetId,
          reason: fullReason,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setReason("");
        setDetails("");
      }, 1500);
    } catch {
      setError(lang === "ar" ? "تعذّر إرسال البلاغ" : "Could not submit report");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-md bg-card rounded-t-3xl md:rounded-3xl shadow-premium-lg overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <Flag className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-sm">{lang === "ar" ? "الإبلاغ عن المحتوى" : "Report content"}</h3>
          </div>
          <button onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 mb-3">
              <Send className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-foreground mb-1">
              {lang === "ar" ? "تم استلام بلاغك" : "Report received"}
            </h4>
            <p className="text-xs text-muted-foreground">
              {lang === "ar"
                ? "سيتم مراجعته من فريق الإدارة في أقرب وقت."
                : "It will be reviewed by the admin team shortly."}
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Target */}
            <div className="rounded-lg bg-secondary/40 px-3 py-2 text-xs">
              <div className="text-muted-foreground">{lang === "ar" ? "الكيان المُبلَّغ عنه:" : "Reported:"}</div>
              <div className="font-bold text-foreground truncate">{targetName}</div>
            </div>

            {/* Reason */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-2 block">
                {lang === "ar" ? "سبب البلاغ" : "Reason"}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {reasons.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition-premium ${
                      reason === r
                        ? "bg-red-600 text-white"
                        : "bg-secondary text-foreground hover:bg-red-50 hover:text-red-600"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                {lang === "ar" ? "تفاصيل إضافية (اختياري)" : "Additional details (optional)"}
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={lang === "ar" ? "أضف أي تفاصيل قد تساعد الفريق…" : "Add any details that might help…"}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-none"
                maxLength={500}
              />
              <div className="text-[10px] text-muted-foreground mt-1 text-end">{details.length}/500</div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" onClick={onClose} className="rounded-xl">
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !reason}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    {lang === "ar" ? "جارٍ الإرسال…" : "Sending…"}
                  </span>
                ) : (
                  <>
                    <Flag className="h-4 w-4 me-1.5" />
                    {lang === "ar" ? "إرسال البلاغ" : "Submit report"}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
