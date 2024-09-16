import { sanityFetch } from "@/sanity/lib/client";
import PageWrapper from "../_components/PageWrapper";
import About from "./_components/About";
import { ABOUT_QUERYResult } from "../../../sanity.types";
import { ABOUT_QUERY } from "@/sanity/queries";

export default async function AboutPage() {
  const aboutProps = await sanityFetch<ABOUT_QUERYResult>({
    query: ABOUT_QUERY,
  });

  if (!aboutProps) return <p>No response</p>;

  return (
    <PageWrapper>
      <About {...aboutProps} />
    </PageWrapper>
  );
}
