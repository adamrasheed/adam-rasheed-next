import "server-only";

import { auth, getHostEmail } from "@/auth";

export { getHostEmail };

/** Set to something that is not just whitespace. */
function isSet(value: string | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Is the console wired up at all? The page says so rather than showing a button
 * that cannot work.
 *
 * AUTH_SECRET is in here alongside the Google credentials because leaving it
 * out fails later and worse: the sign-in button renders, Google hands back a
 * valid code, and Auth.js then cannot sign the session. A half-configured
 * deploy should say so on the page, not at the end of a round trip.
 */
export function isHostConfigured() {
  return Boolean(
    getHostEmail() &&
      isSet(process.env.AUTH_SECRET) &&
      isSet(process.env.AUTH_GOOGLE_ID) &&
      isSet(process.env.AUTH_GOOGLE_SECRET)
  );
}

/**
 * The one gate every host surface goes through: the page and each host API
 * route. The signIn callback already refuses to mint a session for anyone else,
 * so this is the second of two checks. It is here because the first one runs
 * once at sign-in while this one runs on every request, which is what makes
 * changing BAR_HOST_EMAIL take effect immediately instead of whenever the
 * existing session happens to expire.
 */
export async function isHostAuthed() {
  const allowed = getHostEmail();

  if (!allowed) return false;

  const session = await auth();
  const email = session?.user?.email;

  return typeof email === "string" && email.toLowerCase() === allowed;
}
