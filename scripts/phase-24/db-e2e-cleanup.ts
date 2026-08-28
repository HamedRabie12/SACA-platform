// Cleanup script for PHASE 24.3 E2E stage data.
// Removes only the rows tagged with phase-24 test IDs.
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString: url });
const db = new PrismaClient({ adapter, log: ["error"] });

async function main() {
  console.log("Cleanup starting");
  // by email pattern
  const t = await db.member.deleteMany({ where: { email: { contains: "@saca-test.local" } } });
  console.log("deleted saca-test members", t.count);
  // delete otherMember
  const o = await db.member.deleteMany({ where: { email: { contains: "@x.local" } } });
  console.log("deleted x.local members", o.count);
  // test state
  const s = await db.uSState.deleteMany({ where: { code: "ZZ" } });
  console.log("deleted ZZ state", s.count);
  // test election
  const e = await db.election.deleteMany({ where: { name: { contains: "Phase24" } } });
  console.log("deleted test elections", e.count);
  // test boards
  const b = await db.board.deleteMany({ where: { title: "Test Board" } });
  console.log("deleted test boards", b.count);
  // test positions
  const p = await db.position.deleteMany({ where: { code: "PRES" } });
  console.log("deleted test positions", p.count);
  // test offices
  const o2 = await db.office.deleteMany({ where: { code: "OFF_PRES" } });
  console.log("deleted test offices", o2.count);
  // test committees
  const c = await db.committee.deleteMany({ where: { code: "AUDIT" } });
  console.log("deleted test committees", c.count);
  // test services
  const sv = await db.service.deleteMany({ where: { code: { contains: "PHASE24_SVC_" } } });
  console.log("deleted test services", sv.count);
  // test constitutions
  const cst = await db.constitution.deleteMany({ where: { title: "Phase24 Test Constitution" } });
  console.log("deleted test constitutions", cst.count);
  // orphan test rules
  const rl = await db.constitutionRule.deleteMany({ where: { code: "PHASE24_RULE" } });
  console.log("deleted test rules", rl.count);
  // test audit logs
  const al = await db.auditLog.deleteMany({ where: { action: "phase24-e2e-test" } });
  console.log("deleted test audit logs", al.count);
  await db.$disconnect();
}
main().catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1); });
