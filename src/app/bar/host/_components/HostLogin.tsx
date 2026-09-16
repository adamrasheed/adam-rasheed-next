import { signIn } from "@/auth";

type HostLoginProps = {
  /** Auth.js error code from the query string, if it bounced a sign-in. */
  error?: string;
};

export default function HostLogin({ error }: HostLoginProps) {
  return (
    <div className="grid gap-4 max-w-xs">
      {/* AccessDenied is the signIn callback refusing an address that is not
          the host's, which is the only rejection worth explaining: it means the
          wrong Google account is signed in on this phone, not that anything is
          broken. */}
      {error === "AccessDenied" ? (
        <p role="alert" className="text-sm font-bold">
          That Google account isn&apos;t the one behind the bar. Switch accounts
          and try again.
        </p>
      ) : error ? (
        <p role="alert" className="text-sm font-bold">
          Sign-in didn&apos;t go through. Try again.
        </p>
      ) : null}

      <form
        action={async () => {
          "use server";

          await signIn("google", { redirectTo: "/bar/host" });
        }}
      >
        <button type="submit" className="btn primary w-full py-4 text-base">
          Sign in with Google
        </button>
      </form>
    </div>
  );
}
