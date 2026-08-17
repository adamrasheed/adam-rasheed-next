import { getBarState } from "@/sanity/lib/barState";
import { getHostPasscode, isHostAuthed } from "@/sanity/lib/hostAuth";

import HostConsole from "./_components/HostConsole";
import HostLogin from "./_components/HostLogin";

export const metadata = {
  title: "Bar Host",
  robots: { index: false, follow: false },
};

// isHostAuthed reads cookies, so this never renders statically.
export default async function BarHostPage() {
  const configured = getHostPasscode() !== null;
  const authed = configured && isHostAuthed();
  const initialState = authed ? await getBarState() : null;

  return (
    <div className="page-container sml">
      <h1 className="page-title">Behind the Bar</h1>

      {!configured && (
        <p className="text-sm">
          Set <code>BAR_HOST_PASSCODE</code> in the environment to use this
          page.
        </p>
      )}

      {configured && !authed && <HostLogin />}

      {authed && initialState && <HostConsole initialState={initialState} />}
    </div>
  );
}
