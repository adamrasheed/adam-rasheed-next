import type { MetadataRoute } from "next";
import { sanityFetch } from "@/sanity/lib/client";
import { SITEMAP_QUERY } from "@/sanity/queries";
import { SITE_URL } from "@/constants";
import { PATHS } from "./_utils";
import { SITEMAP_QUERYResult } from "../../sanity.types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { posts, caseStudies, pages } = await sanityFetch<SITEMAP_QUERYResult>({
    query: SITEMAP_QUERY,
    tags: ["post", "caseStudy", "page"],
  });

  const url = (path: string) => `${SITE_URL}${path}`;

  return [
    { url: url("/") },
    { url: url(PATHS.ABOUT) },
    { url: url(PATHS.BLOG) },
    { url: url(PATHS.TRAVEL) },
    { url: url(PATHS.CASE_STUDIES) },
    ...posts.map((post) => ({
      url: url(`${PATHS.BLOG}/${post.slug}`),
      lastModified: post.updatedAt ?? post.publishedAt ?? post._updatedAt,
    })),
    ...caseStudies.map((study) => ({
      url: url(`${PATHS.CASE_STUDIES}/${study.slug}`),
      lastModified: study._updatedAt,
    })),
    ...pages.map((page) => ({
      url: url(`/${page.slug}`),
      lastModified: page._updatedAt,
    })),
  ];
}
