import type { Metadata } from "next";
import { sanityFetch } from "@/sanity/lib/client";
import { SINGLE_POST_QUERY } from "@/sanity/queries";
import { SITE_NAME } from "@/constants";
import Post from "./_components/Post";
import { SINGLE_POST_QUERYResult } from "../../../../sanity.types";

export async function generateMetadata({
  params: { slug },
}: {
  params: { slug: string };
}): Promise<Metadata> {
  // Same query and args as the page below, so Next's fetch cache dedupes the
  // two calls into one request per render.
  const result = await sanityFetch<SINGLE_POST_QUERYResult>({
    query: SINGLE_POST_QUERY,
    params: { slug },
  });

  const post = result?.post;

  // Without this every post inherited the layout's static "Blog" title, which
  // is what share previews were showing.
  if (!post) return { title: "Post not found" };

  const title = post.title ?? "Untitled";
  const description = post.excerpt ?? undefined;
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
      authors: [SITE_NAME],
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
  const singlePost = await sanityFetch<SINGLE_POST_QUERYResult>({
    query: SINGLE_POST_QUERY,
    params: { slug },
  });

  if (!singlePost || !singlePost.post) return <p>No post found</p>;

  return <Post singlePost={singlePost} />;
}
