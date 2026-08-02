import clsx from "clsx";
import { SINGLE_POST_QUERYResult } from "../../../../../sanity.types";
import Link from "next/link";
import { PATHS, type PostHeading } from "@/app/_utils";
import PostToc from "./PostToc";
import AuthorCard from "./AuthorCard";

type SidebarPostsType = NonNullable<SINGLE_POST_QUERYResult>["fallbackPosts"];
type AuthorType = NonNullable<SINGLE_POST_QUERYResult>["author"];

const headingClassName = clsx(
  "accent",
  "lrg",
  "leading-none",
  "font-semibold",
  "text-base",
  "small-caps"
);

const PostList = ({
  title,
  posts,
}: {
  title: string;
  posts: SidebarPostsType;
}) => {
  if (!posts.length) return null;

  // Deliberately a <div>: globals.css has a global `section { py-10 ... }` rule
  // that would add ~96px of padding above and below at desktop widths.
  return (
    <div className="space-y-3">
      <h2 className={headingClassName}>{title}</h2>
      <ul className="space-y-3">
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
    </div>
  );
};

type PostSidebarProps = {
  headings: PostHeading[];
  author: AuthorType;
  /** Posts that actually share a category with this one. */
  relatedPosts: SidebarPostsType;
  /** Recency-based filler, labelled separately on purpose: recent posts on
   *  unrelated topics should not be presented as related reading. */
  morePosts: SidebarPostsType;
};

const PostSidebar = ({
  headings,
  author,
  relatedPosts,
  morePosts,
}: PostSidebarProps) => {
  return (
    <aside
      className={clsx(
        "sidebar",
        // Enough whitespace to separate the blocks without borders, but the
        // whole column has to clear the viewport without scrolling.
        "space-y-8",
        "w-full",
        "md:max-w-[16rem]",
        "md:sticky",
        "md:top-12",
        "md:place-self-start",
        // A sticky column taller than the viewport leaves its lower items
        // permanently out of reach on short screens.
        "md:max-h-[calc(100vh-6rem)]",
        "md:overflow-y-auto"
      )}
    >
      {/* Anchor links are useless once the sidebar drops below the article on
          small screens, so the TOC is desktop-only. */}
      <div className="hidden md:block">
        <PostToc headings={headings} />
      </div>
      <AuthorCard author={author} />
      <PostList title="Related Posts" posts={relatedPosts} />
      <PostList title="More Posts" posts={morePosts} />
    </aside>
  );
};

export default PostSidebar;
