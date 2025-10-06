// lib/quota.ts
import { kv } from "@vercel/kv";

type Opts = {
  sessionId: string;
  functionName: string;
  limit: number;           // 例: 1日20回
  windowSec?: number;      // 例: 86400 = 24h
};

export async function checkQuotaOrThrow({
  sessionId,
  functionName,
  limit,
  windowSec = 60 * 60 * 24,
}: Opts) {
  const key = `quota:${functionName}:${sessionId}`;
  console.log("key", key)
  // 原子的にカウント
  const n = await kv.incr(key);

  // 初回だけ TTL を付与
  if (n === 1) {
    await kv.expire(key, windowSec);
  }

  if (n > limit) {
    const ttl = await kv.ttl(key); // 残り秒
    const err = new Error("QUOTA_EXCEEDED") as Error & { meta?: { remaining: number; reset: number } };
    err.meta = { remaining: 0, reset: ttl > 0 ? ttl : windowSec };
    throw err;
  }

  return { remaining: Math.max(0, limit - n) };
}
