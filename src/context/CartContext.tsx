"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { ShopifyCart } from "@/lib/shopify";
import { addToCart, updateLine, removeLine } from "@/app/actions/cart";

type CartContextValue = {
  cart: ShopifyCart | null;
  isOpen: boolean;
  isPending: boolean;
  openCart: () => void;
  closeCart: () => void;
  handleAddToCart: (variantId: string, quantity?: number) => Promise<void>;
  handleUpdateLine: (lineId: string, quantity: number) => Promise<void>;
  handleRemoveLine: (lineId: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
  initialCart,
}: {
  children: ReactNode;
  initialCart: ShopifyCart | null;
}) {
  const [cart, setCart] = useState<ShopifyCart | null>(initialCart);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const handleAddToCart = async (variantId: string, quantity = 1) => {
    setIsPending(true);
    try {
      const updated = await addToCart(variantId, quantity);
      setCart(updated);
      setIsOpen(true);
    } finally {
      setIsPending(false);
    }
  };

  const handleUpdateLine = async (lineId: string, quantity: number) => {
    setIsPending(true);
    try {
      const updated = await updateLine(lineId, quantity);
      if (updated) setCart(updated);
    } finally {
      setIsPending(false);
    }
  };

  const handleRemoveLine = async (lineId: string) => {
    setIsPending(true);
    try {
      const updated = await removeLine(lineId);
      if (updated) setCart(updated);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        isPending,
        openCart,
        closeCart,
        handleAddToCart,
        handleUpdateLine,
        handleRemoveLine,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
