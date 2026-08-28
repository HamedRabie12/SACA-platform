import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminRequest } from "@/lib/security/admin-session";
import { classifyCommunityContent } from "@/lib/moderation/content-policy";

async function isAdmin(req: NextRequest): Promise<boolean> {
  return Boolean(await requireAdminRequest(req));
}

/**
 * POST /api/admin/news — create news (status defaults to PendingReview)
 */
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const title = String(body?.title ?? "").trim();
    const summary = String(body?.summary ?? "").trim();
    const content = String(body?.content ?? "").trim();
    const category = String(body?.category ?? "Community").trim();
    const authorName = String(body?.authorName ?? "").trim() || null;
    const orgName = String(body?.orgName ?? "").trim() || null;
    const stateCode = String(body?.stateCode ?? "").trim().toUpperCase();
    const status = String(body?.status ?? "PendingReview").trim();
    const imageUrl = String(body?.imageUrl ?? "").trim() || null;

    if (!title || !summary || !content) {
      return NextResponse.json(
        { error: "title, summary, and content are required" },
        { status: 400 }
      );
    }

    const moderation = classifyCommunityContent(`${title} ${summary} ${content}`);
    if (moderation.blocked) {
      await db.moderationCase.create({ data: { targetType: "news", targetId: "pending", category: moderation.classification, severity: "HIGH", reason: moderation.reason ?? "Policy violation" } });
      return NextResponse.json({ error: "CONTENT_POLICY_BLOCK", classification: moderation.classification, reason: moderation.reason }, { status: 422 });
    }

    let stateId: string | undefined;
    if (stateCode) {
      const state = await db.uSState.findUnique({ where: { code: stateCode } });
      if (state) stateId = state.id;
    }

    const news = await db.news.create({
      data: {
        title,
        summary,
        content,
        category,
        authorName,
        orgName,
        stateId,
        status,
        imageUrl,
        publishedAt: status === "Published" ? new Date() : new Date(),
      },
    });

    // AI knowledge base entry — only if published
    if (status === "Published") {
      await db.aIKnowledgeDoc.create({
        data: {
          title: title,
          sourceType: "news",
          sourceId: news.id,
          content: `${title}. ${summary} ${content.slice(0, 500)}`,
          tags: category,
        },
      });
    }

    await db.auditLog.create({
      data: {
        actor: "admin",
        action: "news-created",
        entity: "news",
        entityId: news.id,
        details: JSON.stringify({ title, status, category }),
      },
    });

    return NextResponse.json({ ok: true, news });
  } catch (e) {
    console.error("admin create news error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category")?.trim();
  const status = searchParams.get("status")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 50)));

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (status) where.status = status;

  const [total, items] = await Promise.all([
    db.news.count({ where }),
    db.news.findMany({
      where,
      include: { state: true },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    items: items.map((n) => ({ ...n, publishedAt: n.publishedAt.toISOString() })),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  });
}
