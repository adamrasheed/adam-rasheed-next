import crypto from "crypto";

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY!;
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID!;
const TAG = "Adam Rasheed Ceramics";

export async function POST(request: Request) {
  const { firstName, lastName, email } = await request.json();

  if (!email || !firstName) {
    return Response.json({ error: "Email and first name are required." }, { status: 400 });
  }

  // The server prefix is embedded at the end of the API key, e.g. "xxxxxxxx-us14"
  const serverPrefix = MAILCHIMP_API_KEY.split("-").pop();

  const subscriberHash = crypto
    .createHash("md5")
    .update(email.toLowerCase())
    .digest("hex");

  const baseUrl = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}`;
  const authHeader = `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString("base64")}`;

  // Upsert the member (PUT creates or updates)
  const memberRes = await fetch(`${baseUrl}/members/${subscriberHash}`, {
    method: "PUT",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: email,
      status_if_new: "subscribed",
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName ?? "",
      },
    }),
  });

  if (!memberRes.ok) {
    const err = await memberRes.json();
    return Response.json({ error: err.detail ?? "Failed to subscribe." }, { status: memberRes.status });
  }

  // Add the tag
  await fetch(`${baseUrl}/members/${subscriberHash}/tags`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tags: [{ name: TAG, status: "active" }] }),
  });

  return Response.json({ ok: true });
}
