import { validatePreviewUrl } from "@sanity/preview-url-secret";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { client } from "@/sanity/lib/client";

// Presentation in /studio calls this with a one-time secret; validating it
// against Sanity is what stops anyone else from turning on draft mode.
export async function GET(request: Request) {
  const token = process.env.SANITY_API_READ_TOKEN;
  if (!token) {
    return new Response("Missing SANITY_API_READ_TOKEN", { status: 500 });
  }

  const { isValid, redirectTo = "/" } = await validatePreviewUrl(
    client.withConfig({ token, useCdn: false }),
    request.url
  );

  if (!isValid) return new Response("Invalid secret", { status: 401 });

  draftMode().enable();
  redirect(redirectTo);
}
