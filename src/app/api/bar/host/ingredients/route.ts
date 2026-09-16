import { getBarWriteClient } from "@/sanity/lib/barClient";
import { invalidateBarState } from "@/sanity/lib/barState";
import { isHostAuthed } from "@/sanity/lib/hostAuth";

import { fail, ok, readJsonObject, trimmedString } from "../../_lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Flip one bottle in or out of stock. */
export async function PATCH(request: Request) {
  if (!(await isHostAuthed())) return fail("Not signed in.", 401);

  const writeClient = getBarWriteClient();

  if (!writeClient) return fail("The bar isn't set up to take orders yet.", 500);

  const body = await readJsonObject(request);

  if (!body) return fail("Malformed request.", 400);

  const ingredientId = trimmedString(body.ingredientId);
  const inStock = body.inStock;

  if (!ingredientId) return fail("Malformed request.", 400);
  if (typeof inStock !== "boolean") return fail("Malformed request.", 400);

  try {
    // Patching a missing id is a no-op in Sanity rather than an error, so the
    // fetch afterwards is what turns a bad id into a 404 instead of a silent
    // success the console would render as a working toggle.
    await writeClient.patch(ingredientId).set({ inStock }).commit();

    const saved = await writeClient.fetch<{ inStock: boolean } | null>(
      `*[_type == "ingredient" && _id == $id][0]{ "inStock": inStock == true }`,
      { id: ingredientId }
    );

    if (!saved) return fail("No such ingredient.", 404);

    // The menu is derived from stock, so a flip changes what /bar shows and the
    // guests' cached state has to go with it.
    invalidateBarState();

    return ok({ ingredientId, inStock: saved.inStock });
  } catch (error) {
    console.error("Failed to set ingredient stock", error);

    return fail("Couldn't update that bottle. Try again.", 502);
  }
}
