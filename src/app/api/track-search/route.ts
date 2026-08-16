import { NextRequest, NextResponse } from "next/server";
import { recordSearchQuery } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as { query?: unknown } | null;
    const query = typeof body?.query === "string" ? body.query.trim() : "";

    if (!query || query.length > 200) {
      return NextResponse.json({ ok: true });
    }

    await recordSearchQuery({
      query,
      source: "searchbox",
      userAgent: request.headers.get("user-agent") ?? undefined,
      referrer: request.headers.get("referer") ?? undefined,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
