"use client";
import { FC } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES_QUERYResult } from "../../../../sanity.types";
import clsx from "clsx";

type PostCategoriesProps = {
  categories: CATEGORIES_QUERYResult;
};

const PostCategories: FC<PostCategoriesProps> = ({ categories }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  const handleCategoryClick = (categorySlug: string | null) => {
    const params = new URLSearchParams(searchParams);

    if (categorySlug) {
      params.set("category", categorySlug);
    } else {
      params.delete("category");
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <div
      className={clsx(
        "flex",
        "gap-4",
        "mb-8",
        "justify-center",
        "md:justify-start",
        "text-gray-500",
        "transition-all",
        "text-sm"
      )}
    >
      <button
        className={clsx(
          "hover:text-gray-800",
          "dark:hover:text-gray-200",
          "focus:outline-none",
          "transition-all",
          currentCategory === null && "text-gray-800 dark:text-gray-200",
          currentCategory === null && "font-bold"
        )}
        onClick={() => handleCategoryClick(null)}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category._id}
          onClick={() => handleCategoryClick(category.slug)}
          className={clsx(
            "hover:text-gray-800",
            "dark:hover:text-gray-200",
            "focus:outline-none",
            "transition-all",
            currentCategory === category.slug &&
              "text-gray-800 dark:text-gray-200",
            currentCategory === category.slug && "font-bold"
          )}
        >
          {category.title}
        </button>
      ))}
    </div>
  );
};

export default PostCategories;
