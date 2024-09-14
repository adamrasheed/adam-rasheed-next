import clsx from "clsx";
import { SINGLE_POST_QUERYResult } from "../../../../../sanity.types";
import Link from "next/link";
import { PATHS } from "@/app/_utils";

type SidebarPostsType = SINGLE_POST_QUERYResult["fallbackPosts"];

const PostSidebar = ({ posts }: { posts: SidebarPostsType }) => {
  if (!posts || !posts.length) return null;

  return (
    <aside
      className={clsx(
        "sidebar",
        "space-y-4",
        "max-w-[16rem]",
        "md:sticky",
        "md:top-8",
        "md:place-self-start"
      )}
    >
      <h2
        className={clsx(
          "accent",
          "lrg",
          "leading-none",
          "font-semibold",
          "text-base",
          "small-caps"
        )}
      >
        Related Posts
      </h2>
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post._id}>
            <Link
              href={`${PATHS.BLOG}/${post.slug?.current || ""}`}
              className="text-sm"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default PostSidebar;
