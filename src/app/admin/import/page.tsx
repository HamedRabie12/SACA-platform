"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { AdminGuard } from "@/components/layout/admin-guard";
import { Button } from "@/components/ui/button";
import {
  Upload, FileSpreadsheet, FileJson, Database, ShieldCheck,
  AlertCircle, CheckCircle2, ArrowLeft, ArrowRight, FileUp,
  Trash2, Eye,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type ImportRow = {
  rowNum: number;
  name: string;
  type: string;
  state: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  status: "valid" | "warning" | "error";
  issue?: string;
};

export default function AdminImportPage() {
  const { lang } = useLanguage();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  const [step, setStep] = useState<"upload" | "review" | "done">("upload");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFile(file: File) {
    const text = await file.text();
    const name = file.name.toLowerCase();
    let parsedRows: Array<Record<string, string>> = [];
    if (name.endsWith(".json")) {
      const json = JSON.parse(text);
      parsedRows = Array.isArray(json) ? json : Array.isArray(json.rows) ? json.rows : [];
    } else if (name.endsWith(".csv")) {
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (!lines.length) throw new Error("CSV file is empty");
      const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
      parsedRows = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
        return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
      });
    } else {
      throw new Error("Use CSV or JSON. Convert Excel to CSV before import to keep the import path dependency-light and deterministic.");
    }
    const normalized = parsedRows.map((r, i) => ({ rowNum: i + 2, name: String(r.name ?? ""), type: String(r.type ?? "association"), state: String(r.state ?? ""), city: String(r.city ?? ""), address: String(r.address ?? ""), phone: String(r.phone ?? ""), email: String(r.email ?? ""), status: "valid" as const }));
    setFileName(file.name);
    setRows(normalized);
    setStep("review");
  }

  async function submitImport() {
    const clean = rows.filter((r) => r.status === "valid").map(({ rowNum, status, issue, ...row }) => row);
    const response = await fetch("/api/admin/import/organizations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ rows: clean }) });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || "Import failed");
    setStep("done");
  }

  const validCount = rows.filter((r) => r.status === "valid").length;
  const warnCount = rows.filter((r) => r.status === "warning").length;
  const errCount = rows.filter((r) => r.status === "error").length;

  return (
    <AdminGuard>
    <div className="flex-1">
      
      <PageHeader
        title={lang === "ar" ? "استيراد بيانات المنظمات" : "Import organizations"}
        subtitle={lang === "ar" ? "استورد بيانات المنظمات السودانية من ملفات CSV / Excel / JSON مع الكشف عن التكرار والتحقق من البيانات." : "Import Sudanese organization data from CSV / Excel / JSON with duplicate detection and data validation."}
        crumbs={[
          { label: lang === "ar" ? "الإدارة" : "Admin", href: "/admin" },
          { label: lang === "ar" ? "استيراد" : "Import" },
        ]}
      />

      <div className="mx-auto w-full max-w-[1100px] px-4 md:px-6 lg:px-8 py-6 flex-1">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-6">
          {[
            { key: "upload", ar: "رفع الملف", en: "Upload file", icon: FileUp },
            { key: "review", ar: "مراجعة البيانات", en: "Review data", icon: Eye },
            { key: "done", ar: "إكمال الاستيراد", en: "Complete import", icon: CheckCircle2 },
          ].map((s, i) => {
            const Icon = s.icon;
            const isActive = s.key === step;
            const isDone = (step === "review" && s.key === "upload") || (step === "done" && (s.key === "upload" || s.key === "review"));
            return (
              <div key={s.key} className="flex items-center gap-2 flex-1">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full transition-premium ${
                  isDone ? "bg-emerald-700 text-white" :
                  isActive ? "bg-emerald-700 text-white ring-4 ring-emerald-100" :
                  "bg-secondary text-muted-foreground"
                }`}>
                  {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={`text-xs font-semibold ${isActive ? "text-emerald-700" : "text-muted-foreground"}`}>
                  {lang === "ar" ? s.ar : s.en}
                </span>
                {i < 2 && <div className={`h-0.5 flex-1 rounded-full ${isDone ? "bg-emerald-700" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        {step === "upload" && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-card border-2 border-dashed border-border p-10 text-center">
              <Upload className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="text-base font-bold text-foreground mb-1">
                {lang === "ar" ? "اسحب وأفلت ملف البيانات هنا" : "Drag & drop your data file here"}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {lang === "ar" ? "الأنواع المدعومة: CSV وJSON. يمكن تحويل Excel إلى CSV قبل الاستيراد." : "Supported formats: CSV and JSON. Convert Excel to CSV before import."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <label className="inline-flex cursor-pointer items-center rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white">
                  <FileSpreadsheet className="h-4 w-4 me-1.5" />CSV
                  <input type="file" accept=".csv,.json,application/json,text/csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0]).catch((err) => alert(err.message))} />
                </label>
                <span className="rounded-xl border px-4 py-2 text-sm text-muted-foreground">JSON</span>
              </div>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-card p-4">
                <Database className="h-6 w-6 text-emerald-700 mb-2" />
                <h4 className="text-xs font-bold text-foreground mb-1">{lang === "ar" ? "كشف التكرار" : "Duplicate detection"}</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {lang === "ar" ? "نكتشف المنظمات المكررة بالاسم + الموقع قبل الاستيراد." : "Detects duplicate orgs by name + location before import."}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <ShieldCheck className="h-6 w-6 text-emerald-700 mb-2" />
                <h4 className="text-xs font-bold text-foreground mb-1">{lang === "ar" ? "تحقق البيانات" : "Data validation"}</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {lang === "ar" ? "نتحقق من صيغة البريد والهاتف والعنوان قبل الحفظ." : "Validates email, phone, and address formats before saving."}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <Eye className="h-6 w-6 text-emerald-700 mb-2" />
                <h4 className="text-xs font-bold text-foreground mb-1">{lang === "ar" ? "طابور المراجعة" : "Review queue"}</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {lang === "ar" ? "كل المنظمات المستوردة تدخل قائمة مراجعة قبل النشر." : "All imported orgs enter a review queue before publishing."}
                </p>
              </div>
            </div>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-5">
            {/* Summary cards */}
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-xl bg-card border border-border p-3">
                <div className="text-[10px] text-muted-foreground uppercase">{lang === "ar" ? "الملف" : "File"}</div>
                <div className="text-xs font-bold text-foreground truncate" dir="ltr">{fileName}</div>
              </div>
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                <div className="text-[10px] text-emerald-700 uppercase">{lang === "ar" ? "صالح" : "Valid"}</div>
                <div className="text-2xl font-bold text-emerald-700">{validCount}</div>
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                <div className="text-[10px] text-amber-700 uppercase">{lang === "ar" ? "تحذيرات" : "Warnings"}</div>
                <div className="text-2xl font-bold text-amber-700">{warnCount}</div>
              </div>
              <div className="rounded-xl bg-red-50 border border-red-200 p-3">
                <div className="text-[10px] text-red-700 uppercase">{lang === "ar" ? "أخطاء" : "Errors"}</div>
                <div className="text-2xl font-bold text-red-700">{errCount}</div>
              </div>
            </div>

            {/* Preview table */}
            <div className="rounded-2xl bg-card border border-border shadow-premium overflow-hidden">
              <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">{lang === "ar" ? "معاينة البيانات" : "Data preview"} ({rows.length})</h3>
                <Button variant="outline" size="sm" onClick={() => { setStep("upload"); setRows([]); setFileName(null); }} className="rounded-xl">
                  <Trash2 className="h-3.5 w-3.5 me-1.5" />
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-secondary/40">
                    <tr>
                      <th className="px-3 py-2 text-start font-semibold text-muted-foreground">#</th>
                      <th className="px-3 py-2 text-start font-semibold text-muted-foreground">{lang === "ar" ? "الاسم" : "Name"}</th>
                      <th className="px-3 py-2 text-start font-semibold text-muted-foreground">{lang === "ar" ? "النوع" : "Type"}</th>
                      <th className="px-3 py-2 text-start font-semibold text-muted-foreground">{lang === "ar" ? "الولاية" : "State"}</th>
                      <th className="px-3 py-2 text-start font-semibold text-muted-foreground">{lang === "ar" ? "المدينة" : "City"}</th>
                      <th className="px-3 py-2 text-start font-semibold text-muted-foreground">{lang === "ar" ? "الحالة" : "Status"}</th>
                      <th className="px-3 py-2 text-start font-semibold text-muted-foreground">{lang === "ar" ? "ملاحظات" : "Notes"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {rows.map((r) => (
                      <tr key={r.rowNum} className="hover:bg-secondary/20">
                        <td className="px-3 py-2 text-muted-foreground">{r.rowNum}</td>
                        <td className="px-3 py-2 font-semibold text-foreground">{r.name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{r.type}</td>
                        <td className="px-3 py-2 text-muted-foreground font-mono" dir="ltr">{r.state}</td>
                        <td className="px-3 py-2 text-muted-foreground">{r.city}</td>
                        <td className="px-3 py-2">
                          {r.status === "valid" && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-700 px-1.5 py-0.5 text-[10px] font-bold">
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              {lang === "ar" ? "صالح" : "Valid"}
                            </span>
                          )}
                          {r.status === "warning" && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 text-amber-700 px-1.5 py-0.5 text-[10px] font-bold">
                              <AlertCircle className="h-2.5 w-2.5" />
                              {lang === "ar" ? "تحذير" : "Warn"}
                            </span>
                          )}
                          {r.status === "error" && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-red-50 text-red-700 px-1.5 py-0.5 text-[10px] font-bold">
                              <AlertCircle className="h-2.5 w-2.5" />
                              {lang === "ar" ? "خطأ" : "Error"}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground text-[10px]">{r.issue ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Geocoding + deduplication info */}
            <div className="rounded-xl bg-secondary/40 border border-border p-4 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <Database className="h-4 w-4 text-emerald-700 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-foreground">{lang === "ar" ? "ما سيحدث عند الاستيراد:" : "On import, the system will:"}</strong>
                  <ul className="mt-1 space-y-0.5 list-disc list-inside">
                    <li>{lang === "ar" ? "تطبيع أرقام الهاتف إلى صيغة E.164" : "Normalize phone numbers to E.164 format"}</li>
                    <li>{lang === "ar" ? "جلب الإحداثيات الجغرافية (Geocoding) لكل عنوان" : "Geocode each address to lat/lng"}</li>
                    <li>{lang === "ar" ? "كشف التكرار بالاسم + العنوان" : "Detect duplicates by name + address"}</li>
                    <li>{lang === "ar" ? "وضع كل المنظمات في طابور مراجعة (Unverified)" : "Place all orgs in review queue (Unverified)"}</li>
                    <li>{lang === "ar" ? "تسجيل المصدر + تاريخ الاستيراد + المسؤول" : "Record source + import date + responsible admin"}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => { setStep("upload"); setRows([]); setFileName(null); }} className="rounded-xl">
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                onClick={() => submitImport().catch((err) => alert(err.message))}
                disabled={errCount > 0}
                className="bg-emerald-700 hover:bg-emerald-deep text-white rounded-xl"
              >
                {lang === "ar" ? `استيراد ${validCount} منظمة` : `Import ${validCount} organizations`}
                <Arrow className="h-4 w-4 ms-1.5" />
              </Button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="text-center py-12">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 mb-4">
              <CheckCircle2 className="h-10 w-10 text-emerald-700" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              {lang === "ar" ? "تم استيراد البيانات بنجاح" : "Import successful"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              {lang === "ar"
                ? `تم استيراد ${validCount} منظمة بنجاح. ستجدها في قائمة المراجعة بحالة "غير موثقة" — يمكنك مراجعتها وتوثيقها من صفحة إدارة المنظمات.`
                : `Successfully imported ${validCount} organizations. They will appear in the review queue as "Unverified" — you can review and verify them from the Organizations management page.`}
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button asChild variant="outline" className="rounded-xl">
                <a href="/admin/organizations">{lang === "ar" ? "عرض قائمة المراجعة" : "View review queue"}</a>
              </Button>
              <Button asChild className="bg-emerald-700 hover:bg-emerald-deep text-white rounded-xl">
                <a href="/admin/import">{lang === "ar" ? "استيراد ملف آخر" : "Import another file"}</a>
              </Button>
            </div>
          </div>
        )}
      </div>

      
    </div>
    </AdminGuard>
  );
}
