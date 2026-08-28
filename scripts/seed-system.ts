import { db } from "@/lib/db";
import { PERMISSIONS, ROLE_PERMISSIONS } from "@/lib/security/permission-matrix";

const descriptionByCode: Record<string, string> = {
  MEMBERS_READ: "Read members", MEMBERS_MANAGE: "Manage memberships", ORGANIZATIONS_MANAGE: "Manage organizations", EVENTS_MANAGE: "Manage events", MEETINGS_MANAGE: "Manage meetings", CONTENT_MANAGE: "Manage content", MEDIA_MANAGE: "Manage media", REPORTS_READ: "Read reports", REPORTS_MANAGE: "Manage reports", DATA_MANAGE: "Manage data", SETTINGS_MANAGE: "Manage settings", GEOGRAPHY_MANAGE: "Manage geographic data", ANALYTICS_READ: "Read analytics", ELECTIONS_MANAGE: "Manage elections", GOVERNANCE_MANAGE: "Manage governance", LEGAL_DOCUMENTS_MANAGE: "Manage legal documents", COMPLIANCE_MANAGE: "Manage compliance", SECURITY_MANAGE: "Manage security", RISK_MANAGE: "Manage risk", MODERATION_MANAGE: "Manage moderation", PRIVACY_MANAGE: "Manage privacy", SERVICE_REQUESTS_MANAGE: "Manage service requests", VOLUNTEER_MANAGE: "Manage volunteer", SYSTEM_HEALTH: "View system health",
};

const roles = [
  ["SUPER_ADMIN", "Super Administrator", "المدير الأعلى"],
  ["MEMBERSHIP_ADMIN", "Membership Administrator", "مسؤول العضوية"],
  ["CONTENT_ADMIN", "Content Administrator", "مسؤول المحتوى"],
  ["GOVERNANCE_ADMIN", "Governance Administrator", "مسؤول الحوكمة"],
  ["SECURITY_ADMIN", "Security Administrator", "مسؤول الأمن"],
  ["SYSTEM_ADMIN", "System Administrator", "مسؤول النظام"],
] as const;

for (const code of Object.values(PERMISSIONS)) {
  await db.permission.upsert({ where: { code }, update: { description: descriptionByCode[code] ?? code }, create: { code, description: descriptionByCode[code] ?? code } });
}

for (const [code, nameEn, nameAr] of roles) {
  const role = await db.role.upsert({ where: { code }, update: { nameEn, nameAr }, create: { code, nameEn, nameAr } });
  for (const permissionCode of ROLE_PERMISSIONS[code] ?? []) {
    const permission = await db.permission.findUnique({ where: { code: permissionCode } });
    if (permission) await db.rolePermission.upsert({ where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } }, update: {}, create: { roleId: role.id, permissionId: permission.id } });
  }
}

const scopes = [
  ["NATIONAL", "وطني", "National", "NATIONAL"],
  ["STATE", "ولائي", "State", "STATE"],
  ["CHAPTER", "فرعي", "Chapter", "CHAPTER"],
  ["COMMITTEE", "لجنة", "Committee", "COMMITTEE"],
] as const;
for (const [code, nameAr, nameEn, scopeType] of scopes) await db.scopeDefinition.upsert({ where: { code }, update: { nameAr, nameEn, scopeType }, create: { code, nameAr, nameEn, scopeType } });

const moderationRules = [
  ["POLITICAL_PARTISAN_CAMPAIGN", "POLITICAL", "BLOCK", "HIGH", "POLITICAL_CONTENT_POLICY"],
  ["POLITICAL_PARTISAN_FUNDRAISING", "POLITICAL", "BLOCK", "CRITICAL", "POLITICAL_CONTENT_POLICY"],
  ["HARASSMENT_ABUSE", "ABUSE", "REVIEW", "HIGH", "COMMUNITY_CONDUCT_POLICY"],
  ["PRIVATE_DATA_EXPOSURE", "PRIVACY", "BLOCK", "CRITICAL", "PRIVACY_POLICY"],
];
for (const [code, category, action, severity, sourceRef] of moderationRules) await db.moderationRule.upsert({ where: { code }, update: { category, action, severity, sourceRef, status: "ACTIVE" }, create: { code, category, action, severity, sourceRef, status: "ACTIVE" } });

await db.policy.upsert({
  where: { code: "POLITICAL_CONTENT_POLICY" },
  update: { title: "سياسة المحتوى السياسي الحزبي", version: "1.0", category: "CONTENT", content: "يحظر استخدام منصة SACA للدعاية الحزبية أو الحملات أو الترويج الحزبي أو جمع التمويل السياسي أو التعبئة الحزبية. تستثنى انتخابات SACA الداخلية والمعلومات الحكومية المحايدة وخدمات المجتمع والمعلومات المدنية غير الدعائية.", sourceArticles: "الفصل الأول والفصل الخامس والفصل الثامن", status: "ACTIVE", effectiveAt: new Date() },
  create: { code: "POLITICAL_CONTENT_POLICY", title: "سياسة المحتوى السياسي الحزبي", version: "1.0", category: "CONTENT", content: "يحظر استخدام منصة SACA للدعاية الحزبية أو الحملات أو الترويج الحزبي أو جمع التمويل السياسي أو التعبئة الحزبية. تستثنى انتخابات SACA الداخلية والمعلومات الحكومية المحايدة وخدمات المجتمع والمعلومات المدنية غير الدعائية.", sourceArticles: "الفصل الأول والفصل الخامس والفصل الثامن", status: "ACTIVE", effectiveAt: new Date() },
});

console.log(`Seeded ${Object.values(PERMISSIONS).length} permissions, ${roles.length} roles, governance scopes, and moderation policy.`);
await db.$disconnect();
