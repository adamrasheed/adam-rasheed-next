import { FC } from "react";
import Link from "next/link";
import { getFormattedDate, PATHS } from "@/app/_utils";
import { POSTS_PREVIEW_BY_SLUG_QUERYResult } from "../../../../sanity.types";

type PostPreviewProps = POSTS_PREVIEW_BY_SLUG_QUERYResult[0];

const PostPreview: FC<PostPreviewProps> = ({
  categories,
  excerpt,
  publishedAt,
  slug,
  title,
}) => {
  const showCategories = categories?.length && categories?.length > 0;

  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-lg">
        <Link href={slug?.current ? `${PATHS.BLOG}/${slug.current}` : "/"}>
          {title}
        </Link>
      </h2>
      <div className="flex justify-start gap-4">
        {publishedAt && (
          <p className="small-caps">{getFormattedDate(publishedAt)}</p>
        )}
        {showCategories && (
          <div>
            {categories?.map((category) =>
              category.slug ? (
                <Link
                  key={category._id}
                  className="small-caps font-normal"
                  href={`${PATHS.BLOG}?category=${category.slug}`}
                >
                  {category.title}
                </Link>
              ) : (
                <p key={category._id} className="small-caps font-normal">
                  {category.title}
                </p>
              )
            )}
          </div>
        )}
      </div>
      <p className="text-sm">{excerpt}</p>
    </div>
  );
};

export default PostPreview;
