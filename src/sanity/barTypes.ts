import type { OrderStatus } from "./barOrderStatuses";

// Types only, no runtime exports. Client components import these with
// `import type`, so nothing here reaches the browser bundle.

export type QueueOrder = {
  _id: string;
  guestName: string;
  cocktailId: string;
  cocktailName: string;
  /** Free-text customization from the guest, or null when they asked for it as written. */
  notes: string | null;
  status: OrderStatus;
  placedAt: string;
};

export type BarState = {
  open: boolean;
  orders: QueueOrder[];
};
