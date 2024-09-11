import { sanityFetch } from "@/sanity/lib/client";
import type { Metadata } from "next";
import { SITE_INFO_QUERY } from "@/sanity/queries";
import Header from "./_components/Header";
import { SiteInfoQueryRizzult } from "./_types";
import Footer from "./_components/Footer";

export const metadata: Metadata = {
  title: "Adam Rasheed | Software Engineer",
  description:
    "Adam Rasheed is a software engineer based in Los Angeles, California. He specializes in building web applications with React, TypeScript, and Node.js.",
};

export default async function IndexPage() {
  const siteInfo = await sanityFetch<SiteInfoQueryRizzult>({
    query: SITE_INFO_QUERY,
  });

  const info = siteInfo[0];

  return (
    <>
      <Header title={info.title} />
      <main className="flex-1">hello</main>
      <Footer socialMedia={info.socialMedia} resume={info.resume} />
    </>
  );
}
