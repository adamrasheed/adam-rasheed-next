import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

// Signature verification uses node:crypto.
export const runtime = "nodejs";

// Sanity GROQ webhook target. Configure it with the projection {_type} and the
// same secret as SANITY_REVALIDATE_SECRET; every page tagged with that type
// refreshes on publish instead of waiting out the fetch cache.
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { message: "Missing SANITY_REVALIDATE_SECRET" },
      { status: 500 }
    );
  }

  let parsed;
  try {
    parsed = await parseBody<{ _type?: unknown }>(req, secret);
  } catch {
    return NextResponse.json({ message: "Malformed body" }, { status: 400 });
  }

  if (!parsed.isValidSignature) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  const type = typeof parsed.body?._type === "string" ? parsed.body._type.trim() : "";
  if (!type) {
    return NextResponse.json({ message: "Missing _type" }, { status: 400 });
  }

  revalidateTag(type);
  return NextResponse.json({ revalidated: type });
}
