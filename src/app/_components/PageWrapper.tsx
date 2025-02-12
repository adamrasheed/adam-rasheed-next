"use server";

import { SITE_INFO_QUERY } from "@/sanity/queries";
import Footer from "./Footer";
import Header from "./Header";
import { sanityFetch } from "@/sanity/lib/client";
import { SITE_INFO_QUERYResult } from "../../../sanity.types";
import clsx from "clsx";

export default async function PageWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const siteInfo = await sanityFetch<SITE_INFO_QUERYResult>({
    query: SITE_INFO_QUERY,
  });

  if (!siteInfo) return <div>Loading...</div>;

  const { title, resume, socialMedia } = siteInfo;

  return (
    <>
      <Header title={title} socialMedia={socialMedia} />
      <main className={clsx("flex-1 container lg:px-0", className)}>
        {children}
      </main>
      <Footer resume={resume} socialMedia={socialMedia} />
    </>
  );
}
