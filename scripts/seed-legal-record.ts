import "dotenv/config";
import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { db } from "@/lib/db";

async function main() {
  const filePath = path.join(process.cwd(), "public/legal-saca-articles-of-revival.pdf");
  if (!fs.existsSync(filePath)) throw new Error(`Missing legal record: ${filePath}`);

  const hash = crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
  const fileUrl = "/legal-saca-articles-of-revival.pdf";

  const doc = await db.legalDocument.upsert({
    where: { id: "saca-corp-articles-of-revival" },
    update: {
      title: "Articles of Revival for the Charter of a Maryland Corporation",
      titleAr: "وثيقة الإحياء/السجل القانوني لـ SACA CORP.",
      documentType: "LEGAL_CORPORATE_RECORD",
      organizationName: "SUDANESE AMERICAN COMMUNITY ASSOCIATION / SACA CORP.",
      jurisdiction: "Maryland",
      issuingAuthority: "Maryland Department of Assessments and Taxation",
      filingDate: new Date("2025-11-07T00:00:00.000Z"),
      acknowledgmentNo: "1000362015123153",
      authenticationNo: "JvlACuFEs0W4HJfLNYTyTg",
      verificationUrl: "https://dat.maryland.gov/verify",
      fileUrl,
      originalFileHash: hash,
      status: "PUBLISHED",
      visibility: "PUBLIC",
      version: "1.0",
      publishedAt: new Date(),
    },
    create: {
      id: "saca-corp-articles-of-revival",
      title: "Articles of Revival for the Charter of a Maryland Corporation",
      titleAr: "وثيقة الإحياء/السجل القانوني لـ SACA CORP.",
      documentType: "LEGAL_CORPORATE_RECORD",
      organizationName: "SUDANESE AMERICAN COMMUNITY ASSOCIATION / SACA CORP.",
      jurisdiction: "Maryland",
      issuingAuthority: "Maryland Department of Assessments and Taxation",
      filingDate: new Date("2025-11-07T00:00:00.000Z"),
      acknowledgmentNo: "1000362015123153",
      authenticationNo: "JvlACuFEs0W4HJfLNYTyTg",
      verificationUrl: "https://dat.maryland.gov/verify",
      fileUrl,
      originalFileHash: hash,
      status: "PUBLISHED",
      visibility: "PUBLIC",
      version: "1.0",
      publishedAt: new Date(),
    },
  });

  console.log(`Legal record seeded: ${doc.id} SHA-256=${hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
