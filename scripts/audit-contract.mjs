import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? process.env.SACA_PROJECT_ROOT ?? process.cwd());
const errors = [];
const warnings = [];
const excluded = new Set(['node_modules', '.next', '.git', 'archive', 'docs']);

function walk(dir, out=[]) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file, out);
    else out.push(file);
  }
  return out;
}

const files = walk(root);
const textFiles = files.filter((f) => /\.(ts|tsx|js|mjs|json|yaml|yml|sh|sql|prisma)$/.test(f));
const source = new Map(textFiles.map((f) => [f, fs.readFileSync(f, 'utf8')]));

function assert(cond, message) { if (!cond) errors.push(message); }
function hasPath(p) { return fs.existsSync(path.join(root, p)); }

assert(hasPath('prisma/schema.prisma'), 'missing Prisma schema');
assert(/provider\s*=\s*["']postgresql["']/.test(source.get(path.join(root,'prisma/schema.prisma')) ?? ''), 'Prisma provider is not PostgreSQL');
assert(hasPath('prisma/migrations/migration_lock.toml'), 'missing Prisma migration lock');
assert(hasPath('src/lib/db.ts'), 'missing DB client');
assert(/PrismaPg/.test(source.get(path.join(root,'src/lib/db.ts')) ?? ''), 'DB client does not use PrismaPg');

const runtime = [...source.entries()].filter(([f]) => !f.includes(`${path.sep}scripts${path.sep}`));
for (const [file, text] of runtime) {
  assert(!/saca-admin-2026|SACA-MD-2026-Secure|x-admin-token/i.test(text), `legacy admin secret/token pattern in ${path.relative(root,file)}`);
  assert(!/localStorage\.(setItem|getItem)\([^)]*saca-(session|member-id|admin)/i.test(text), `legacy auth storage in ${path.relative(root,file)}`);
  assert(!/sessionStorage\.(setItem|getItem)\([^)]*saca-admin/i.test(text), `legacy admin storage in ${path.relative(root,file)}`);
}

for (const file of files) if (/\.(tmp|bak|old)$/.test(file) || file.endsWith('~')) errors.push(`temporary/backup runtime file: ${path.relative(root,file)}`);

const adminRoot = path.join(root,'src/app/api/admin');
for (const file of walk(adminRoot).filter((f) => f.endsWith('route.ts'))) {
  const rel = path.relative(adminRoot,file).replace(/\\/g,'/');
  const text = fs.readFileSync(file,'utf8');
  if (!['mfa/setup/route.ts','mfa/verify/route.ts','session/route.ts'].includes(rel) && !/requireAdminRequest\(/.test(text)) errors.push(`admin route missing centralized authorization: ${rel}`);
}

const duplicates = [
  ['content moderation', ['src/lib/moderation/content-filter.ts','src/lib/moderation/content-policy.ts']],
];
for (const [label, candidates] of duplicates) {
  const existing = candidates.filter(hasPath);
  if (existing.length > 1) warnings.push(`${label}: compatibility re-export set exists; canonical implementation must remain only in content-policy.ts`);
}

const modelText = source.get(path.join(root,'prisma/schema.prisma')) ?? '';
const modelCount = (modelText.match(/^model\s+/gm) ?? []).length;
assert(modelCount >= 100, `unexpectedly small Prisma domain model count: ${modelCount}`);

for (const required of [
  'src/app/governance/constitution/page.tsx',
  'src/app/governance/legal-status/page.tsx',
  'src/app/elections/page.tsx',
  'src/app/elections/[id]/vote/page.tsx',
  'src/app/meetings/[id]/page.tsx',
  'src/app/portal/membership/apply/page.tsx',
  'src/app/portal/service-requests/page.tsx',
  'src/app/portal/privacy/page.tsx',
  'src/app/portal/security/page.tsx',
  'src/app/admin/production-readiness/page.tsx',
]) assert(hasPath(required), `missing required product route: ${required}`);

if (errors.length) {
  console.error('CONTRACT AUDIT: FAIL');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`CONTRACT AUDIT: PASS — ${modelCount} Prisma models, ${textFiles.length} source/config files checked`);
if (warnings.length) { console.log('WARNINGS:'); for (const warning of warnings) console.log(`- ${warning}`); }
