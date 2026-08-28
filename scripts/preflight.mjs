import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? process.env.SACA_PROJECT_ROOT ?? process.cwd());
if (!fs.existsSync(path.join(root, 'package.json'))) {
  console.error(`PREFLIGHT FAIL — invalid project root: ${root}`);
  process.exit(2);
}

const files = [];
const findings = [];
const EXCLUDED = new Set(['node_modules', '.next', '.git', 'archive']);

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDED.has(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.(ts|tsx|js|mjs|json|md|yml|yaml|sh|sql)$/.test(entry.name)) files.push(file);
  }
}

walk(root);

const forbidden = [
  /saca-admin-2026/i,
  /SACA-MD-2026-Secure/i,
  /x-admin-token/i,
  /provider\s*=\s*["']sqlite["']/i,
  /ignoreBuildErrors\s*:\s*true/i,
  /ignoreDuringBuilds\s*:\s*true/i,
  /localStorage\.setItem\(["']saca-(session|member-id)/i,
  /sessionStorage\.setItem\(["']saca-admin/i,
  /prisma\s+db\s+push[^\n]*--accept-data-loss/i,
];

for (const file of files) {
  if (file.includes(`${path.sep}scripts${path.sep}`)) continue;
  const source = fs.readFileSync(file, 'utf8');
  for (const pattern of forbidden) {
    if (pattern.test(source)) findings.push(`${path.relative(root, file)} -> ${pattern}`);
  }
}

const required = [
  'prisma/schema.prisma',
  'prisma.config.ts',
  'prisma/migrations/migration_lock.toml',
  'src/lib/db.ts',
  'src/lib/security/admin-session.ts',
  'src/lib/security/member-session.ts',
  'src/middleware.ts',
  'docs/governance/CONSTITUTION.md',
  'docs/legal/SACA-CORP-ARTICLES-OF-REVIVAL.md',
  'src/app/governance/page.tsx',
  'src/app/governance/constitution/page.tsx',
  'src/app/governance/legal-status/page.tsx',
  'src/app/elections/page.tsx',
];
for (const requiredPath of required) {
  if (!fs.existsSync(path.join(root, requiredPath))) findings.push(`missing ${requiredPath}`);
}

const tempFiles = [];
function findTemp(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDED.has(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) findTemp(file);
    else if (/\.(tmp|bak|old)$/i.test(entry.name) || /~$/.test(entry.name)) tempFiles.push(path.relative(root, file));
  }
}
findTemp(root);
if (tempFiles.length) findings.push(`temporary files present: ${tempFiles.join(', ')}`);

if (findings.length) {
  console.error('PREFLIGHT FAIL');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}
console.log(`PREFLIGHT PASS — ${files.length} files scanned from ${root}`);
