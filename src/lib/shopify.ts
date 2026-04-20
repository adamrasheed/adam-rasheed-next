import "server-only";
import { headers } from "next/headers";

function assertEnvValue(value: string | undefined, name: string): string {
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const domain = assertEnvValue(
  process.env.SHOPIFY_STORE_DOMAIN,
  "SHOPIFY_STORE_DOMAIN",
);
const token = assertEnvValue(
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  "SHOPIFY_STOREFRONT_ACCESS_TOKEN",
);
const endpoint = `https://${domain}/api/2024-01/graphql.json`;

function storefrontRequestHeaders(): HeadersInit {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    "Shopify-Storefront-Private-Token": token,
  };
  const forwarded = headers().get("x-forwarded-for");
  const buyerIp = forwarded?.split(",")[0]?.trim();
  if (buyerIp) h["Shopify-Storefront-Buyer-IP"] = buyerIp;
  return h;
}

// ── Products ──────────────────────────────────────────────────────────────────

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  onlineStoreUrl: string | null;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  images: {
    edges: { node: { url: string; altText: string | null } }[];
  };
  variants: {
    edges: { node: { id: string } }[];
  };
}

const CERAMICS_COLLECTION_HANDLE = "ceramics";

const PRODUCTS_QUERY = `
  query getCollectionProducts($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            onlineStoreUrl
            priceRange {
              minVariantPrice { amount currencyCode }
            }
            images(first: 1) {
              edges { node { url altText } }
            }
            variants(first: 1) {
              edges { node { id } }
            }
          }
        }
      }
    }
  }
`;

export async function getProducts(first = 24): Promise<ShopifyProduct[]> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: storefrontRequestHeaders(),
    body: JSON.stringify({
      query: PRODUCTS_QUERY,
      variables: { handle: CERAMICS_COLLECTION_HANDLE, first },
    }),
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`Shopify fetch failed: ${res.status}`);
  const json = await res.json();
  if (json.errors?.length)
    throw new Error(`Shopify GraphQL error: ${json.errors[0].message}`);
  const edges = json.data?.collection?.products?.edges ?? [];
  return edges.map((e: { node: ShopifyProduct }) => e.node);
}

const PRODUCT_BY_HANDLE_QUERY = `
  query getProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      onlineStoreUrl
      priceRange {
        minVariantPrice { amount currencyCode }
      }
      images(first: 10) {
        edges { node { url altText } }
      }
      variants(first: 10) {
        edges { node { id } }
      }
    }
  }
`;

export async function getProductByHandle(
  handle: string,
): Promise<ShopifyProduct | null> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: storefrontRequestHeaders(),
    body: JSON.stringify({
      query: PRODUCT_BY_HANDLE_QUERY,
      variables: { handle },
    }),
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`Shopify fetch failed: ${res.status}`);
  const json = await res.json();
  if (json.errors?.length)
    throw new Error(`Shopify GraphQL error: ${json.errors[0].message}`);
  return json.data?.product ?? null;
}

// ── Cart ──────────────────────────────────────────────────────────────────────

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: { title: string };
    image: { url: string; altText: string | null } | null;
    price: { amount: string; currencyCode: string };
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  lines: { edges: { node: ShopifyCartLine }[] };
  cost: {
    subtotalAmount: { amount: string; currencyCode: string };
  };
}

const CART_FIELDS = `
  id
  checkoutUrl
  lines(first: 100) {
    edges {
      node {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            product { title }
            image { url altText }
            price { amount currencyCode }
          }
        }
      }
    }
  }
  cost {
    subtotalAmount { amount currencyCode }
  }
`;

async function cartFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: storefrontRequestHeaders(),
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Shopify cart fetch failed: ${res.status}`);
  const json = await res.json();
  if (json.errors?.length)
    throw new Error(`Shopify GraphQL error: ${json.errors[0].message}`);
  return json as T;
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const json = await cartFetch<{ data: { cart: ShopifyCart | null } }>(
    `query getCart($cartId: ID!) { cart(id: $cartId) { ${CART_FIELDS} } }`,
    { cartId },
  );
  return json.data.cart;
}

export async function createCart(
  variantId: string,
  quantity = 1,
): Promise<ShopifyCart> {
  const json = await cartFetch<{ data: { cartCreate: { cart: ShopifyCart } } }>(
    `mutation cartCreate($lines: [CartLineInput!]) {
      cartCreate(input: { lines: $lines }) {
        cart { ${CART_FIELDS} }
      }
    }`,
    { lines: [{ merchandiseId: variantId, quantity }] },
  );
  return json.data.cartCreate.cart;
}

export async function addCartLines(
  cartId: string,
  variantId: string,
  quantity = 1,
): Promise<ShopifyCart> {
  const json = await cartFetch<{
    data: { cartLinesAdd: { cart: ShopifyCart } };
  }>(
    `mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ${CART_FIELDS} }
      }
    }`,
    { cartId, lines: [{ merchandiseId: variantId, quantity }] },
  );
  return json.data.cartLinesAdd.cart;
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<ShopifyCart> {
  const json = await cartFetch<{
    data: { cartLinesUpdate: { cart: ShopifyCart } };
  }>(
    `mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ${CART_FIELDS} }
      }
    }`,
    { cartId, lines: [{ id: lineId, quantity }] },
  );
  return json.data.cartLinesUpdate.cart;
}

export async function removeCartLine(
  cartId: string,
  lineId: string,
): Promise<ShopifyCart> {
  const json = await cartFetch<{
    data: { cartLinesRemove: { cart: ShopifyCart } };
  }>(
    `mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ${CART_FIELDS} }
      }
    }`,
    { cartId, lineIds: [lineId] },
  );
  return json.data.cartLinesRemove.cart;
}
