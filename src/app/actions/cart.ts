"use server";

import { cookies } from "next/headers";
import {
  getCart,
  createCart,
  addCartLines,
  updateCartLine,
  removeCartLine,
  ShopifyCart,
} from "@/lib/shopify";

const CART_COOKIE = "shopify_cart_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getCartId(): string | undefined {
  return cookies().get(CART_COOKIE)?.value;
}

function setCartId(cartId: string) {
  cookies().set(CART_COOKIE, cartId, {
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function addToCart(variantId: string, quantity = 1): Promise<ShopifyCart> {
  const cartId = getCartId();
  let cart: ShopifyCart;

  if (cartId) {
    try {
      cart = await addCartLines(cartId, variantId, quantity);
    } catch {
      // Cart expired — create a fresh one
      cart = await createCart(variantId, quantity);
      setCartId(cart.id);
    }
  } else {
    cart = await createCart(variantId, quantity);
    setCartId(cart.id);
  }

  return cart;
}

export async function updateLine(lineId: string, quantity: number): Promise<ShopifyCart | null> {
  const cartId = getCartId();
  if (!cartId) return null;
  return updateCartLine(cartId, lineId, quantity);
}

export async function removeLine(lineId: string): Promise<ShopifyCart | null> {
  const cartId = getCartId();
  if (!cartId) return null;
  return removeCartLine(cartId, lineId);
}

export async function fetchCart(): Promise<ShopifyCart | null> {
  const cartId = getCartId();
  if (!cartId) return null;
  try {
    return await getCart(cartId);
  } catch {
    return null;
  }
}
