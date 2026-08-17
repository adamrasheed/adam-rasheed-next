import { isOrderStatus } from "@/sanity/barOrderStatuses";
import { barReadClient, getBarWriteClient } from "@/sanity/lib/barClient";
import { invalidateBarState } from "@/sanity/lib/barState";
import { isHostAuthed } from "@/sanity/lib/hostAuth";
import { ORDER_BY_ID_QUERY } from "@/sanity/queries";

import { fail, ok, readJsonObject, trimmedString } from "../../_lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * These endpoints patch and delete by raw document id. Confirming the target is
 * actually an order first means a stale or mistyped id can only ever miss, and
 * never mutate a cocktail or a singleton.
 */
async function findOrder(orderId: string) {
  return barReadClient.fetch(ORDER_BY_ID_QUERY, { orderId });
}

/** Move an order between queued and making. */
export async function PATCH(request: Request) {
  if (!isHostAuthed()) return fail("Not signed in.", 401);

  const writeClient = getBarWriteClient();

  if (!writeClient) return fail("The bar isn't set up to take orders yet.", 500);

  const body = await readJsonObject(request);

  if (!body) return fail("Malformed request.", 400);

  const orderId = trimmedString(body.orderId);
  const status = body.status;

  if (!orderId || !isOrderStatus(status)) return fail("Malformed request.", 400);

  try {
    if (!(await findOrder(orderId))) return fail("That order is gone.", 404);

    await writeClient.patch(orderId).set({ status }).commit();

    invalidateBarState();

    return ok({ orderId, status });
  } catch (error) {
    console.error("Failed to update order status", error);

    return fail("Couldn't update that order. Try again.", 502);
  }
}

/**
 * Clear an order off the queue. Serves both "made it" and "cancel it": a
 * finished drink is deleted rather than archived, which is also what frees the
 * guest to order their next one.
 */
export async function DELETE(request: Request) {
  if (!isHostAuthed()) return fail("Not signed in.", 401);

  const writeClient = getBarWriteClient();

  if (!writeClient) return fail("The bar isn't set up to take orders yet.", 500);

  const body = await readJsonObject(request);

  if (!body) return fail("Malformed request.", 400);

  const orderId = trimmedString(body.orderId);

  if (!orderId) return fail("Malformed request.", 400);

  try {
    if (!(await findOrder(orderId))) return ok({ orderId, cleared: false });

    await writeClient.delete(orderId);

    invalidateBarState();

    return ok({ orderId, cleared: true });
  } catch (error) {
    console.error("Failed to clear order", error);

    return fail("Couldn't clear that order. Try again.", 502);
  }
}
