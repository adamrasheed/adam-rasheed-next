import { sanityFetch } from "@/sanity/lib/client";
import type { Metadata } from "next";
import { HOME_QUERY } from "@/sanity/queries";
import Header from "./_components/Header";
import { SiteInfoQueryRizzult } from "./_types";
import Footer from "./_components/Footer";
import { PortableText } from "@portabletext/react";
import clsx from "clsx";
import { HOME_QUERYResult } from "../../sanity.types";
import PreviewBlock from "./_components/PreviewBlock";

export const metadata: Metadata = {
  title: "Adam Rasheed | Software Engineer",
  description:
    "Adam Rasheed is a software engineer based in Los Angeles, California. He specializes in building web applications with React, TypeScript, and Node.js.",
};

export default async function IndexPage() {
  const { siteInfo, posts, caseStudies } = await sanityFetch<HOME_QUERYResult>({
    query: HOME_QUERY,
  });

  const info = siteInfo[0] as SiteInfoQueryRizzult[0];

  const { title, description, resume, socialMedia } = info;

  console.log(posts, caseStudies);

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
          <PreviewBlock title="Blog" href="/blog">
            <p>Hello</p>
          </PreviewBlock>
        </div>
      </main>
      <Footer socialMedia={socialMedia} resume={resume} />
    </>
  );
}
