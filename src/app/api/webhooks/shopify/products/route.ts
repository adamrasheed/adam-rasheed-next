import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function verifyShopifyHmac(
  rawBody: string,
  hmacHeader: string | null,
  secret: string,
): boolean {
  if (!hmacHeader) return false;
  const digest = createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");
  try {
    const a = new Uint8Array(Buffer.from(digest, "utf8"));
    const b = new Uint8Array(Buffer.from(hmacHeader, "utf8"));
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) {
    return Response.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  const hmac = request.headers.get("X-Shopify-Hmac-Sha256");
  const rawBody = await request.text();

  if (!verifyShopifyHmac(rawBody, hmac, secret)) {
    return new Response("Unauthorized", { status: 401 });
  }

  return new Response(null, { status: 200 });
}
