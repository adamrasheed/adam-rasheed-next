import { client } from "@/sanity/lib/client";
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
  const page = await client.fetch<PAGE_QUERYResult>(PAGE_QUERY, { slug });

  if (!page) return null;

  return <Page page={page} />;
}
