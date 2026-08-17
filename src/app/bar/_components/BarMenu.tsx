"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { orderDocumentId } from "@/sanity/barOrderStatuses";
import { COCKTAIL_CATEGORIES } from "@/sanity/cocktailCategories";
import type { BarState } from "@/sanity/barTypes";

import type { COCKTAILS_QUERYResult } from "../../../../sanity.types";
import { loadGuest, saveGuestName, type Guest } from "../_lib/guest";
import { useBarState } from "../_lib/useBarState";
import Queue from "./Queue";

type BarMenuProps = {
  cocktails: COCKTAILS_QUERYResult;
  initialState: BarState;
};

async function readError(response: Response) {
  try {
    const data: unknown = await response.json();

    if (typeof data === "object" && data !== null && "error" in data) {
      const message = (data as { error: unknown }).error;

      if (typeof message === "string") return message;
    }
  } catch {
    // Non-JSON body. Fall through to the generic message.
  }

  return "Something went wrong. Try again.";
}

export default function BarMenu({ cocktails, initialState }: BarMenuProps) {
  const { state, reachable, refresh } = useBarState(initialState);

  const [guest, setGuest] = useState<Guest | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [askingName, setAskingName] = useState(false);
  const [pendingCocktailId, setPendingCocktailId] = useState<string | null>(
    null
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameInput = useRef<HTMLInputElement>(null);

  // localStorage is not available during render on the server, so identity
  // arrives on the first client pass. Until then the page is a plain menu.
  useEffect(() => {
    setGuest(loadGuest());
  }, []);

  useEffect(() => {
    if (askingName) nameInput.current?.focus();
  }, [askingName]);

  const myOrderId = guest ? orderDocumentId(guest.id) : null;
  const myOrder = myOrderId
    ? state.orders.find((order) => order._id === myOrderId) ?? null
    : null;

  const sections = useMemo(
    () =>
      COCKTAIL_CATEGORIES.map((category) => ({
        ...category,
        cocktails: cocktails.filter((c) => c.category === category.value),
      })).filter((section) => section.cocktails.length > 0),
    [cocktails]
  );

  async function placeOrder(cocktailId: string, who: Guest) {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/bar/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          cocktailId,
          guestId: who.id,
          guestName: who.name,
        }),
      });

      if (!response.ok) {
        setError(await readError(response));
        return;
      }
    } catch {
      setError("Lost the connection. Try that again.");
      return;
    } finally {
      setBusy(false);
    }

    await refresh();
  }

  async function cancelOrder() {
    if (!guest) return;

    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/bar/order", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ guestId: guest.id }),
      });

      if (!response.ok) {
        setError(await readError(response));
        return;
      }
    } catch {
      setError("Lost the connection. Try that again.");
      return;
    } finally {
      setBusy(false);
    }

    await refresh();
  }

  function handleOrderClick(cocktailId: string) {
    if (!guest) {
      // Remember what they wanted so the name prompt isn't a dead end.
      setPendingCocktailId(cocktailId);
      setAskingName(true);
      return;
    }

    placeOrder(cocktailId, guest);
  }

  function handleNameSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmed = nameDraft.trim();

    if (!trimmed) {
      setError("I need a name to put on the drink.");
      return;
    }

    const saved = saveGuestName(trimmed);
    const wanted = pendingCocktailId;

    setGuest(saved);
    setNameDraft("");
    setAskingName(false);
    setPendingCocktailId(null);
    setError(null);

    if (wanted) placeOrder(wanted, saved);
  }

  const errorId = error ? "bar-error" : undefined;

  return (
    <div className="grid gap-8">
      <div className="grid gap-4">
        <p className="text-sm small-caps text-gray-500">
          {state.open ? "The bar is open" : "The bar is closed"}
        </p>

        {!reachable && (
          <p className="text-sm text-gray-500">
            Can&apos;t reach the bar right now, so this queue may be out of date.
          </p>
        )}

        {state.open && <Queue orders={state.orders} myOrderId={myOrderId} />}

        {state.open && askingName && (
          <form onSubmit={handleNameSubmit} className="grid gap-2">
            <label htmlFor="guest-name">Your name</label>
            <input
              id="guest-name"
              ref={nameInput}
              type="text"
              maxLength={40}
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              aria-describedby={errorId}
              autoComplete="given-name"
            />
            <button type="submit" className="btn primary">
              Save and order
            </button>
          </form>
        )}

        {state.open && guest && !askingName && (
          <p className="text-sm text-gray-500">
            Ordering as {guest.name}.{" "}
            <button
              type="button"
              className="underline font-bold"
              onClick={() => {
                setNameDraft(guest.name);
                setAskingName(true);
              }}
            >
              Change
            </button>
          </p>
        )}

        {state.open && myOrder && (
          <p className="text-sm">
            {myOrder.status === "making"
              ? `Your ${myOrder.cocktailName} is being made.`
              : `Your ${myOrder.cocktailName} is in the queue. One drink at a time, so cancel it to switch.`}
          </p>
        )}

        {error && (
          <p id="bar-error" role="alert" className="text-sm font-bold">
            {error}
          </p>
        )}
      </div>

      {/* Section spacing and the trailing dash come from df26904 on main. Kept
          verbatim so moving the menu into this component does not quietly undo
          that styling pass. */}
      <div className="grid gap-y-0 [&>section]:p-y-2">
        {sections.map((section) => (
          <section key={section.value}>
            <h2 className="section-title small-caps text-lg">
              {section.title} &mdash;
            </h2>
            <ul className="grid gap-6">
              {section.cocktails.map((cocktail) => {
                const isMine = myOrder?.cocktailId === cocktail._id;
                const blocked = Boolean(myOrder) && !isMine;

                return (
                  <li
                    key={cocktail._id}
                    className="grid grid-cols-[1fr_auto] gap-4 items-start"
                  >
                    <div>
                      <h3 className="text-lg font-bold mb-1">
                        {cocktail.name}
                      </h3>
                      <p className="text-sm mb-1">{cocktail.description}</p>
                      <p className="text-xs text-gray-500 small-caps">
                        {cocktail.ingredients?.join(" · ")}
                      </p>
                    </div>

                    {state.open && (
                      <div className="justify-self-end">
                        {isMine ? (
                          myOrder?.status === "making" ? (
                            <span className="text-xs small-caps font-bold">
                              Being made
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn"
                              disabled={busy}
                              onClick={cancelOrder}
                            >
                              Cancel
                            </button>
                          )
                        ) : (
                          <button
                            type="button"
                            className="btn primary disabled:opacity-40"
                            disabled={busy || blocked}
                            onClick={() => handleOrderClick(cocktail._id)}
                          >
                            Order
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
