import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * The one address allowed behind the bar. Read at call time rather than at
 * module load so a missing variable is a locked door, not a crashed build.
 */
export function getHostEmail() {
  const email = process.env.BAR_HOST_EMAIL;

  return typeof email === "string" && email.trim().length > 0
    ? email.trim().toLowerCase()
    : null;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Reads AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET from the environment.
  providers: [Google],

  // No database: the session is a signed JWT cookie. There is exactly one user
  // and nothing to store about him, so a session table would be upkeep with no
  // reader.
  session: { strategy: "jwt" },

  callbacks: {
    /**
     * The allowlist. Anyone can start the Google flow, but only the configured
     * address gets a session, so the console is not protected by the URL being
     * unlisted. Returning false sends Google back with AccessDenied.
     */
    signIn({ profile }) {
      const allowed = getHostEmail();

      if (!allowed) return false;

      // Google will hand back an address the account has not proven it owns if
      // the workspace never verified it, and that address is the whole check.
      if (profile?.email_verified !== true) return false;

      return (
        typeof profile.email === "string" &&
        profile.email.toLowerCase() === allowed
      );
    },
  },

  // Both point at the console itself: it renders the sign-in button, and reads
  // ?error to explain a rejected account instead of showing Auth.js's own page.
  pages: { signIn: "/bar/host", error: "/bar/host" },
});
