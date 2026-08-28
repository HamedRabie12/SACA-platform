import fs from 'node:fs';
import path from 'node:path';

const target = path.join('prisma', 'migrations', '0001_postgresql_foundation', 'migration.sql');
let content = fs.readFileSync(target, 'utf8');
let count = 0;
content = content.replace(/DEFAULT\s+"([^"]+)"/g, (m, val) => {
  count++;
  return "DEFAULT '" + val + "'";
});
fs.writeFileSync(target, content, 'utf8');
console.log('FIXED', count, 'DEFAULT "X" -> DEFAULT \'X\' in', target);
