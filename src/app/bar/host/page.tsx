import { signOut } from "@/auth";
import { getBarState } from "@/sanity/lib/barState";
import { getHostShelf } from "@/sanity/lib/hostShelf";
import { isHostAuthed, isHostConfigured } from "@/sanity/lib/hostAuth";

import HostConsole from "./_components/HostConsole";
import HostLogin from "./_components/HostLogin";

export const metadata = {
  title: "Bar Host",
  robots: { index: false, follow: false },
};

type BarHostPageProps = {
  // Next hands back an array when a query param repeats (?error=a&error=b),
  // so the raw value is not a string just because one is expected.
  searchParams: { error?: string | string[] };
};

// Pinned rather than left to inference. isHostAuthed reads the session cookie,
// which is dynamic on its own, but only once isHostConfigured passes: a build
// without the Google credentials set short-circuits before touching cookies and
// prerenders the signed-out page as static. An auth gate must not be decided at
// build time by which environment variables happened to be present.
export const dynamic = "force-dynamic";

export default async function BarHostPage({ searchParams }: BarHostPageProps) {
  const configured = isHostConfigured();
  const authed = configured && (await isHostAuthed());
  const [initialState, shelf] = authed
    ? await Promise.all([getBarState(), getHostShelf()])
    : [null, null];

  return (
    <div className="page-container sml">
      <h1 className="page-title">Behind the Bar</h1>

      {!configured && (
        <p className="text-sm">
          Set <code>BAR_HOST_EMAIL</code>, <code>AUTH_SECRET</code>,{" "}
          <code>AUTH_GOOGLE_ID</code>, and <code>AUTH_GOOGLE_SECRET</code> in
          the environment to use this page.
        </p>
      )}

      {configured && !authed && (
        <HostLogin
          error={
            Array.isArray(searchParams.error)
              ? searchParams.error[0]
              : searchParams.error
          }
        />
      )}

      {authed && initialState && shelf && (
        <HostConsole
          initialState={initialState}
          shelf={shelf}
          signOutAction={async () => {
            "use server";

            await signOut({ redirectTo: "/bar/host" });
          }}
        />
      )}
    </div>
  );
}
