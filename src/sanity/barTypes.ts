import type { OrderStatus } from "./barOrderStatuses";

// Types only, no runtime exports. Client components import these with
// `import type`, so nothing here reaches the browser bundle.

export type QueueOrder = {
  _id: string;
  guestName: string;
  cocktailId: string;
  cocktailName: string;
  status: OrderStatus;
  placedAt: string;
};

export type BarState = {
  open: boolean;
  orders: QueueOrder[];
};
