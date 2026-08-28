import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { db } from "@/lib/db";

function chapterTitle(n: number) {
  return ["الأهداف","العضوية","الهيكل التنظيمي","الجمعية العمومية واللجنة التسييرية","الاجتماعات والقرارات","الشؤون المالية","تعديل الدستور وحل الجمعية","الأحكام العامة"][n - 1] ?? `الفصل ${n}`;
}

function extractChapter(content: string, n: number) {
  const headings = [...content.matchAll(/^## الفصل .+$/gm)];
  const current = headings[n - 1];
  const next = headings[n];
  if (!current) return "";
  const start = current.index ?? 0;
  const end = next?.index ?? content.length;
  return content.slice(start, end).trim();
}

async function main() {
  const sourcePath = path.join(process.cwd(), "docs/governance/CONSTITUTION.md");
  const content = await fs.readFile(sourcePath, "utf8");
  const sourceHash = crypto.createHash("sha256").update(content).digest("hex");

  const existing = await db.constitution.findFirst({ where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" } });
  const constitution = existing
    ? await db.constitution.update({ where: { id: existing.id }, data: { content, sourceHash, version: existing.version || "1.0.0" } })
    : await db.constitution.create({
        data: {
          title: "دستور والنظام الأساسي للجمعية السودانية الأمريكية",
          language: "ar",
          status: "ACTIVE",
          version: "1.0.0",
          effectiveAt: new Date(),
          sourceHash,
          content,
          approvedBy: process.env.CONSTITUTION_APPROVED_BY ?? null,
          approvedAt: process.env.CONSTITUTION_APPROVED_AT ? new Date(process.env.CONSTITUTION_APPROVED_AT) : null,
        },
      });

  const ruleDefinitions = [
    { code: "MEMBERSHIP_RESIDENCY_MARYLAND", article: "CHAPTER-2", name: "إقامة العضو في ميريلاند", conditionExpr: "residenceState == MD", effect: "MEMBERSHIP_ELIGIBILITY", source: "الفصل الثاني: شروط العضوية", severity: "CRITICAL" },
    { code: "MEMBERSHIP_SUDANESE_OR_CONNECTED", article: "CHAPTER-2", name: "الأصل السوداني أو الارتباط بالجالية", conditionExpr: "sudaneseOrigin || communityConnection", effect: "MEMBERSHIP_ELIGIBILITY", source: "الفصل الثاني: شروط العضوية", severity: "HIGH" },
    { code: "MEMBERSHIP_RULES_ACCEPTANCE", article: "CHAPTER-2", name: "قبول النظام الداخلي", conditionExpr: "rulesAccepted == true", effect: "MEMBERSHIP_ELIGIBILITY", source: "الفصل الثاني: شروط العضوية", severity: "CRITICAL" },
    { code: "MEMBERSHIP_FEE_120_USD", article: "CHAPTER-2", name: "رسم العضوية السنوي", conditionExpr: "membershipFeeAnnualCents == 12000", effect: "MEMBERSHIP_FEE_REQUIRED", source: "الفصل الثاني: العضوية", severity: "HIGH" },
    { code: "VOTE_AFTER_6_MONTHS", article: "CHAPTER-2", name: "أهلية التصويت بعد ستة أشهر", conditionExpr: "activeMembershipAge >= 6 calendar months", effect: "VOTE_ALLOWED", source: "الفصل الثاني: حقوق الأعضاء", severity: "CRITICAL" },
    { code: "MEMBER_DUTY_CONSTITUTION", article: "CHAPTER-2", name: "الالتزام بالدستور", conditionExpr: "memberAcceptedConstitution == true", effect: "MEMBER_DUTY", source: "الفصل الثاني: واجبات الأعضاء", severity: "HIGH" },
    { code: "DIRECT_ELECTION_PRESIDENT", article: "CHAPTER-3", name: "انتخاب الرئيس مباشرة", conditionExpr: "electionMethod(PRESIDENT) == DIRECT_GENERAL_ASSEMBLY", effect: "ELECTED_DIRECTLY", source: "الفصل الثالث", severity: "CRITICAL" },
    { code: "DIRECT_ELECTION_VP", article: "CHAPTER-3", name: "انتخاب نائب الرئيس مباشرة", conditionExpr: "electionMethod(VICE_PRESIDENT) == DIRECT_GENERAL_ASSEMBLY", effect: "ELECTED_DIRECTLY", source: "الفصل الثالث", severity: "CRITICAL" },
    { code: "DIRECT_ELECTION_SECRETARY", article: "CHAPTER-3", name: "انتخاب الأمين العام مباشرة", conditionExpr: "electionMethod(SECRETARY_GENERAL) == DIRECT_GENERAL_ASSEMBLY", effect: "ELECTED_DIRECTLY", source: "الفصل الثالث", severity: "CRITICAL" },
    { code: "EXECUTIVE_OFFICE_MAX_11", article: "CHAPTER-3", name: "الحد الأقصى للمكتب التنفيذي", conditionExpr: "executiveOfficeMemberCount <= 11", effect: "OFFICE_CAP", source: "الفصل الثالث", severity: "HIGH" },
    { code: "DUAL_OFFICE_PROHIBITION", article: "CHAPTER-3", name: "حظر ازدواجية المناصب", conditionExpr: "noConflictingExecutiveOffice", effect: "CONFLICT_BLOCK", source: "الفصل الثالث", severity: "CRITICAL" },
    { code: "OFFICE_SEVENTH_PENDING", article: "CHAPTER-3", name: "المكتب السابع غير محدد", conditionExpr: "seventhOfficeOfficialDefinition == true", effect: "ALLOW_FULL_OFFICE_REGISTRY", source: "الفصل الثالث", severity: "HIGH" },
    { code: "BOARD_TERM_TWO_YEARS", article: "CHAPTER-4", name: "مدة الدورة الانتخابية", conditionExpr: "boardTermDurationYears == 2", effect: "TERM_DURATION", source: "الفصل الرابع", severity: "HIGH" },
    { code: "CARETAKER_LIMITED_AUTHORITY", article: "CHAPTER-4", name: "قيود اللجنة التسييرية", conditionExpr: "caretakerMode == true implies restrictedAuthority", effect: "CARETAKER_RESTRICTIONS", source: "الفصل الرابع: اللجنة التسييرية", severity: "CRITICAL" },
    { code: "CARETAKER_NO_CONSTITUTION_AMENDMENT", article: "CHAPTER-4", name: "منع اللجنة التسييرية من تعديل الدستور", conditionExpr: "caretakerMode == true => constitutionAmendment == false", effect: "ACTION_BLOCK", source: "الفصل الرابع", severity: "CRITICAL" },
    { code: "ELECTION_COMMITTEE_INDEPENDENCE", article: "CHAPTER-4", name: "استقلال لجنة الانتخابات", conditionExpr: "committeeMember.isCandidate == false && committeeMember.isIndependent == true", effect: "ELECTION_ADMIN_ELIGIBLE", source: "الفصل الرابع", severity: "CRITICAL" },
    { code: "ELECTION_COMMITTEE_ODD", article: "CHAPTER-4", name: "عدد فردي للجنة الانتخابات", conditionExpr: "electionCommitteeMemberCount % 2 == 1", effect: "ELECTION_COMMITTEE_VALID", source: "الفصل الرابع", severity: "HIGH" },
    { code: "WOMEN_YOUTH_PARTICIPATION", article: "CHAPTER-1", name: "الدور الأساسي للمرأة والشباب", conditionExpr: "womenAndYouthParticipationRequired == true", effect: "ACTIVITY_PARTICIPATION_POLICY", source: "الفصل الأول والخامس", severity: "HIGH" },
    { code: "REMOTE_MEETINGS_ALLOWED", article: "CHAPTER-5", name: "الاجتماعات عن بعد", conditionExpr: "meetingMode in [IN_PERSON, REMOTE, HYBRID]", effect: "MEETING_MODE_ALLOWED", source: "الفصل الثالث والخامس", severity: "MEDIUM" },
    { code: "ANNUAL_BUDGET_APPROVAL", article: "CHAPTER-6", name: "اعتماد الميزانية السنوية", conditionExpr: "annualBudget.approvedByGeneralAssembly == true", effect: "BUDGET_VALID", source: "الفصل السادس", severity: "CRITICAL" },
    { code: "FINANCIAL_TRANSPARENCY", article: "CHAPTER-6", name: "الشفافية المالية", conditionExpr: "financialReportingRecorded == true", effect: "FINANCIAL_TRANSPARENCY", source: "الفصل السادس", severity: "HIGH" },
    { code: "AMENDMENT_TWO_THIRDS", article: "CHAPTER-7", name: "تعديل الدستور بثلثي الأعضاء", conditionExpr: "constitutionAmendmentApproval >= 2/3", effect: "AMENDMENT_ALLOWED", source: "الفصل السابع", severity: "CRITICAL" },
    { code: "DISSOLUTION_TWO_THIRDS", article: "CHAPTER-7", name: "حل الجمعية بثلثي الأعضاء", conditionExpr: "dissolutionApproval >= 2/3", effect: "DISSOLUTION_ALLOWED", source: "الفصل السابع", severity: "CRITICAL" },
    { code: "GENERAL_ASSEMBLY_QUORUM_TWO_THIRDS", article: "CHAPTER-7", name: "النصاب المذكور للاجتماع القانوني", conditionExpr: "presentEligibleMembers >= 2/3 of registered members", effect: "QUORUM_RULE", source: "الفصل السابع", severity: "CRITICAL" },
    { code: "CONSTITUTION_COMPLIANCE_REQUIRED", article: "CHAPTER-8", name: "التزام جميع الأعضاء بالدستور", conditionExpr: "memberAndAdminActionsComplyWithActiveConstitution == true", effect: "COMPLIANCE_REQUIRED", source: "الفصل الثامن", severity: "CRITICAL" },
  ];

  for (let n = 1; n <= 8; n++) {
    const title = chapterTitle(n);
    const body = extractChapter(content, n);
    const chapter = await db.constitutionChapter.upsert({
      where: { constitutionId_chapterNumber: { constitutionId: constitution.id, chapterNumber: n } },
      update: { title, sortOrder: n },
      create: { constitutionId: constitution.id, chapterNumber: n, title, sortOrder: n },
    });

    const article = await db.constitutionArticle.upsert({
      where: { constitutionId_articleCode: { constitutionId: constitution.id, articleCode: `CHAPTER-${n}` } },
      update: { chapterId: chapter.id, title, body, sortOrder: n, status: "ACTIVE" },
      create: { constitutionId: constitution.id, chapterId: chapter.id, articleCode: `CHAPTER-${n}`, title, body, sortOrder: n, status: "ACTIVE" },
    });

    const clauseLines = body
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^(?:[-*]|\d+[.)]|###)/.test(line))
      .slice(0, 80);

    for (let idx = 0; idx < clauseLines.length; idx++) {
      const clauseCode = `${n}-${idx + 1}`;
      await db.constitutionClause.upsert({
        where: { articleId_clauseCode: { articleId: article.id, clauseCode } },
        update: { body: clauseLines[idx], sortOrder: idx + 1, status: "ACTIVE" },
        create: { articleId: article.id, clauseCode, body: clauseLines[idx], sortOrder: idx + 1, status: "ACTIVE" },
      });
    }
  }

  for (const rule of ruleDefinitions) {
    const article = await db.constitutionArticle.findUnique({ where: { constitutionId_articleCode: { constitutionId: constitution.id, articleCode: rule.article } } });
    if (!article) continue;
    await db.constitutionRule.upsert({
      where: { code: rule.code },
      update: {
        articleId: article.id,
        name: rule.name,
        description: rule.source,
        conditionExpr: rule.conditionExpr,
        effect: rule.effect,
        severity: rule.severity,
        status: "ACTIVE",
        testDefinition: `Verify ${rule.code} against the active Constitution version.`,
      },
      create: {
        code: rule.code,
        articleId: article.id,
        name: rule.name,
        description: rule.source,
        conditionExpr: rule.conditionExpr,
        effect: rule.effect,
        severity: rule.severity,
        status: "ACTIVE",
        testDefinition: `Verify ${rule.code} against the active Constitution version.`,
      },
    });
  }

  console.log(`SACA Constitution synchronized: ${constitution.id} sourceHash=${sourceHash}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
