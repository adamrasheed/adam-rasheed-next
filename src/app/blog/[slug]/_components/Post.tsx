import clsx from "clsx";
import { SINGLE_POST_QUERYResult } from "../../../../../sanity.types";
import { PortableText } from "next-sanity";
import { getFormattedDate } from "@/app/_utils";
import PostSidebar from "./PostSidebar";
import BreadCrumbs, { BreadCrumbType } from "@/app/_components/Breadcrumbs";
import { richTextComponents } from "@/app/_components/RichText";

const Post = ({
  singlePost,
}: {
  singlePost: NonNullable<SINGLE_POST_QUERYResult>;
}) => {
  const { post, fallbackPosts, relatedPostsByCategory } = singlePost;

  if (!post) return null;

  const { title, publishedAt, body } = post;

  const relatedPosts = [...relatedPostsByCategory, ...fallbackPosts]
    .filter(
      (post, index, self) => self.findIndex((p) => p._id === post._id) === index
    ) // Remove duplicates
    .slice(0, 3);

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
                components={richTextComponents("prose-image")}
              />
            )}
          </article>
        </div>
        <PostSidebar posts={relatedPosts} />
      </div>
    </>
  );
};

export default Post;
