import { sanityFetch } from "@/sanity/lib/client";
import { POSTS_QUERYResult } from "../../../sanity.types";
import { POSTS_QUERY, SITE_INFO_QUERY } from "@/sanity/queries";
import PostListings from "./_components/PostListings";
import Header from "../_components/Header";
import { SiteInfoQueryRizzult } from "../_types";
import Footer from "../_components/Footer";

export default async function BlogsPage() {
  const siteInfo = await sanityFetch<SiteInfoQueryRizzult>({
    query: SITE_INFO_QUERY,
  });

  const posts = await sanityFetch<POSTS_QUERYResult>({
    query: POSTS_QUERY,
  });

  const { title, resume, socialMedia } = siteInfo[0];

  return (
    <>
      <Header title={title} />
      <main className="flex-1">
        <PostListings posts={posts} />
      </main>
      <Footer resume={resume} socialMedia={socialMedia} />
    </>
  );
}
