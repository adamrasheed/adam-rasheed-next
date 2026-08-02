import clsx from "clsx";
import { SINGLE_POST_QUERYResult } from "../../../../../sanity.types";
import { PortableText } from "next-sanity";
import { getFormattedDate, getPostHeadings } from "@/app/_utils";
import PostSidebar from "./PostSidebar";
import BreadCrumbs, { BreadCrumbType } from "@/app/_components/Breadcrumbs";
import { richTextComponents } from "@/app/_components/RichText";

const Post = ({
  singlePost,
}: {
  singlePost: NonNullable<SINGLE_POST_QUERYResult>;
}) => {
  const { post, fallbackPosts, relatedPostsByCategory, author } = singlePost;

  if (!post) return null;

  const { title, publishedAt, body } = post;

  // Recency-based filler. It used to be merged into the related list under one
  // "Related Posts" heading, which meant a post with no category siblings
  // recommended whatever happened to be newest.
  const relatedIds = new Set(relatedPostsByCategory.map((post) => post._id));
  const morePosts = fallbackPosts
    .filter((post) => !relatedIds.has(post._id))
    .slice(0, Math.max(0, 3 - relatedPostsByCategory.length));

  const headings = getPostHeadings(body);
  const headingIds = Object.fromEntries(
    headings.map((heading) => [heading._key, heading.id])
  );

  const breadCrumbs: BreadCrumbType[] = [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Blog",
      href: "/blog",
    },
    {
      title: post.title || "",
    },
  ];

  return (
    <>
      <BreadCrumbs breadcrumbs={breadCrumbs} />
      <div className={clsx("post-container")}>
        <div className="grid gap-8">
          <article className="prose dark:prose-invert prose-images md:mb-16">
            <h1>{title}</h1>
            {publishedAt && (
              <p className="small-caps">{getFormattedDate(publishedAt)}</p>
            )}
            {body && (
              <PortableText
                value={body}
                components={richTextComponents("prose-image", headingIds)}
              />
            )}
          </article>
        </div>
        <PostSidebar
          headings={headings}
          author={author}
          relatedPosts={relatedPostsByCategory}
          morePosts={morePosts}
        />
      </div>
    </>
  );
};

export default Post;
