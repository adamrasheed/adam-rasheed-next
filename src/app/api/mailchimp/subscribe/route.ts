import crypto from "crypto";

export const runtime = "nodejs";

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;
const MAILCHIMP_SERVER = process.env.MAILCHIMP_SERVER;
const TAG = "Adam Rasheed Ceramics";

export async function POST(request: Request) {
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

  const { firstName, lastName, email } = body as Record<string, unknown>;
  const firstNameStr = typeof firstName === "string" ? firstName.trim() : "";
  const lastNameStr = typeof lastName === "string" ? lastName.trim() : "";
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
  const memberRes = await fetch(`${baseUrl}/members/${subscriberHash}`, {
    method: "PUT",
    cache: "no-store",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: emailStr,
      status_if_new: "subscribed",
      merge_fields: {
        FNAME: firstNameStr,
        LNAME: lastNameStr,
      },
    }),
  });

  if (!memberRes.ok) {
    let detail = "Failed to subscribe.";
    try {
      const err = await memberRes.json();
      if (typeof err?.detail === "string") detail = err.detail;
    } catch {
      // non-JSON body — use fallback message
    }
    return Response.json({ error: detail }, { status: memberRes.status });
  }

  // Apply the tag
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
    return Response.json({ error: "Subscribed, but failed to apply tag." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
