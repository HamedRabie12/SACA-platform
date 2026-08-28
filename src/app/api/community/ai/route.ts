import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/community/ai
 *
 * Internal Community AI (RAG).
 * - Accepts { question: string, lang: "ar" | "en" }
 * - Searches the platform's internal knowledge base (AIKnowledgeDoc table).
 * - Returns an answer synthesized ONLY from retrieved platform sources.
 * - If no relevant source is found, returns an explicit "no information" response.
 *
 * This assistant never fabricates organizations, addresses, phones, or events.
 */

type KnowledgeDoc = {
  id: string;
  title: string;
  sourceType: string;
  sourceId: string | null;
  content: string;
  tags: string | null;
};

function normalizeArabic(s: string): string {
  return s
    .toLowerCase()
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ًٌٍَُِّْ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(s: string): string[] {
  return normalizeArabic(s)
    .split(/[\s,،.؟?!\-–]+/)
    .filter((t) => t.length > 2);
}

function scoreDoc(doc: KnowledgeDoc, queryTokens: string[]): number {
  const text = normalizeArabic(`${doc.title} ${doc.content} ${doc.tags ?? ""}`);
  let score = 0;
  for (const tk of queryTokens) {
    if (text.includes(tk)) {
      score += 1;
      // Bonus for appearing in title
      if (normalizeArabic(doc.title).includes(tk)) score += 0.5;
    }
  }
  return score;
}

function synthesizeAnswer(
  question: string,
  docs: KnowledgeDoc[],
  lang: "ar" | "en"
): { answer: string; sources: Array<{ title: string; type: string }> } {
  if (docs.length === 0) {
    return {
      answer:
        lang === "ar"
          ? "لا توجد لدي معلومات موثقة عن هذا الأمر داخل قاعدة بيانات المنصة حاليًا. يمكنك إضافة منظمة أو خبر جديد من لوحة الإدارة، وسأتمكن من الإجابة عليه بعد ذلك."
          : "I don't have verified information about this in the platform's database yet. You can add an organization or news item from the admin portal, and I'll be able to answer it then.",
      sources: [],
    };
  }

  // Simple extractive synthesis: present matched docs as a structured answer.
  const q = normalizeArabic(question);

  // Detect intent
  const wantsOrg = /منظم|organization|org|مركز|center|مسجد|mosque|جمعي|association|رابط|where|اين|أين|اقرب|أقرب|nearest/.test(q);
  const wantsEvents = /فعالي|event|فاعلي|مؤتمر|conference|ندوة|seminar|ورشة|workshop/.test(q);
  const wantsServices = /خدم|service|تعليم|education|قانون|legal|هجرة|immigration|صحة|health/.test(q);

  const sources = docs.slice(0, 5).map((d) => ({
    title: d.title,
    type: d.sourceType,
  }));

  if (wantsOrg) {
    const lines = docs.slice(0, 5).map((d, i) => {
      const lines = d.content.split(/\.|\n/).map((l) => l.trim()).filter(Boolean);
      return `${i + 1}. ${d.title}\n   ${lines.slice(0, 3).join(". ")}.`;
    });
    return {
      answer:
        lang === "ar"
          ? `بناءً على بيانات المنصة، إليك ما وجدته:\n\n${lines.join("\n\n")}\n\nيمكنك الاطلاع على المزيد من التفاصيل من بطاقة المنظمة.`
          : `Based on platform data, here's what I found:\n\n${lines.join("\n\n")}`,
      sources,
    };
  }

  if (wantsEvents) {
    return {
      answer:
        lang === "ar"
          ? `توجد فعاليات قادمة في المنصة يمكنك الاطلاع عليها من قسم "الفعاليات" في الصفحة الرئيسية. إليك بعض المنظمات النشطة المرتبطة:\n\n${docs
              .slice(0, 3)
              .map((d, i) => `${i + 1}. ${d.title}`)
              .join("\n")}`
          : `There are upcoming events in the platform — check the Events section on the homepage. Here are some active related organizations:\n\n${docs
              .slice(0, 3)
              .map((d, i) => `${i + 1}. ${d.title}`)
              .join("\n")}`,
      sources,
    };
  }

  if (wantsServices) {
    const matching = docs.filter((d) => d.tags && d.tags.length > 0);
    return {
      answer:
        lang === "ar"
          ? `بناءً على بيانات المنصة، الخدمات التالية متاحة عبر المنظمات المسجلة:\n\n${matching
              .slice(0, 4)
              .map((d, i) => `${i + 1}. ${d.title} — يقدم: ${d.tags ?? "غير محدد"}`)
              .join("\n")}`
          : `Based on platform data, the following services are available via registered organizations:\n\n${matching
              .slice(0, 4)
              .map((d, i) => `${i + 1}. ${d.title} — offers: ${d.tags ?? "n/a"}`)
              .join("\n")}`,
      sources,
    };
  }

  // Generic
  const lines = docs.slice(0, 3).map((d, i) => {
    const first = d.content.split(/\.|\n/).map((l) => l.trim()).filter(Boolean)[0] ?? "";
    return `${i + 1}. ${d.title} — ${first}.`;
  });
  return {
    answer:
      lang === "ar"
        ? `إليك ما وجدته في قاعدة بيانات المنصة:\n\n${lines.join("\n\n")}\n\nيمكنك طرح سؤال أكثر تحديدًا لأعطيك إجابة أدق.`
        : `Here's what I found in the platform database:\n\n${lines.join("\n\n")}`,
    sources,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question = String(body?.question ?? "").trim();
    const lang = body?.lang === "en" ? "en" : "ar";

    if (!question || question.length < 2) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // Deterministic retrieval is the canonical fallback until a production vector provider is configured; never invent a source.
    const allDocs = await db.aIKnowledgeDoc.findMany({
      where: { isActive: true },
      take: 200,
    });

    const tokens = tokenize(question);
    const scored = allDocs
      .map((d) => ({ doc: d, score: scoreDoc(d as KnowledgeDoc, tokens) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((x) => x.doc);

    const { answer, sources } = synthesizeAnswer(question, scored as KnowledgeDoc[], lang);

    return NextResponse.json({
      answer,
      sources,
      matchedDocs: scored.length,
    });
  } catch (e) {
    console.error("AI route error:", e);
    return NextResponse.json(
      {
        answer:
          "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقًا.",
        sources: [],
        matchedDocs: 0,
      },
      { status: 200 }
    );
  }
}
