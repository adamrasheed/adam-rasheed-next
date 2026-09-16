import { getBarWriteClient } from "@/sanity/lib/barClient";
import { invalidateBarState } from "@/sanity/lib/barState";
import { isHostAuthed } from "@/sanity/lib/hostAuth";

import { fail, ok, readJsonObject } from "../../_lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Singleton: one document, fixed id, matching what the Studio structure opens.
const SESSION_ID = "barSession";
const SESSION_TYPE = "barSession";

/** Open or close the bar. */
export async function POST(request: Request) {
  if (!(await isHostAuthed())) return fail("Not signed in.", 401);

  const writeClient = getBarWriteClient();

  if (!writeClient) return fail("The bar isn't set up to take orders yet.", 500);

  const body = await readJsonObject(request);

  if (!body) return fail("Malformed request.", 400);

  const open = body.open;

  if (typeof open !== "boolean") return fail("Malformed request.", 400);

  try {
    await writeClient
      .transaction()
      .createIfNotExists({ _id: SESSION_ID, _type: SESSION_TYPE, open: false })
      .patch(SESSION_ID, (patch) =>
        patch.set(
          open ? { open: true, openedAt: new Date().toISOString() } : { open: false }
        )
      )
      .commit();

    invalidateBarState();

    return ok({ open });
  } catch (error) {
    console.error("Failed to toggle the bar", error);

    return fail("Couldn't flip that switch. Try again.", 502);
  }
}
