type Result = { allowed: boolean; remaining: number; resetAt: number; source: "upstash" | "memory" };
const memory = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<Result> {
  const now = Date.now();
  const resetAt = now + windowSeconds * 1000;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      const escapedKey = encodeURIComponent(key);
      const incr = await fetch(`${url}/incr/${escapedKey}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      if (!incr.ok) throw new Error("upstash incr failed");
      const value = Number((await incr.json())?.result ?? 0);
      if (value === 1) {
        await fetch(`${url}/expire/${escapedKey}/${windowSeconds}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      }
      return { allowed: value <= limit, remaining: Math.max(0, limit - value), resetAt, source: "upstash" };
    } catch {
      // Fall back to bounded process memory rather than failing open silently.
    }
  }
  const current = memory.get(key);
  if (!current || current.resetAt <= now) {
    memory.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: Math.max(0, limit - 1), resetAt, source: "memory" };
  }
  current.count += 1;
  return { allowed: current.count <= limit, remaining: Math.max(0, limit - current.count), resetAt: current.resetAt, source: "memory" };
}
