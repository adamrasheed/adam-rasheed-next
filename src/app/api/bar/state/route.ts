import { NextResponse } from "next/server";

import { getBarState } from "@/sanity/lib/barState";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * What every guest polls. The Sanity read behind this is cached for two seconds
 * and shared, so poll cost is flat in the number of guests. The HTTP
 * response itself must never be cached, or a browser would sit on a stale queue.
 */
export async function GET() {
  try {
    const state = await getBarState();

    return NextResponse.json(state, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Failed to read bar state", error);

    return NextResponse.json(
      { error: "Couldn't reach the bar." },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
