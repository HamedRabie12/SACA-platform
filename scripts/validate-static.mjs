import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? process.env.SACA_PROJECT_ROOT ?? process.cwd());
if (!fs.existsSync(path.join(root, 'package.json'))) {
  console.error(`STATIC VALIDATION FAIL — invalid project root: ${root}`);
  process.exit(2);
}

const excluded = new Set(['node_modules', '.next', '.git', 'archive', 'docs']);
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.(ts|tsx|js|mjs|json|yaml|yml|sh|sql)$/.test(entry.name)) files.push(file);
  }
}
walk(root);

const forbidden = [
  /saca-admin-2026/i,
  /SACA-MD-2026-Secure/i,
  /x-admin-token/i,
  /referer\.includes\(["']\/admin/i,
  /localStorage\.\s*(setItem|getItem).*saca-(session|member-id|admin)/i,
  /sessionStorage\.\s*(setItem|getItem).*saca-admin/i,
  /provider\s*=\s*["']sqlite["']/i,
  /ignoreBuildErrors\s*:\s*true/i,
  /ignoreDuringBuilds\s*:\s*true/i,
  /prisma\s+db\s+push[^\n]*--accept-data-loss/i,
];

const failures = [];
for (const file of files) {
  if (file.includes(`${path.sep}scripts${path.sep}`)) continue;
  const source = fs.readFileSync(file, 'utf8');
  for (const pattern of forbidden) if (pattern.test(source)) failures.push(`${path.relative(root, file)} matches ${pattern}`);
}

for (const required of [
  'prisma/schema.prisma',
  'prisma.config.ts',
  'src/lib/db.ts',
  'src/lib/security/admin-session.ts',
  'src/lib/security/member-session.ts',
  'src/middleware.ts',
  'docs/governance/CONSTITUTION.md',
  'docs/legal/SACA-CORP-ARTICLES-OF-REVIVAL.md',
  'public/legal-saca-articles-of-revival.pdf',
]) if (!fs.existsSync(path.join(root, required))) failures.push(`missing ${required}`);

if (failures.length) {
  console.error('STATIC VALIDATION FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`STATIC VALIDATION PASS — scanned ${files.length} files from ${root}`);
