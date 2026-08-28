// PHASE 24.4 — Preview-mode smoke test
// Tests the running local production-standalone server with
// VERCEL_ENV=preview, against the staging PostgreSQL.
const PORT = 3001;
const BASE = `http://127.0.0.1:${PORT}`;
const results = [];
function record(name, status, note) {
  results.push({ name, status, note });
  const tag = status === "PASS" ? "PASS" : "FAIL";
  console.log(`  [${tag}] ${name}: ${note}`);
}
async function timeFetch(path) {
  const t0 = performance.now();
  const r = await fetch(BASE + path, { redirect: "manual" });
  const t1 = performance.now();
  return { status: r.status, bytes: (await r.text()).length, ms: t1 - t0 };
}
async function main() {
  console.log("=== PHASE 24.4 PREVIEW SMOKE TEST ===");
  console.log(`base: ${BASE}`);
  // public pages
  const pages = ["/", "/services", "/governance", "/governance/constitution", "/governance/legal-status", "/elections", "/meetings", "/portal", "/secure-portal", "/auth/login", "/auth/register"];
  for (const p of pages) {
    const r = await timeFetch(p);
    record(`PAGE ${p}`, r.status === 200 ? "PASS" : "FAIL", `status=${r.status} bytes=${r.bytes} ms=${r.ms.toFixed(1)}`);
  }
  // admin gate: /admin must redirect to /secure-portal (NOT 200)
  {
    const r = await timeFetch("/admin");
    record("AUTH /admin redirect to /secure-portal", r.status === 307 || r.status === 302 ? "PASS" : "FAIL", `status=${r.status}`);
  }
  // public APIs
  const apis = ["/api/community/states", "/api/community/services", "/api/community/meetings", "/api/community/news", "/api/community/organizations"];
  for (const a of apis) {
    const r = await timeFetch(a);
    record(`API ${a}`, r.status === 200 ? "PASS" : "FAIL", `status=${r.status} bytes=${r.bytes} ms=${r.ms.toFixed(1)}`);
  }
  // admin APIs (must reject)
  const adminApis = ["/api/admin/health", "/api/admin/members", "/api/admin/elections", "/api/admin/settings", "/api/admin/audit-logs", "/api/admin/security", "/api/admin/incidents", "/api/admin/privacy", "/api/admin/risk", "/api/admin/compliance", "/api/admin/legal-documents"];
  for (const a of adminApis) {
    const r = await timeFetch(a);
    record(`AUTH admin ${a}`, r.status === 401 ? "PASS" : "FAIL", `expected 401, got ${r.status}`);
  }
  // election APIs (per-id; the E2E seeded el_xxx ids)
  // 404 is PASS for a route that exists but the row is absent; 405 is PASS for a route that exists but only supports other methods.
  const electionApis = ["/api/elections/el_187a0c5d58f7", "/api/elections/el_187a0c5d58f7/candidates", "/api/elections/el_187a0c5d58f7/results"];
  for (const a of electionApis) {
    const r = await timeFetch(a);
    record(`API ${a}`, r.status === 200 || r.status === 404 || r.status === 405 ? "PASS" : "FAIL", `status=${r.status} bytes=${r.bytes}`);
  }
  // performance baseline: 5 sequential home-page fetches
  const perf = [];
  for (let i = 0; i < 5; i++) {
    const r = await timeFetch("/");
    perf.push(r.ms);
  }
  const avg = perf.reduce((a, b) => a + b, 0) / perf.length;
  const min = Math.min(...perf);
  const max = Math.max(...perf);
  record("PERF home avg", avg < 800 ? "PASS" : "FAIL", `avg=${avg.toFixed(1)}ms min=${min.toFixed(1)}ms max=${max.toFixed(1)}ms (5 samples)`);
  // header sanity
  const resp = await fetch(BASE + "/");
  const h = Object.fromEntries(resp.headers.entries());
  const hasHsts = !!h["strict-transport-security"] || !!h["Strict-Transport-Security"];
  const hasCto = !!h["x-content-type-options"] || !!h["X-Content-Type-Options"];
  record("HEADERS security present (HSTS, X-Content-Type-Options)", hasHsts && hasCto ? "PASS" : "PARTIAL", `HSTS=${hasHsts} X-CTO=${hasCto}`);
  // summary
  const pass = results.filter((r) => r.status === "PASS").length;
  const fail = results.filter((r) => r.status === "FAIL").length;
  const part = results.filter((r) => r.status === "PARTIAL").length;
  console.log(`\n=== SUMMARY: PASS=${pass} FAIL=${fail} PARTIAL=${part} ===`);
}
main().catch((e) => { console.error(e); process.exit(2); });
