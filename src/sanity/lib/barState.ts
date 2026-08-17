import "server-only";

import { revalidateTag, unstable_cache } from "next/cache";

import { barReadClient } from "./barClient";
import { BAR_STATE_QUERY } from "../queries";
import { isOrderStatus } from "../barOrderStatuses";
import type { BarState } from "../barTypes";
import type { BAR_STATE_QUERYResult } from "../../../sanity.types";

const BAR_STATE_TAG = "bar-state";

/**
 * GROQ types every projected field as nullable. Drop half-written orders
 * instead of rendering "undefined for undefined" on the menu.
 */
function toBarState(result: BAR_STATE_QUERYResult): BarState {
  return {
    open: result.open === true,
    orders: result.orders.flatMap((order) => {
      const { guestName, cocktailId, cocktailName, status, placedAt } = order;

      if (!guestName || !cocktailId || !cocktailName || !placedAt) return [];
      if (!isOrderStatus(status)) return [];

      return [
        {
          _id: order._id,
          guestName,
          cocktailId,
          cocktailName,
          status,
          placedAt,
        },
      ];
    }),
  };
}

// One shared cache entry with a two-second life. Fifteen guests polling every
// five seconds still costs Sanity well under a request per second, and every
// mutation busts the tag, so nobody waits on the timer to see the queue move.
const readBarState = unstable_cache(
  async () => toBarState(await barReadClient.fetch(BAR_STATE_QUERY)),
  ["bar-state"],
  { revalidate: 2, tags: [BAR_STATE_TAG] }
);

export function getBarState(): Promise<BarState> {
  return readBarState();
}

export function invalidateBarState() {
  revalidateTag(BAR_STATE_TAG);
}
