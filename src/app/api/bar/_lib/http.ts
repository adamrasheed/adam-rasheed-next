import { NextResponse } from "next/server";

export const NO_STORE = { "Cache-Control": "no-store" } as const;

export function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: NO_STORE });
}

export function ok<T extends object>(body: T, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

/**
 * Malformed bodies throw, and an empty body is not the same as `{}`. Returns
 * null for anything that is not a JSON object so callers can 400 uniformly.
 */
export async function readJsonObject(
  request: Request
): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return null;
    }

    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function trimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
