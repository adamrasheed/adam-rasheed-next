import { sanityFetch } from "@/sanity/lib/client";
import { PAGE_QUERY } from "@/sanity/queries";
import Page from "./_components/Page";
import { PAGE_QUERYResult } from "../../../sanity.types";

export const metadata = {
  title: "Page",
  description: "Page description",
};

export default async function PagePage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const page = await sanityFetch<PAGE_QUERYResult>({
    query: PAGE_QUERY,
    params: { slug },
  });

  if (!page) return null;

  return <Page {...page} />;
}
