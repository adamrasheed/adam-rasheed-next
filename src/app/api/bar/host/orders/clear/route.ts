import { getBarWriteClient } from "@/sanity/lib/barClient";
import { invalidateBarState } from "@/sanity/lib/barState";
import { isHostAuthed } from "@/sanity/lib/hostAuth";

import { fail, ok } from "../../../_lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Wipe the whole queue at the end of the night. */
export async function POST() {
  if (!(await isHostAuthed())) return fail("Not signed in.", 401);

  const writeClient = getBarWriteClient();

  if (!writeClient) return fail("The bar isn't set up to take orders yet.", 500);

  try {
    await writeClient.delete({ query: '*[_type == "order"]' });

    invalidateBarState();

    return ok({ cleared: true });
  } catch (error) {
    console.error("Failed to clear the queue", error);

    return fail("Couldn't clear the queue. Try again.", 502);
  }
}
