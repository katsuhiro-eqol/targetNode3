import { createClient } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const kv = createClient({
    url: process.env.KV_REST_API_URL!,     // ← UpstashのREST URL
    token: process.env.KV_REST_API_TOKEN!, // ← UpstashのREST TOKEN
});

const TTL_MS = 3 * 24 * 60 * 60 * 1000; // 許可期間（3日）

const COOKIE = "session_id";

function randomId() {
  const u8 = new Uint8Array(16);
  crypto.getRandomValues(u8);
  return Buffer.from(u8).toString("base64url");
}

export async function GET(request: NextRequest) {
  const sid = request.cookies.get(COOKIE)?.value || randomId();

  const now = Date.now();
  const session = { firstSeen: now, expiresAt: now + TTL_MS, lastRenewedAt: now };
  const expired = new Date(session.expiresAt)

  // セッション保存（キー自体にもTTLを付与：念のため1h長くする）
  await kv.set(`session:${sid}`, session, { ex: Math.ceil(TTL_MS / 1000) + 3600 });

  const url = new URL(request.url);

  const to = url.searchParams.get("to") || "/";

  const response = NextResponse.redirect(new URL(to, request.url));
  response.cookies.set(COOKIE, sid, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/",
    maxAge: 60 * 60 * 24 * 30, // クッキー寿命は長めでOK（真正の期限はKVで判定）
  });
  return response;
}