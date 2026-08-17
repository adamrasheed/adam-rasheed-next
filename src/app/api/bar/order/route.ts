import {
  isValidGuestId,
  orderDocumentId,
} from "@/sanity/barOrderStatuses";
import { getBarWriteClient, barReadClient } from "@/sanity/lib/barClient";
import { invalidateBarState } from "@/sanity/lib/barState";
import {
  BAR_OPEN_QUERY,
  ORDERABLE_COCKTAIL_QUERY,
  ORDER_BY_ID_QUERY,
  ORDER_COUNT_QUERY,
} from "@/sanity/queries";

import { fail, ok, readJsonObject, trimmedString } from "../_lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_NAME_LENGTH = 40;

// Guest ids are minted in the browser, so nothing stops a script from claiming
// a new identity per request while the bar is open. This caps the blast radius
// at a queue the host can still read, rather than an unbounded list.
const MAX_ACTIVE_ORDERS = 40;

/** Place an order. */
export async function POST(request: Request) {
  const writeClient = getBarWriteClient();

  if (!writeClient) {
    console.error("SANITY_API_WRITE_TOKEN is not set, so orders cannot be saved");

    return fail("The bar isn't set up to take orders yet.", 500);
  }

  const body = await readJsonObject(request);

  if (!body) return fail("Malformed request.", 400);

  const cocktailId = trimmedString(body.cocktailId);
  const guestName = trimmedString(body.guestName);
  const guestId = body.guestId;

  if (!isValidGuestId(guestId)) return fail("Malformed request.", 400);
  if (!cocktailId) return fail("Pick a drink first.", 400);
  if (!guestName) return fail("Add your name so I know whose drink it is.", 400);
  if (guestName.length > MAX_NAME_LENGTH) {
    return fail(`Keep the name under ${MAX_NAME_LENGTH} characters.`, 400);
  }

  const orderId = orderDocumentId(guestId);

  try {
    // The open check is read fresh rather than through the cached bar state:
    // closing the bar has to take effect immediately, not two seconds later.
    const [open, cocktail, existing, activeOrders] = await Promise.all([
      barReadClient.fetch(BAR_OPEN_QUERY),
      barReadClient.fetch(ORDERABLE_COCKTAIL_QUERY, { cocktailId }),
      barReadClient.fetch(ORDER_BY_ID_QUERY, { orderId }),
      barReadClient.fetch(ORDER_COUNT_QUERY),
    ]);

    if (open !== true) return fail("The bar is closed right now.", 409);
    if (!cocktail) return fail("That one's off the menu right now.", 404);

    if (!existing && activeOrders >= MAX_ACTIVE_ORDERS) {
      return fail("The queue is full. Give it a minute.", 429);
    }

    if (existing) {
      // Phrased to avoid an a/an agreement bug on drink names.
      const drink = existing.cocktailName ?? "Your drink";

      return fail(`${drink} is already on the way. One at a time.`, 409);
    }

    await writeClient.create({
      _id: orderId,
      _type: "order",
      cocktail: { _type: "reference", _ref: cocktailId },
      guestId,
      guestName,
      status: "queued",
      placedAt: new Date().toISOString(),
    });

    invalidateBarState();

    return ok({ orderId, cocktailName: cocktail.name }, 201);
  } catch (error) {
    // Sanity rejects a duplicate document id, which is the backstop for two
    // taps landing in the same instant. Treat it as the same "one at a time"
    // rule rather than a server error.
    if (isDocumentExistsError(error)) {
      return fail("Your drink is already on the way. One at a time.", 409);
    }

    console.error("Failed to place order", error);

    return fail("Couldn't get that order in. Try again.", 502);
  }
}

/** Cancel your own order, but only while it's still waiting. */
export async function DELETE(request: Request) {
  const writeClient = getBarWriteClient();

  if (!writeClient) return fail("The bar isn't set up to take orders yet.", 500);

  const body = await readJsonObject(request);

  if (!body) return fail("Malformed request.", 400);

  const guestId = body.guestId;

  if (!isValidGuestId(guestId)) return fail("Malformed request.", 400);

  const orderId = orderDocumentId(guestId);

  try {
    const existing = await barReadClient.fetch(ORDER_BY_ID_QUERY, { orderId });

    if (!existing) return ok({ cancelled: false });

    if (existing.status === "making") {
      return fail("Too late, that one's already being made.", 409);
    }

    await writeClient.delete(orderId);

    invalidateBarState();

    return ok({ cancelled: true });
  } catch (error) {
    console.error("Failed to cancel order", error);

    return fail("Couldn't cancel that. Try again.", 502);
  }
}

function isDocumentExistsError(error: unknown) {
  if (typeof error !== "object" || error === null) return false;

  const statusCode = (error as { statusCode?: unknown }).statusCode;
  const message = (error as { message?: unknown }).message;

  return (
    statusCode === 409 ||
    (typeof message === "string" && message.includes("already exists"))
  );
}
