import fs from "node:fs";
import process from "node:process";

const isVercelBuild = Boolean(process.env.VERCEL);

if (isVercelBuild) {
  console.log("STANDALONE VERIFY SKIPPED (VERCEL build)");
  process.exit(0);
}

const required = [".next/standalone/server.js", ".next/static", "public"];
const missing = required.filter((p) => !fs.existsSync(p));

if (missing.length) {
  console.error("STANDALONE VERIFY FAIL");
  for (const item of missing) {
    console.error(`- missing ${item}`);
  }
  process.exit(1);
}

console.log("STANDALONE VERIFY PASS");
