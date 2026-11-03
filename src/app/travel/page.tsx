import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { sanityFetch } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { TRAVEL_POSTS_QUERY } from "@/sanity/queries";
import { getFormattedDate, PATHS } from "@/app/_utils";
import { TRAVEL_POSTS_QUERYResult } from "../../../sanity.types";

// Cards crop to one ratio so the grid stays even; the post itself shows the
// full frame.
const CARD_W = 900;
const CARD_H = 600;

export default async function TravelPage() {
  const posts = await sanityFetch<TRAVEL_POSTS_QUERYResult>({
    query: TRAVEL_POSTS_QUERY,
    tags: ["post", "category"],
  });

  return (
    <div>
      <h1 className="page-title">Travel</h1>

      {posts.length === 0 && (
        <p>
          No trips written up yet. Add the “Travel” category to a post to list
          it here.
        </p>
      )}

      <div className={clsx("grid", "gap-10", "sm:grid-cols-2")}>
        {posts.map((post) => {
          const href = `${PATHS.BLOG}/${post.slug?.current}`;
          return (
            <article key={post._id} className="space-y-3">
              {post.mainImage?.asset && (
                <Link href={href} className="block overflow-hidden rounded-md">
                  <Image
                    src={urlFor(post.mainImage)
                      .width(CARD_W)
                      .height(CARD_H)
                      .fit("crop")
                      .auto("format")
                      .url()}
                    alt={post.mainImage.alt || ""}
                    width={CARD_W}
                    height={CARD_H}
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="w-full h-auto transition-transform duration-300 hover:scale-[1.02]"
                  />
                </Link>
              )}
              <h2 className="font-semibold text-lg">
                <Link href={href}>{post.title}</Link>
              </h2>
              {post.publishedAt && (
                <p className="small-caps">{getFormattedDate(post.publishedAt)}</p>
              )}
              {post.excerpt && <p className="text-sm">{post.excerpt}</p>}
            </article>
          );
        })}
      </div>
    </div>
  );
}
