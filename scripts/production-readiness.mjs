import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredEnv = [
  'DATABASE_URL',
  'ADMIN_SESSION_SECRET',
  'ELECTION_ENCRYPTION_KEY',
];
const optionalProd = [
  'REDIS_URL',
  'LIVEKIT_URL',
  'LIVEKIT_API_KEY',
  'LIVEKIT_API_SECRET',
  'S3_ENDPOINT',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
  'RESEND_API_KEY',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'STRIPE_SECRET_KEY',
];

const checks = [];
checks.push({name:'Prisma schema exists', ok:fs.existsSync(path.join(root,'prisma','schema.prisma'))});
checks.push({name:'PostgreSQL datasource', ok:/provider\s*=\s*"postgresql"/.test(fs.readFileSync(path.join(root,'prisma','schema.prisma'),'utf8'))});
checks.push({name:'No SQLite datasource', ok:!/provider\s*=\s*"sqlite"/.test(fs.readFileSync(path.join(root,'prisma','schema.prisma'),'utf8'))});
checks.push({name:'No hardcoded legacy admin token', ok:!fs.readFileSync(path.join(root,'src','lib','security','admin-session.ts'),'utf8').includes('saca-admin-2026')});
checks.push({name:'No ignored TypeScript build errors', ok:!fs.readFileSync(path.join(root,'next.config.ts'),'utf8').includes('ignoreBuildErrors')});
checks.push({name:'No ignored ESLint build errors', ok:!fs.readFileSync(path.join(root,'next.config.ts'),'utf8').includes('ignoreDuringBuilds')});
for (const name of requiredEnv) checks.push({name:`Required secret present in environment: ${name}`, ok:Boolean(process.env[name])});
for (const name of optionalProd) checks.push({name:`Optional production integration: ${name}`, ok:Boolean(process.env[name]), optional:true});
const failed = checks.filter(c=>!c.ok && !c.optional);
console.table(checks);
process.exitCode = failed.length ? 1 : 0;
