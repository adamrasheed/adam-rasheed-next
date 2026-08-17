import { sanityFetch } from "@/sanity/lib/client";
import { getBarState } from "@/sanity/lib/barState";
import { COCKTAILS_QUERY } from "@/sanity/queries";
import { COCKTAILS_QUERYResult } from "../../../sanity.types";

import BarMenu from "./_components/BarMenu";

// Without this the page prerenders at build time and every guest gets a flash
// of "the bar is closed" before the first poll corrects it. The open/closed
// state has to be true at first paint.
export const dynamic = "force-dynamic";

export default async function BarPage() {
  const [cocktails, initialState] = await Promise.all([
    sanityFetch<COCKTAILS_QUERYResult>({ query: COCKTAILS_QUERY }),
    getBarState(),
  ]);

  return (
    <div className="page-container sml">
      <h1 className="page-title">The Bar</h1>

      <BarMenu cocktails={cocktails} initialState={initialState} />
    </div>
  );
}
