import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { checkQuotaOrThrow } from "@/lib/quota";

const LIMIT_PER_DAY = 30;              // 例: 1日30回
const FUNCTION_NAME = "getAnswer";   // 関数ごとに名前を分ける

export async function POST() {
  const sessionId = (await cookies()).get("session_id")?.value;
  console.log("session_id", sessionId)
  if (!sessionId) return NextResponse.json({ error: "NO_SESSION" }, { status: 401 });

  try {
    const { remaining } = await checkQuotaOrThrow({
      sessionId, functionName: FUNCTION_NAME, limit: LIMIT_PER_DAY
    });

    // --- ここから本来の処理 ---
    // const result = await runYourFunction(); // 実行
    // --------------------------

    return NextResponse.json({ ok: true, remaining });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "QUOTA_EXCEEDED") {
      const errorWithMeta = e as Error & { meta?: { reset: number } };
      return NextResponse.json(
        { error: "QUOTA_EXCEEDED", remaining: 0, resetSec: errorWithMeta.meta?.reset ?? undefined },
        { status: 429 },
      );
    }
    return NextResponse.json({ error: "INTERNAL" }, { status: 500 });
  }
}