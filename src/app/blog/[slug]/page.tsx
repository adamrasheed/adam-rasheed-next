import { client } from "@/sanity/lib/client";
import { SINGLE_POST_QUERY } from "@/sanity/queries";
import Post from "./_components/Post";

export default async function BlogPostPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const post = await client.fetch(SINGLE_POST_QUERY, { slug });

  if (!post) return <p>No post found</p>;

  return <Post post={post} />;
}
