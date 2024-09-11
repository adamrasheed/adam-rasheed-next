import { sanityFetch } from "@/sanity/lib/client";
import { POSTS_QUERYResult } from "../../../sanity.types";
import { POSTS_QUERY } from "@/sanity/queries";
import PostListings from "./_components/PostListings";

export default async function BlogsPage() {
  const posts = await sanityFetch<POSTS_QUERYResult>({
    query: POSTS_QUERY,
  });

  return <PostListings posts={posts} />;
}
