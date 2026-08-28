import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveMemberSession } from "@/lib/security/member-session";

/**
 * POST /api/community/onboarding
 * Body: { memberId, name, stateCode, cityName, interests, profession, ... }
 *
 * Updates member profile after verification.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session = await resolveMemberSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const memberId = session.memberId;
    const name = String(body?.name ?? "").trim().slice(0, 80);
    const stateCode = String(body?.stateCode ?? "").trim().toUpperCase();
    const cityName = String(body?.cityName ?? "").trim();
    const profession = String(body?.profession ?? "").trim().slice(0, 80);
    const interests = Array.isArray(body?.interests)
      ? body.interests.filter((x: unknown) => typeof x === "string").join(",")
      : String(body?.interests ?? "").trim();
    const bio = String(body?.bio ?? "").trim().slice(0, 280);
    const avatarUrl = String(body?.avatarUrl ?? "").trim().slice(0, 1000);
    if (avatarUrl && !/^https:\/\//i.test(avatarUrl)) return NextResponse.json({ error: "Profile image URL must use HTTPS" }, { status: 400 });

    if (!memberId) {
      return NextResponse.json({ error: "memberId is required" }, { status: 400 });
    }

    const member = await db.member.findUnique({ where: { id: memberId } });
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Resolve state + city IDs
    let stateId: string | undefined;
    let cityId: string | undefined;
    if (stateCode) {
      const state = await db.uSState.findUnique({ where: { code: stateCode } });
      if (state) {
        stateId = state.id;
        if (cityName) {
          const city = await db.uSCity.findFirst({
            where: { stateId: state.id, nameEn: cityName },
          });
          cityId = city?.id;
        }
      }
    }

    const updated = await db.member.update({
      where: { id: memberId },
      data: {
        name: name || member.name,
        stateId: stateId ?? member.stateId,
        cityId: cityId ?? member.cityId,
        profession: profession || member.profession,
        interests: interests || member.interests,
        bio: bio || member.bio,
        avatarUrl: avatarUrl || member.avatarUrl,
        accountState: "Active",
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        actor: memberId,
        action: "onboarding-completed",
        entity: "member",
        entityId: memberId,
        details: JSON.stringify({
          state: stateCode,
          city: cityName,
          hasProfession: !!profession,
          hasInterests: !!interests,
        }),
      },
    });

    return NextResponse.json({
      ok: true,
      member: {
        id: updated.id,
        name: updated.name,
        accountState: updated.accountState,
      },
    });
  } catch (e) {
    console.error("onboarding error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
