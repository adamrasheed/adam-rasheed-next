import { sanityFetch } from "@/sanity/lib/client";
import {
  CATEGORIES_QUERYResult,
  POSTS_PREVIEW_BY_SLUG_QUERYResult,
} from "../../../sanity.types";
import {
  CATEGORIES_QUERY,
  POSTS_PREVIEW_BY_SLUG_QUERY,
} from "@/sanity/queries";
import PostListings from "./_components/PostListings";

type PageProps = {
  searchParams: {
    category?: string;
  };
};

export default async function BlogsPage({ searchParams }: PageProps) {
  const { category } = searchParams;

  const categories = await sanityFetch<CATEGORIES_QUERYResult>({
    query: CATEGORIES_QUERY,
  });

  const posts = await sanityFetch<POSTS_PREVIEW_BY_SLUG_QUERYResult>({
    query: POSTS_PREVIEW_BY_SLUG_QUERY,
    params: {
      categorySlug: category || null,
    },
  });

  return <PostListings posts={posts} categories={categories} />;
}
