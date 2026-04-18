"use client";

import clsx from "clsx";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function CartDropdown() {
  const { cart, isOpen, isPending, closeCart, handleUpdateLine, handleRemoveLine } = useCart();

  if (!isOpen) return null;

  const lines = cart?.lines.edges.map((e) => e.node) ?? [];
  const subtotal = cart?.cost.subtotalAmount;
  const isEmpty = lines.length === 0;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={closeCart} />

      <div
        className={clsx(
          "absolute right-0 top-full mt-2 z-50",
          "w-80 shadow-lg",
          "bg-[var(--background)] border border-current/10",
          isPending && "opacity-60 pointer-events-none"
        )}
      >
        <div className="p-4 border-b border-current/10 flex justify-between items-center">
          <span className="small-caps tracking-wider font-semibold text-sm">Cart</span>
          <button
            onClick={closeCart}
            className="text-sm opacity-50 hover:opacity-100 hover:no-underline font-normal"
          >
            ✕
          </button>
        </div>

        {isEmpty ? (
          <p className="p-8 text-sm text-center opacity-50">Your cart is empty.</p>
        ) : (
          <>
            <ul className="divide-y divide-current/10 max-h-80 overflow-y-auto">
              {lines.map((line) => {
                const lineTotal = (
                  parseFloat(line.merchandise.price.amount) * line.quantity
                ).toLocaleString("en-US", {
                  style: "currency",
                  currency: line.merchandise.price.currencyCode,
                });

                return (
                  <li key={line.id} className="flex gap-3 p-3">
                    {line.merchandise.image && (
                      <div className="relative w-14 h-14 flex-shrink-0 bg-[var(--bgSecondary)]">
                        <Image
                          src={line.merchandise.image.url}
                          alt={line.merchandise.image.altText ?? line.merchandise.product.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {line.merchandise.product.title}
                      </p>
                      {line.merchandise.title !== "Default Title" && (
                        <p className="text-xs opacity-50">{line.merchandise.title}</p>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleUpdateLine(line.id, line.quantity - 1)}
                          disabled={line.quantity <= 1}
                          className={clsx(
                            "w-5 h-5 text-xs border border-current/20 flex items-center justify-center",
                            "hover:bg-[var(--bgSecondary)] hover:no-underline font-normal",
                            "disabled:opacity-30 disabled:cursor-not-allowed"
                          )}
                        >
                          −
                        </button>
                        <span className="text-xs w-4 text-center tabular-nums">
                          {line.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateLine(line.id, line.quantity + 1)}
                          className="w-5 h-5 text-xs border border-current/20 flex items-center justify-center hover:bg-[var(--bgSecondary)] hover:no-underline font-normal"
                        >
                          +
                        </button>

                        <button
                          onClick={() => handleRemoveLine(line.id)}
                          className="ml-auto text-xs opacity-40 hover:opacity-100 font-normal hover:no-underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <p className="text-xs font-medium self-start tabular-nums">{lineTotal}</p>
                  </li>
                );
              })}
            </ul>

            <div className="p-4 border-t border-current/10">
              <div className="flex justify-between items-center text-sm mb-3">
                <span className="small-caps tracking-wider opacity-60">Subtotal</span>
                <span className="font-semibold tabular-nums">
                  {subtotal &&
                    parseFloat(subtotal.amount).toLocaleString("en-US", {
                      style: "currency",
                      currency: subtotal.currencyCode,
                    })}
                </span>
              </div>
              <a
                href={cart?.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn primary w-full text-center"
              >
                Checkout
              </a>
            </div>
          </>
        )}
      </div>
    </>
  );
}
