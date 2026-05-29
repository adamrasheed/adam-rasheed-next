import crypto from "crypto";

export const runtime = "nodejs";

const TAG = "Adam Rasheed Ceramics";

export async function POST(request: Request) {
  const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
  const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;
  const MAILCHIMP_SERVER = process.env.MAILCHIMP_SERVER?.trim();

  if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID || !MAILCHIMP_SERVER) {
    return Response.json({ error: "Mailchimp is not configured." }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { firstName, email } = body as Record<string, unknown>;
  const firstNameStr = typeof firstName === "string" ? firstName.trim() : "";
  const emailStr = typeof email === "string" ? email.trim() : "";

  if (!firstNameStr || !emailStr) {
    return Response.json({ error: "Email and first name are required." }, { status: 400 });
  }

  const subscriberHash = crypto
    .createHash("md5")
    .update(emailStr.toLowerCase())
    .digest("hex");

  const baseUrl = `https://${MAILCHIMP_SERVER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}`;
  const authHeader = `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString("base64")}`;

  // Upsert the member (PUT creates or updates)
  let memberRes: Response;
  try {
    memberRes = await fetch(`${baseUrl}/members/${subscriberHash}`, {
      method: "PUT",
      cache: "no-store",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: emailStr,
        status_if_new: "subscribed",
        merge_fields: { FNAME: firstNameStr },
      }),
    });
  } catch {
    return Response.json({ error: "Failed to reach Mailchimp." }, { status: 502 });
  }

  if (!memberRes.ok) {
    let detail = "Failed to subscribe.";
    try {
      const err = await memberRes.json();
      if (typeof err?.detail === "string") detail = err.detail;
    } catch {
      // non-JSON body — use fallback message
    }
    const status = memberRes.status >= 400 && memberRes.status < 500 ? 400 : 500;
    return Response.json({ error: detail }, { status });
  }

  // Apply the tag — subscription already succeeded; tag failure is non-fatal
  try {
    const tagRes = await fetch(`${baseUrl}/members/${subscriberHash}/tags`, {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tags: [{ name: TAG, status: "active" }] }),
    });
    if (!tagRes.ok) {
      console.error(`Mailchimp tag failed for ${subscriberHash}: ${tagRes.status}`);
    }
  } catch (err) {
    console.error("Mailchimp tag request threw:", err);
  }

  return Response.json({ ok: true });
}
