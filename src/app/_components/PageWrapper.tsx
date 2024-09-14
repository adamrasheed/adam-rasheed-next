"use server";

import { SITE_INFO_QUERY } from "@/sanity/queries";
import { SiteInfoQueryRizzult } from "../_types";
import Footer from "./Footer";
import Header from "./Header";
import { sanityFetch } from "@/sanity/lib/client";

export default async function PageWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteInfo = await sanityFetch<SiteInfoQueryRizzult>({
    query: SITE_INFO_QUERY,
  });

  const { title, resume, socialMedia } = siteInfo[0];

  return (
    <>
      <Header title={title} />
      <main className="flex-1 container">{children}</main>
      <Footer resume={resume} socialMedia={socialMedia} />
    </>
  );
}
