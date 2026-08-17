// Shared between the order schema, the API routes and the /bar UI. Lives outside
// schemaTypes/ so page code never imports the Studio `sanity` package.
//
// There is no "done" status on purpose: finishing a drink deletes the order.
// That keeps the queue and the order list the same thing, and it is what frees
// the guest to order again. See orderDocumentId below.
export const ORDER_STATUSES = [
  { title: "Queued", value: "queued" },
  { title: "Making", value: "making" },
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number]["value"];

export function isOrderStatus(value: unknown): value is OrderStatus {
  return ORDER_STATUSES.some((status) => status.value === value);
}

// A guest id is a random opaque token minted in the browser and kept in
// localStorage. Constrained so it is always a legal Sanity document id suffix.
const GUEST_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

export function isValidGuestId(value: unknown): value is string {
  return typeof value === "string" && GUEST_ID_PATTERN.test(value);
}

/**
 * Deriving the document id from the guest id is what enforces one open order
 * per guest. Sanity's `create` rejects a duplicate id, so two taps in the same
 * second cannot both land, so there is no read-then-write race to lose.
 *
 * Separator must not be a dot: Sanity reads a dotted prefix as a system
 * namespace (the same mechanism behind `drafts.`), and such documents exist but
 * are invisible to GROQ queries.
 */
export function orderDocumentId(guestId: string) {
  return `order-${guestId}`;
}
