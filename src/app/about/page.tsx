import { sanityFetch } from "@/sanity/lib/client";
import { CASE_STUDIES_QUERY, SITE_INFO_QUERY } from "@/sanity/queries";
import { CASE_STUDIES_QUERYResult } from "../../../sanity.types";
import Header from "../_components/Header";
import Footer from "../_components/Footer";
import { SiteInfoQueryRizzult } from "../_types";
import About from "./_components/About";

export default async function AboutPAge() {
  const siteInfo = await sanityFetch<SiteInfoQueryRizzult>({
    query: SITE_INFO_QUERY,
  });
  const { title, resume, socialMedia } = siteInfo[0];

  //   const caseStudies = await sanityFetch<CASE_STUDIES_QUERYResult>({
  //     query: CASE_STUDIES_QUERY,
  //   });

  return (
    <>
      <Header title={title} />
      <main className="flex-1 container">
        <About />
      </main>
      <Footer {...{ resume, socialMedia }} />
    </>
  );
}
