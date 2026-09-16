"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { HostShelf, ShelfItem } from "@/sanity/lib/hostShelf";

type ShelfProps = {
  shelf: HostShelf;
  onUnauthorized: () => void;
};

/** "Daiquiri", "Daiquiri and Mojito", "Daiquiri, Mojito and Negroni". */
function list(names: string[]) {
  if (names.length <= 1) return names.join("");
  if (names.length === 2) return `${names[0]} and ${names[1]}`;

  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function impact(item: ShelfItem, shown: boolean) {
  // Nothing requires it, so flipping it never changes the menu. Still worth
  // separating the two reasons: a garnish used in seven drinks and a bottle
  // nothing touches both need restocking on very different urgency.
  if (item.requiredBy.length === 0) {
    return item.garnishFor.length === 0
      ? "Nothing uses it"
      : `Garnish only, in ${list(item.garnishFor)}`;
  }

  if (shown) {
    return item.wouldRemove.length === 0
      ? `Needed by ${list(item.requiredBy)}, already off`
      : `Turning off takes away ${list(item.wouldRemove)}`;
  }

  return item.wouldRemove.length === 0
    ? `Needed by ${list(item.requiredBy)}, still short something else`
    : `Turning on brings back ${list(item.wouldRemove)}`;
}

export default function Shelf({ shelf, onUnauthorized }: ShelfProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Shown immediately on tap so the row does not sit dead while the request and
  // the server re-render land. Cleared once the server agrees.
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});

  // Drop optimistic values the refreshed props have caught up with. Without
  // this, a bottle flipped in the Studio would stay wrong on screen forever,
  // because the local guess would keep winning over the truth.
  useEffect(() => {
    setOptimistic((current) => {
      const next: Record<string, boolean> = {};

      for (const section of shelf.sections) {
        for (const item of section.items) {
          const guess = current[item._id];

          if (guess !== undefined && guess !== item.inStock) next[item._id] = guess;
        }
      }

      return Object.keys(next).length === Object.keys(current).length
        ? current
        : next;
    });
  }, [shelf]);

  const outOfStock = shelf.sections
    .flatMap((section) => section.items)
    .filter((item) => !(optimistic[item._id] ?? item.inStock));

  /** Put a row back where it was: the shelf never took the change. */
  function revert(id: string) {
    setOptimistic((current) => {
      if (!(id in current)) return current;

      const next = { ...current };

      delete next[id];

      return next;
    });
  }

  async function toggle(item: ShelfItem, next: boolean) {
    setBusyId(item._id);
    setError(null);
    setOptimistic((current) => ({ ...current, [item._id]: next }));

    try {
      const response = await fetch("/api/bar/host/ingredients", {
        method: "PATCH",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredientId: item._id, inStock: next }),
      });

      if (response.status === 401) {
        // The write never happened, so the row has to go back before the
        // re-render: until that lands the console would otherwise show a
        // change the shelf never took.
        revert(item._id);
        onUnauthorized();
        return;
      }

      if (!response.ok) {
        let message = "Couldn't update that bottle.";

        try {
          const data: unknown = await response.json();

          if (typeof data === "object" && data !== null && "error" in data) {
            const value = (data as { error: unknown }).error;

            if (typeof value === "string") message = value;
          }
        } catch {
          // Non-JSON body. Keep the default message.
        }

        revert(item._id);
        setError(message);
        return;
      }

      router.refresh();
    } catch {
      revert(item._id);
      setError("Lost the connection. Try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="!py-0 grid gap-4 border-t border-slate-300 dark:border-slate-700 pt-6">
      <button
        type="button"
        className="grid gap-1 text-left"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="shelf-list"
      >
        <span className="section-title small-caps text-lg">
          Shelf {open ? "−" : "+"}
        </span>
        <span className="text-sm text-gray-500">
          {shelf.onMenu} of {shelf.totalCocktails} drinks on the menu
          {outOfStock.length > 0 &&
            ` · out: ${list(outOfStock.map((item) => item.name))}`}
        </span>
      </button>

      {error && (
        <p role="alert" className="text-sm font-bold">
          {error}
        </p>
      )}

      {open && (
        <div id="shelf-list" className="grid gap-6">
          {shelf.sections.map((section) => (
            <div key={section.value} className="grid gap-2">
              <h3 className="text-xs small-caps text-gray-500">
                {section.title}
              </h3>

              <ul className="grid gap-2">
                {section.items.map((item) => {
                  const shown = optimistic[item._id] ?? item.inStock;

                  return (
                    <li key={item._id}>
                      <button
                        type="button"
                        className="w-full border border-slate-300 dark:border-slate-700 p-3 grid grid-cols-[1fr_auto] gap-3 items-center text-left disabled:opacity-50"
                        disabled={busyId === item._id}
                        aria-pressed={shown}
                        onClick={() => toggle(item, !shown)}
                      >
                        <span className="grid gap-0.5">
                          <span
                            className={`text-base font-bold ${
                              shown ? "" : "line-through text-gray-500"
                            }`}
                          >
                            {item.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {impact(item, shown)}
                          </span>
                        </span>

                        <span className="text-xs small-caps font-bold whitespace-nowrap">
                          {shown ? "In stock" : "Out"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
