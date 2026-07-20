import { sanityFetch } from "@/sanity/lib/client";
import { CASE_STUDY_BY_SLUG_QUERY } from "@/sanity/queries";
import CaseStudy from "./_components/CaseStudy";
import { CASE_STUDY_BY_SLUG_QUERYResult } from "../../../../sanity.types";

export default async function CaseStudiePage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const caseStudy = await sanityFetch<CASE_STUDY_BY_SLUG_QUERYResult>({
    query: CASE_STUDY_BY_SLUG_QUERY,
    params: { slug },
  });

  if (!caseStudy) {
    return null;
  }

  return <CaseStudy {...caseStudy} />;
}
