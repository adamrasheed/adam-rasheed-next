"use client";
import clsx from "clsx";
import {
  CATEGORIES_QUERYResult,
  POSTS_PREVIEW_BY_SLUG_QUERYResult,
} from "../../../../sanity.types";
import { FC } from "react";
import PostCategories from "./PostCategories";
import PostPreview from "./PostPreview";

type PostListingsProps = {
  posts: POSTS_PREVIEW_BY_SLUG_QUERYResult;
  categories: CATEGORIES_QUERYResult;
};
const PostListings: FC<PostListingsProps> = ({ categories, posts }) => {
  return (
    <div>
      <h1 className="page-title">{"Blog"}</h1>
      <PostCategories categories={categories} />

      <div
        className={clsx(
          "container",
          "px-0",
          "md:px-0",
          "grid",
          "grid-cols-2",
          "gap-8"
        )}
      >
        {posts.map((post) => (
          <PostPreview key={post._id} {...post} />
        ))}
      </div>
    </div>
  );
};

export default PostListings;
