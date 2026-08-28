import { db } from "@/lib/db";

const username = String(process.env.ADMIN_USERNAME ?? "").trim().toLowerCase();
const roleCode = String(process.env.ADMIN_ROLE ?? "SUPER_ADMIN").trim().toUpperCase();
const scopeType = String(process.env.ADMIN_SCOPE_TYPE ?? "NATIONAL").trim().toUpperCase();
const scopeId = process.env.ADMIN_SCOPE_ID?.trim() || null;

if (!username || !username.includes("@")) throw new Error("ADMIN_USERNAME must be a valid admin email.");

const role = await db.role.findUnique({ where: { code: roleCode } });
if (!role || role.status !== "ACTIVE") throw new Error(`Role ${roleCode} is not seeded or active.`);

const user = await db.user.upsert({
  where: { email: username },
  update: { displayName: process.env.ADMIN_DISPLAY_NAME?.trim() || "SACA Administrator", status: "ACTIVE" },
  create: { email: username, displayName: process.env.ADMIN_DISPLAY_NAME?.trim() || "SACA Administrator", status: "ACTIVE" },
});

await db.userRole.updateMany({ where: { userId: user.id, status: "ACTIVE" }, data: { status: "REVOKED", endsAt: new Date() } });
await db.userRole.create({ data: { userId: user.id, roleId: role.id, scopeType, scopeId, status: "ACTIVE" } });

console.log(`Provisioned ${username} as ${roleCode} (${scopeType}${scopeId ? `:${scopeId}` : ""}).`);
await db.$disconnect();
