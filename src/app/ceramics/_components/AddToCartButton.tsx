"use client";

import clsx from "clsx";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ variantId }: { variantId: string }) {
  const { handleAddToCart, isPending } = useCart();

  return (
    <button
      onClick={() => handleAddToCart(variantId)}
      disabled={isPending}
      className={clsx("btn", "w-full", "mt-2", isPending && "opacity-60")}
    >
      {isPending ? "Adding…" : "Add to Cart"}
    </button>
  );
}
