import { sanityFetch } from "@/sanity/lib/client";
import type { Metadata } from "next";
import { SITE_INFO_QUERY } from "@/sanity/queries";
import Header from "./_components/Header";
import { SiteInfoQueryRizzult } from "./_types";
import Footer from "./_components/Footer";
import { PortableText } from "@portabletext/react";
import clsx from "clsx";

export const metadata: Metadata = {
  title: "Adam Rasheed | Software Engineer",
  description:
    "Adam Rasheed is a software engineer based in Los Angeles, California. He specializes in building web applications with React, TypeScript, and Node.js.",
};

export default async function IndexPage() {
  const siteInfo = await sanityFetch<SiteInfoQueryRizzult>({
    query: SITE_INFO_QUERY,
  });

  const { title, description, resume, socialMedia } = siteInfo[0];

  console.log(description);

  return (
    <>
      <Header title={title} />
      <main className={clsx("flex-1")}>
        <div
          className={clsx(
            "container",
            "mt-10",
            "mb-20",
            "xl:mt-[8vw]",
            "xl:mb-[10vw]"
          )}
        >
          <div className="prose-lg prose-h2:max-w-[32ch] prose-h2:text-5xl">
            <PortableText
              value={description}
              components={{
                marks: {
                  // ...
                },
              }}
            />
          </div>
        </div>
      </main>
      <Footer socialMedia={socialMedia} resume={resume} />
    </>
  );
}
