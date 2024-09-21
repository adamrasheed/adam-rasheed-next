import { sanityFetch } from "@/sanity/lib/client";
import type { Metadata } from "next";
import { HOME_QUERY } from "@/sanity/queries";
import Header from "./_components/Header";
import Footer from "./_components/Footer";
import { PortableText } from "@portabletext/react";
import clsx from "clsx";
import { HOME_QUERYResult } from "../../sanity.types";
import PreviewBlock from "./_components/PreviewBlock";
import { getFormattedDate, PATH_NAMES, PATHS } from "./_utils";
import Link from "next/link";
import CaseStudyPreview from "./_components/CaseStudyPreview";

export const metadata: Metadata = {
  title: "Adam Rasheed | Software Engineer",
  description:
    "Adam Rasheed is a software engineer based in Los Angeles, California. He specializes in building web applications with React, TypeScript, and Node.js.",
};

export default async function IndexPage() {
  const { siteInfo, posts, caseStudies } = await sanityFetch<HOME_QUERYResult>({
    query: HOME_QUERY,
  });

  if (!siteInfo) return <div>Loading...</div>;

  const { title, description, resume, socialMedia } = siteInfo;

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
            "xl:mb-[10vw]",
            "px-0"
          )}
        >
          <div
            className={clsx(
              "prose-lg",
              "prose-h2:max-w-[32ch]",
              "prose-h2:text-5xl",
              "mt-[12vh]",
              "mb-[18vh]",
              "md:my-[15vh]",
              "px-4",
              "lg:px-0"
            )}
          >
            <PortableText
              value={description}
              components={{
                block: {
                  h1: ({ children }) => (
                    <h1 className={clsx("font-black", "text-4xl")}>
                      {children}
                    </h1>
                  ),
                },
              }}
            />
          </div>
          <PreviewBlock
            title={PATH_NAMES.CASE_STUDIES}
            href={PATHS.CASE_STUDIES}
          >
            <div className="grid gap-8">
              {caseStudies.map((study) => (
                <CaseStudyPreview key={study._id} {...study} />
              ))}
            </div>
          </PreviewBlock>
          <PreviewBlock title={PATH_NAMES.BLOG} href={PATHS.BLOG}>
            <div className="preview-block-container">
              {posts.map((post) => (
                <div key={post._id} className="preview-block">
                  <h2 className="text-xl font-bold mb-2">
                    <Link
                      href={
                        post.slug?.current
                          ? `${PATHS.BLOG}/${post.slug.current}`
                          : "/"
                      }
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-sm">{post.excerpt}</p>
                  {post.publishedAt && (
                    <p className="small-caps mt-2">
                      {getFormattedDate(post.publishedAt)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </PreviewBlock>
        </div>
      </main>
      <Footer socialMedia={socialMedia} resume={resume} />
    </>
  );
}
