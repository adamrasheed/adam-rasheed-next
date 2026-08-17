import "server-only";

import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

// Orders and the open/closed switch are live state, not published content. They
// must never come off the CDN: a cached "bar is open" would let orders through
// after closing time.
export const barReadClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
});

/**
 * Write-capable client, or null when the token is missing. Callers return a 500
 * rather than throwing at import time, so a missing env var never takes the
 * whole /bar page down with it.
 */
export function getBarWriteClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN;

  if (!token) return null;

  return barReadClient.withConfig({ token });
}
