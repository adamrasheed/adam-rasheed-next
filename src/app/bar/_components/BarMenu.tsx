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

const MAX_NAME_LENGTH = 40;
const MAX_NOTES_LENGTH = 140;

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
  const [notesDraft, setNotesDraft] = useState("");
  // The cocktail whose order form is open. Null means nothing is being composed.
  const [composingId, setComposingId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const renameInput = useRef<HTMLInputElement>(null);
  const composeInput = useRef<HTMLInputElement>(null);

  // localStorage is not available during render on the server, so identity
  // arrives on the first client pass. Until then the page is a plain menu.
  useEffect(() => {
    setGuest(loadGuest());
  }, []);

  useEffect(() => {
    if (renaming) renameInput.current?.focus();
  }, [renaming]);

  // Whichever field leads the order form, the keyboard should land on it.
  useEffect(() => {
    if (composingId) composeInput.current?.focus();
  }, [composingId]);

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

  function closeCompose() {
    setComposingId(null);
    setNotesDraft("");
    setNameDraft("");
    setError(null);
  }

  async function placeOrder(cocktailId: string, who: Guest, notes: string) {
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
          notes,
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

    // Only tear the form down once the order actually landed, so a rejected
    // order keeps the note the guest typed.
    closeCompose();

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
    setComposingId(cocktailId);
    setNameDraft(guest?.name ?? "");
    setNotesDraft("");
    setRenaming(false);
    setError(null);
  }

  function handleComposeSubmit(event: React.FormEvent, cocktailId: string) {
    event.preventDefault();

    const trimmedName = nameDraft.trim();

    if (!trimmedName) {
      setError("I need a name to put on the drink.");
      return;
    }

    // Saved on every order so a name edited in the form sticks for the next one.
    const who = saveGuestName(trimmedName);

    setGuest(who);

    placeOrder(cocktailId, who, notesDraft.trim());
  }

  function handleRenameSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmed = nameDraft.trim();

    if (!trimmed) {
      setError("I need a name to put on the drink.");
      return;
    }

    setGuest(saveGuestName(trimmed));
    setNameDraft("");
    setRenaming(false);
    setError(null);
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

        {state.open && renaming && (
          <form onSubmit={handleRenameSubmit} className="grid gap-2">
            <label htmlFor="guest-name">Your name</label>
            <input
              id="guest-name"
              ref={renameInput}
              type="text"
              maxLength={MAX_NAME_LENGTH}
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              aria-describedby={errorId}
              autoComplete="given-name"
            />
            <div className="flex gap-2">
              <button type="submit" className="btn primary">
                Save
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setRenaming(false);
                  setNameDraft("");
                  setError(null);
                }}
              >
                Never mind
              </button>
            </div>
          </form>
        )}

        {state.open && guest && !renaming && (
          <p className="text-sm text-gray-500">
            Ordering as {guest.name}.{" "}
            <button
              type="button"
              className="underline font-bold"
              onClick={() => {
                setNameDraft(guest.name);
                setComposingId(null);
                setRenaming(true);
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
            {myOrder.notes && (
              <span className="text-gray-500"> Asked for: {myOrder.notes}</span>
            )}
          </p>
        )}

        {error && !composingId && (
          <p id="bar-error" role="alert" className="text-sm font-bold">
            {error}
          </p>
        )}
      </div>

      {/* Section spacing and the trailing dash come from df26904 on main. That
          commit wrote `p-y-2`, which Tailwind does not generate, so the padding
          silently fell back to the `section` base rule in globals.css. */}
      <div className="grid gap-y-0 [&>section]:py-2">
        {sections.map((section) => (
          <section key={section.value}>
            <h2 className="section-title small-caps text-lg">
              {section.title} &mdash;
            </h2>
            <ul className="grid gap-6">
              {section.cocktails.map((cocktail) => {
                const isMine = myOrder?.cocktailId === cocktail._id;
                const blocked = Boolean(myOrder) && !isMine;
                const composing = composingId === cocktail._id;
                const composeErrorId = composing && error
                  ? `compose-error-${cocktail._id}`
                  : undefined;

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
                          !composing && (
                            <button
                              type="button"
                              className="btn primary disabled:opacity-40"
                              disabled={busy || blocked}
                              onClick={() => handleOrderClick(cocktail._id)}
                            >
                              Order
                            </button>
                          )
                        )}
                      </div>
                    )}

                    {state.open && composing && (
                      <form
                        onSubmit={(event) =>
                          handleComposeSubmit(event, cocktail._id)
                        }
                        className="col-span-2 grid gap-2 border border-slate-300 dark:border-slate-700 p-4"
                      >
                        {!guest && (
                          <>
                            <label htmlFor={`order-name-${cocktail._id}`}>
                              Your name
                            </label>
                            <input
                              id={`order-name-${cocktail._id}`}
                              ref={composeInput}
                              type="text"
                              maxLength={MAX_NAME_LENGTH}
                              value={nameDraft}
                              onChange={(event) =>
                                setNameDraft(event.target.value)
                              }
                              aria-describedby={composeErrorId}
                              autoComplete="given-name"
                            />
                          </>
                        )}

                        <label htmlFor={`order-notes-${cocktail._id}`}>
                          Any changes?
                        </label>
                        <input
                          id={`order-notes-${cocktail._id}`}
                          ref={guest ? composeInput : undefined}
                          type="text"
                          maxLength={MAX_NOTES_LENGTH}
                          value={notesDraft}
                          onChange={(event) => setNotesDraft(event.target.value)}
                          placeholder="Vodka instead of gin, no simple syrup"
                          aria-describedby={composeErrorId}
                        />

                        {composeErrorId && (
                          <p
                            id={composeErrorId}
                            role="alert"
                            className="text-sm font-bold"
                          >
                            {error}
                          </p>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="btn primary"
                            disabled={busy}
                          >
                            Order
                          </button>
                          <button
                            type="button"
                            className="btn"
                            onClick={closeCompose}
                          >
                            Never mind
                          </button>
                        </div>
                      </form>
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
