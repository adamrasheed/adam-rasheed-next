import type { QueueOrder } from "@/sanity/barTypes";

type QueueProps = {
  orders: QueueOrder[];
  myOrderId: string | null;
};

export default function Queue({ orders, myOrderId }: QueueProps) {
  return (
    <div className="border border-slate-300 dark:border-slate-700 p-4">
      <h2 className="section-title small-caps text-sm mb-3">
        {orders.length === 0 ? "Nothing in the queue" : "On the rail"}
      </h2>

      {orders.length === 0 ? (
        <p className="text-sm text-gray-500">
          Nobody&apos;s waiting. Order something.
        </p>
      ) : (
        <ol className="grid gap-2">
          {orders.map((order, index) => {
            const mine = order._id === myOrderId;

            return (
              <li
                key={order._id}
                className="grid grid-cols-[1.5rem_1fr_auto] items-baseline gap-2 text-sm"
              >
                <span className="text-xs text-gray-500 tabular-nums">
                  {index + 1}
                </span>
                <span>
                  <span className="font-bold">{order.cocktailName}</span>
                  <span className="text-gray-500">
                    {" "}
                    for {mine ? "you" : order.guestName}
                  </span>
                  {order.notes && (
                    <span className="block text-xs text-gray-500">
                      {order.notes}
                    </span>
                  )}
                </span>
                <span
                  className={`text-xs small-caps ${
                    order.status === "making"
                      ? "font-bold"
                      : "text-gray-500"
                  }`}
                >
                  {order.status === "making" ? "Shaking now" : "Waiting"}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
