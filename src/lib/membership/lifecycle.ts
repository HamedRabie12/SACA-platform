import { db } from "@/lib/db";

export const MEMBERSHIP_FEE_CENTS = 12000;

export async function getMembership(memberId: string) {
  return db.membership.findFirst({ where: { memberId }, orderBy: { createdAt: "desc" } });
}

export async function activateMembership(memberId: string, actor: string) {
  const membership = await getMembership(memberId);
  if (!membership) throw new Error("MEMBERSHIP_NOT_FOUND");
  return db.$transaction(async (tx) => {
    const updated = await tx.membership.update({
      where: { id: membership.id },
      data: { status: "ACTIVE", startedAt: membership.startedAt ?? new Date(), verifiedAt: new Date(), verifiedBy: actor },
    });
    await tx.membershipStatusHistory.create({
      data: { membershipId: membership.id, fromStatus: membership.status, toStatus: "ACTIVE", reason: "Approved", changedBy: actor },
    });
    return updated;
  });
}

export async function canVote(memberId: string) {
  const membership = await getMembership(memberId);
  if (!membership || membership.status !== "ACTIVE" || !membership.startedAt) return false;
  const threshold = new Date(); threshold.setMonth(threshold.getMonth() - 6); return membership.startedAt <= threshold;
}
