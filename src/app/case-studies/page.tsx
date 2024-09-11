import { sanityFetch } from "@/sanity/lib/client";
import { CASE_STUDIES_QUERY } from "@/sanity/queries";
import CaseStudiesListings from "./_components/CaseStudiesListings";
import { CASE_STUDIES_QUERYResult } from "../../../sanity.types";

export default async function CaseStudiesPage() {
  const caseStudies = await sanityFetch<CASE_STUDIES_QUERYResult>({
    query: CASE_STUDIES_QUERY,
  });

  return <CaseStudiesListings caseStudies={caseStudies} />;
}
