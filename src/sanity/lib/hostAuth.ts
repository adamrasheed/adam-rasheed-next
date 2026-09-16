import "server-only";

import { auth, getHostEmail } from "@/auth";

export { getHostEmail };

/**
 * Is the console wired up at all? A missing Google credential or allowed
 * address means nobody can sign in, and the page says so rather than showing a
 * button that cannot work.
 */
export function isHostConfigured() {
  return Boolean(
    getHostEmail() &&
      process.env.AUTH_GOOGLE_ID &&
      process.env.AUTH_GOOGLE_SECRET
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
