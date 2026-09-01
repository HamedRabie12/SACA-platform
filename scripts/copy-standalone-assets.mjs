import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyDir(src, dst) {
  if (!fs.existsSync(src)) {
    throw new Error(`copy-standalone-assets: source not found: ${src}`);
  }
  ensureDir(dst);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else if (entry.isFile()) {
      fs.copyFileSync(s, d);
    } else if (entry.isSymbolicLink()) {
      const real = fs.realpathSync(s);
      const stat = fs.statSync(real);
      if (stat.isDirectory()) {
        copyDir(real, d);
      } else {
        ensureDir(path.dirname(d));
        fs.copyFileSync(real, d);
      }
    }
  }
}

const pairs = [
  [path.join(root, ".next", "static"), path.join(root, ".next", "standalone", ".next", "static")],
  [path.join(root, "public"), path.join(root, ".next", "standalone", "public")],
];

let copiedAnything = false;
for (const [src, dst] of pairs) {
  if (!fs.existsSync(src)) {
    throw new Error(`copy-standalone-assets: missing source: ${src}`);
  }
  copyDir(src, dst);
  copiedAnything = true;
  console.log(`copy-standalone-assets: ${src} -> ${dst}`);
}

if (!copiedAnything) {
  throw new Error("copy-standalone-assets: no assets copied");
}

console.log("copy-standalone-assets: done");
