import { db } from "@/lib/db";

export type RuleContext = {
  memberId?: string;
  membershipStartedAt?: Date;
  membershipStatus?: string;
  action: string;
  now?: Date;
};

export type RuleResult = { allowed: boolean; code: string; message: string; sourceArticle?: string };

export async function isMemberVoteEligible(ctx: RuleContext): Promise<RuleResult> {
  const now = ctx.now ?? new Date();
  if (ctx.membershipStatus !== "ACTIVE") {
    return { allowed: false, code: "MEMBERSHIP_NOT_ACTIVE", message: "العضوية ليست نشطة وفق قواعد العضوية المعتمدة." };
  }
  if (!ctx.membershipStartedAt) {
    return { allowed: false, code: "MEMBERSHIP_START_UNKNOWN", message: "لا يمكن إثبات مدة العضوية حالياً." };
  }
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  if (ctx.membershipStartedAt > sixMonthsAgo) {
    return { allowed: false, code: "VOTE_6_MONTH_RULE", message: "يشترط النظام الأساسي مرور ستة أشهر على الأقل من العضوية النشطة قبل التصويت." , sourceArticle: "حقوق الأعضاء"};
  }
  return { allowed: true, code: "VOTE_ELIGIBLE", message: "العضو مستوفٍ لشرط الأهلية الانتخابية الأساسي." };
}

export async function complianceSnapshot() {
  const [rules, activeConstitution, boards, elections] = await Promise.all([
    db.constitutionRule.count({ where: { status: "ACTIVE" } }),
    db.constitution.count({ where: { status: "ACTIVE" } }),
    db.board.count({ where: { status: "ACTIVE" } }),
    db.election.count({ where: { status: { in: ["ANNOUNCED", "VOTING_OPEN", "TALLYING", "AUDIT"] } } }),
  ]);
  return { rules, activeConstitution, activeBoards: boards, activeElections: elections };
}
