import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/lib/client";
import { SINGLE_POST_QUERY } from "@/sanity/queries";
import { SITE_NAME } from "@/constants";
import Post from "./_components/Post";
import { SINGLE_POST_QUERYResult } from "../../../../sanity.types";

// Same query, args, and tags in both functions so Next's fetch cache dedupes
// them into one request per render. Draft mode also lets a scheduled post load.
const fetchPost = (slug: string) =>
  sanityFetch<SINGLE_POST_QUERYResult>({
    query: SINGLE_POST_QUERY,
    params: { slug, preview: draftMode().isEnabled },
    tags: ["post", "author", "siteInfo", "category"],
  });

export async function generateMetadata({
  params: { slug },
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = (await fetchPost(slug))?.post;

  // Without this every post inherited the layout's static "Blog" title, which
  // is what share previews were showing.
  if (!post) return { title: "Post not found" };

  const title = post.seoTitle || post.title || "Untitled";
  const description = post.seoDescription || post.excerpt || undefined;
  const url = `/blog/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: SITE_NAME,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt ?? undefined,
      authors: [SITE_NAME],
      tags: post.tags ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function BlogPostPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const singlePost = await fetchPost(slug);

  if (!singlePost?.post) notFound();

  return <Post singlePost={singlePost} />;
}
