import { sanityFetch } from "@/sanity/lib/client";
import { RSS_POSTS_QUERY } from "@/sanity/queries";
import { SITE_NAME, SITE_URL } from "@/constants";
import { PATHS } from "@/app/_utils";
import { RSS_POSTS_QUERYResult } from "../../../../sanity.types";

const escape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function GET() {
  const posts = await sanityFetch<RSS_POSTS_QUERYResult>({
    query: RSS_POSTS_QUERY,
    tags: ["post", "category"],
  });

  const items = posts
    .map((post) => {
      const link = `${SITE_URL}${PATHS.BLOG}/${post.slug}`;
      return `    <item>
      <title>${escape(post.title ?? "Untitled")}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      ${post.publishedAt ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>` : ""}
      ${post.excerpt ? `<description>${escape(post.excerpt)}</description>` : ""}
      ${(post.categories ?? [])
        .filter(Boolean)
        .map((category) => `<category>${escape(category!)}</category>`)
        .join("")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(SITE_NAME)}</title>
    <link>${SITE_URL}${PATHS.BLOG}</link>
    <description>Writing on software, Shopify, travel, and more.</description>
    <atom:link href="${SITE_URL}${PATHS.BLOG}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
