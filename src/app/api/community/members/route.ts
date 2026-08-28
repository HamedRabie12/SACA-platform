import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/community/members — public member directory.
 * Only Active/Verified members with privacyShowState=true are returned.
 * No emails, phones, or precise locations are exposed.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? 30)));

  const where = {
    accountState: { in: ["Active", "Verified"] },
    privacyShowState: true,
  };

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
      profession: m.profession,
      interests: m.interests,
      membershipType: m.membershipType,
      accountState: m.accountState,
      state: m.state ? { code: m.state.code, nameEn: m.state.nameEn, nameAr: m.state.nameAr } : null,
      city: m.privacyShowCity && m.city ? { nameEn: m.city.nameEn, nameAr: m.city.nameAr } : null,
      createdAt: m.createdAt.toISOString(),
    })),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  });
}
