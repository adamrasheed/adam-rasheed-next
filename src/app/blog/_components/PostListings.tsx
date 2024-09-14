import clsx from "clsx";
import { POSTS_QUERYResult } from "../../../../sanity.types";
import Link from "next/link";
import { getFormattedDate, PATHS } from "@/app/_utils";

const PostListings = ({ posts }: { posts: POSTS_QUERYResult }) => {
  return (
    <div className={clsx("container", "px-0", "grid", "grid-cols-2", "gap-8")}>
      {posts.map((post) => (
        <div key={post._id} className="space-y-2">
          <h2 className="font-semibold text-lg">
            <Link
              href={
                post.slug?.current ? `${PATHS.BLOG}/${post.slug.current}` : "/"
              }
            >
              {post.title}
            </Link>
          </h2>
          {post.publishedAt && (
            <p className="small-caps">{getFormattedDate(post.publishedAt)}</p>
          )}
          <p className="text-sm">{post.excerpt}</p>
        </div>
      ))}
    </div>
  );
};

export default PostListings;
