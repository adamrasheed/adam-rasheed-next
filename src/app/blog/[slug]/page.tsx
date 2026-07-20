import { sanityFetch } from "@/sanity/lib/client";
import { SINGLE_POST_QUERY } from "@/sanity/queries";
import Post from "./_components/Post";
import { SINGLE_POST_QUERYResult } from "../../../../sanity.types";

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
