"use server";

import { SITE_INFO_QUERY } from "@/sanity/queries";
import { SiteInfoQueryRizzult } from "../_types";
import Footer from "./Footer";
import Header from "./Header";
import { sanityFetch } from "@/sanity/lib/client";
import { SITE_INFO_QUERYResult } from "../../../sanity.types";

export default async function PageWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteInfo = await sanityFetch<SITE_INFO_QUERYResult>({
    query: SITE_INFO_QUERY,
  });

  if (!siteInfo) return <div>Loading...</div>;

  const { title, resume, socialMedia } = siteInfo;

  return (
    <>
      <Header title={title} />
      <main className="flex-1 container">{children}</main>
      <Footer resume={resume} socialMedia={socialMedia} />
    </>
  );
}
