import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminRequest } from "@/lib/security/admin-session";

async function isAdmin(req: NextRequest): Promise<boolean> {
  return Boolean(await requireAdminRequest(req));
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await req.json();

    const allowed: Record<string, unknown> = {};
    const fields = [
      "title", "summary", "content", "category", "authorName",
      "orgName", "status", "imageUrl",
    ];
    for (const f of fields) {
      if (body[f] !== undefined) allowed[f] = body[f];
    }
    if (body.stateCode) {
      const state = await db.uSState.findUnique({
        where: { code: String(body.stateCode).toUpperCase() },
      });
      if (state) allowed.stateId = state.id;
    }
    if (body.status === "Published") {
      allowed.publishedAt = new Date();
    }

    const updated = await db.news.update({ where: { id }, data: allowed });

    // Sync AI knowledge base
    if (body.status === "Published") {
      const existing = await db.aIKnowledgeDoc.findFirst({
        where: { sourceType: "news", sourceId: id },
      });
      if (existing) {
        await db.aIKnowledgeDoc.update({
          where: { id: existing.id },
          data: {
            title: updated.title,
            content: `${updated.title}. ${updated.summary} ${updated.content.slice(0, 500)}`,
            tags: updated.category,
          },
        });
      } else {
        await db.aIKnowledgeDoc.create({
          data: {
            title: updated.title,
            sourceType: "news",
            sourceId: id,
            content: `${updated.title}. ${updated.summary} ${updated.content.slice(0, 500)}`,
            tags: updated.category,
          },
        });
      }
    }

    await db.auditLog.create({
      data: {
        actor: "admin",
        action: "news-updated",
        entity: "news",
        entityId: id,
        details: JSON.stringify({ fields: Object.keys(allowed) }),
      },
    });

    return NextResponse.json({ ok: true, news: updated });
  } catch (e) {
    console.error("admin update news error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    await db.news.update({ where: { id }, data: { status: "Archived" } });
    await db.aIKnowledgeDoc.updateMany({ where: { sourceType: "news", sourceId: id }, data: { isActive: false } });
    await db.auditLog.create({
      data: {
        actor: "admin",
        action: "news-archived",
        entity: "news",
        entityId: id,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin delete news error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
