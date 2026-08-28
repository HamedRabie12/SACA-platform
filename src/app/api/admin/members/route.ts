import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminRequest } from "@/lib/security/admin-session";

async function isAdmin(req: NextRequest): Promise<boolean> {
  return Boolean(await requireAdminRequest(req));
}

/**
 * GET /api/admin/members — list all members with filters
 * POST /api/admin/members — admin creates a member manually
 */
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const accountState = searchParams.get("accountState")?.trim();
  const stateCode = searchParams.get("state")?.trim().toUpperCase();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 50)));

  const where: Record<string, unknown> = {
    accountState: { not: "Archived" }, // Exclude archived by default
  };
  if (accountState) where.accountState = accountState;
  if (stateCode) where.state = { code: stateCode };
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { email: { contains: q } },
      { phoneE164: { contains: q } },
      { profession: { contains: q } },
    ];
  }

  const [total, items] = await Promise.all([
    db.member.count({ where }),
    db.member.findMany({
      where,
      include: { state: true, city: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    items: items.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      phoneE164: m.phoneE164,
      avatarUrl: m.avatarUrl,
      profession: m.profession,
      interests: m.interests,
      membershipType: m.membershipType,
      accountState: m.accountState,
      emailVerifiedAt: m.emailVerifiedAt?.toISOString() ?? null,
      phoneVerifiedAt: m.phoneVerifiedAt?.toISOString() ?? null,
      createdAt: m.createdAt.toISOString(),
      state: m.state ? { code: m.state.code, nameEn: m.state.nameEn, nameAr: m.state.nameAr } : null,
      city: m.city ? { nameEn: m.city.nameEn, nameAr: m.city.nameAr } : null,
    })),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim() || null;
    const phoneE164 = String(body?.phoneE164 ?? "").trim() || null;
    const stateCode = String(body?.stateCode ?? "").trim().toUpperCase();
    const profession = String(body?.profession ?? "").trim() || null;
    const interests = Array.isArray(body?.interests) ? body.interests.join(",") : null;
    const accountState = String(body?.accountState ?? "Active").trim();

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    let stateId: string | undefined;
    if (stateCode) {
      const state = await db.uSState.findUnique({ where: { code: stateCode } });
      if (state) stateId = state.id;
    }

    const member = await db.member.create({
      data: {
        name,
        email,
        phoneE164,
        stateId,
        profession,
        interests,
        accountState,
        membershipType: "Member",
      },
    });

    await db.auditLog.create({
      data: {
        actor: "admin",
        action: "member-created",
        entity: "member",
        entityId: member.id,
        details: JSON.stringify({ name, email, state: stateCode }),
      },
    });

    return NextResponse.json({ ok: true, member });
  } catch (e) {
    console.error("admin create member error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
