"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { BarState } from "@/sanity/barTypes";

import { useBarState } from "../../_lib/useBarState";

type HostConsoleProps = {
  initialState: BarState;
};

async function readError(response: Response, fallback: string) {
  try {
    const data: unknown = await response.json();

    if (typeof data === "object" && data !== null && "error" in data) {
      const value = (data as { error: unknown }).error;

      if (typeof value === "string") return value;
    }
  } catch {
    // Non-JSON body. Fall through.
  }

  return fallback;
}

export default function HostConsole({ initialState }: HostConsoleProps) {
  const router = useRouter();
  const { state, reachable, refresh } = useBarState(initialState);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingClear, setConfirmingClear] = useState(false);

  async function send(
    url: string,
    init: RequestInit,
    fallbackError: string
  ): Promise<boolean> {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(url, {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        ...init,
      });

      if (response.status === 401) {
        // The passcode cookie expired mid-party. Re-render into the login form.
        router.refresh();
        return false;
      }

      if (!response.ok) {
        setError(await readError(response, fallbackError));
        return false;
      }

      return true;
    } catch {
      setError("Lost the connection. Try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function toggleBar() {
    const done = await send(
      "/api/bar/host/session",
      { method: "POST", body: JSON.stringify({ open: !state.open }) },
      "Couldn't flip that switch."
    );

    if (done) await refresh();
  }

  async function setStatus(orderId: string, status: "queued" | "making") {
    const done = await send(
      "/api/bar/host/orders",
      { method: "PATCH", body: JSON.stringify({ orderId, status }) },
      "Couldn't update that order."
    );

    if (done) await refresh();
  }

  async function clearOrder(orderId: string) {
    const done = await send(
      "/api/bar/host/orders",
      { method: "DELETE", body: JSON.stringify({ orderId }) },
      "Couldn't clear that order."
    );

    if (done) await refresh();
  }

  async function clearAll() {
    const done = await send(
      "/api/bar/host/orders/clear",
      { method: "POST" },
      "Couldn't clear the queue."
    );

    setConfirmingClear(false);

    if (done) await refresh();
  }

  async function signOut() {
    await send("/api/bar/host/auth", { method: "DELETE" }, "Couldn't sign out.");
    router.refresh();
  }

  return (
    <div className="grid gap-8">
      <div className="grid gap-3">
        <p className="text-sm small-caps text-gray-500">
          {state.open ? "The bar is open" : "The bar is closed"}
        </p>

        <button
          type="button"
          className="btn primary w-full py-4 text-base"
          disabled={busy}
          onClick={toggleBar}
        >
          {state.open ? "Close the bar" : "Open the bar"}
        </button>

        {!reachable && (
          <p className="text-sm text-gray-500">
            Can&apos;t reach the bar right now, so this queue may be out of date.
          </p>
        )}

        {error && (
          <p role="alert" className="text-sm font-bold">
            {error}
          </p>
        )}
      </div>

      <section className="!py-0 grid gap-4">
        <h2 className="section-title small-caps text-lg">
          Queue ({state.orders.length})
        </h2>

        {state.orders.length === 0 ? (
          <p className="text-sm text-gray-500">Nothing waiting.</p>
        ) : (
          <ol className="grid gap-4">
            {state.orders.map((order, index) => (
              <li
                key={order._id}
                className="border border-slate-300 dark:border-slate-700 p-4 grid gap-3"
              >
                <div>
                  <p className="text-xs text-gray-500 small-caps">
                    #{index + 1} · {order.status === "making" ? "Making" : "Waiting"}
                  </p>
                  <p className="text-lg font-bold">{order.cocktailName}</p>
                  <p className="text-sm text-gray-500">for {order.guestName}</p>
                  {order.notes && (
                    <p className="text-sm font-bold mt-2">{order.notes}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="btn w-full py-3 text-center"
                    disabled={busy}
                    onClick={() =>
                      setStatus(
                        order._id,
                        order.status === "making" ? "queued" : "making"
                      )
                    }
                  >
                    {order.status === "making" ? "Back to queue" : "Start"}
                  </button>
                  <button
                    type="button"
                    className="btn primary w-full py-3 text-center"
                    disabled={busy}
                    onClick={() => clearOrder(order._id)}
                  >
                    Done
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="grid gap-3 border-t border-slate-300 dark:border-slate-700 pt-6">
        {confirmingClear ? (
          <div className="grid gap-2">
            <p className="text-sm">
              Clear all {state.orders.length} orders? Everyone loses their spot.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="btn w-full py-3 text-center"
                onClick={() => setConfirmingClear(false)}
              >
                Never mind
              </button>
              <button
                type="button"
                className="btn primary w-full py-3 text-center"
                disabled={busy}
                onClick={clearAll}
              >
                Clear it
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="btn w-full py-3 text-center"
            disabled={busy || state.orders.length === 0}
            onClick={() => setConfirmingClear(true)}
          >
            Clear the queue
          </button>
        )}

        <button
          type="button"
          className="text-sm underline font-bold justify-self-start"
          onClick={signOut}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
