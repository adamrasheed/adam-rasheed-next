import clsx from "clsx";
import { SINGLE_POST_QUERYResult } from "../../../../../sanity.types";
import { PortableText } from "next-sanity";
import { stegaClean } from "@sanity/client/stega";
import {
  getFormattedDate,
  getPostHeadings,
  getReadingMinutes,
  PATHS,
} from "@/app/_utils";
import SanityImage from "@/app/_components/SanityImage";
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

  const { title, publishedAt, updatedAt, body, mainImage, tags, bodyText } =
    post;

  const isTravel = post.categories?.some(
    (category) => stegaClean(category.slug) === "travel"
  );

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
    isTravel
      ? { title: "Travel", href: PATHS.TRAVEL }
      : { title: "Blog", href: PATHS.BLOG },
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
            <p className="small-caps">
              {[
                publishedAt && getFormattedDate(publishedAt),
                updatedAt &&
                  updatedAt.slice(0, 10) !== publishedAt?.slice(0, 10) &&
                  `Updated ${getFormattedDate(updatedAt)}`,
                `${getReadingMinutes(bodyText)} min read`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {mainImage?.asset && (
              <figure>
                <SanityImage
                  img={{ ...mainImage, metadata: null }}
                  className="prose-image"
                  sizes="(min-width: 768px) 48rem, 100vw"
                  priority
                />
                {mainImage.caption && (
                  <figcaption>{mainImage.caption}</figcaption>
                )}
              </figure>
            )}
            {body && (
              <PortableText
                value={body}
                components={richTextComponents("prose-image", headingIds)}
              />
            )}
            {!!tags?.length && (
              <ul className="not-prose flex flex-wrap gap-2 list-none p-0 mt-8">
                {tags.map((tag) => (
                  <li key={tag} className="small-caps text-sm">
                    #{tag}
                  </li>
                ))}
              </ul>
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
