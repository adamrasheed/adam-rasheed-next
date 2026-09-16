import { signOut } from "@/auth";
import { getBarState } from "@/sanity/lib/barState";
import { isHostAuthed, isHostConfigured } from "@/sanity/lib/hostAuth";

import HostConsole from "./_components/HostConsole";
import HostLogin from "./_components/HostLogin";

export const metadata = {
  title: "Bar Host",
  robots: { index: false, follow: false },
};

type BarHostPageProps = {
  searchParams: { error?: string };
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
  const initialState = authed ? await getBarState() : null;

  return (
    <div className="page-container sml">
      <h1 className="page-title">Behind the Bar</h1>

      {!configured && (
        <p className="text-sm">
          Set <code>BAR_HOST_EMAIL</code>, <code>AUTH_GOOGLE_ID</code>, and{" "}
          <code>AUTH_GOOGLE_SECRET</code> in the environment to use this page.
        </p>
      )}

      {configured && !authed && <HostLogin error={searchParams.error} />}

      {authed && initialState && (
        <HostConsole
          initialState={initialState}
          signOutAction={async () => {
            "use server";

            await signOut({ redirectTo: "/bar/host" });
          }}
        />
      )}
    </div>
  );
}
