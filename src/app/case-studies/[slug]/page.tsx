import { client } from "@/sanity/lib/client";
import { CASE_STUDY_BY_SLUG_QUERY } from "@/sanity/queries";
import CaseStudy from "./_components/CaseStudy";

export default async function CaseStudiePage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const caseStudy = await client.fetch(CASE_STUDY_BY_SLUG_QUERY, { slug });

  if (!caseStudy) {
    return null;
  }

  console.log(caseStudy);

  return <CaseStudy {...caseStudy} />;
}
