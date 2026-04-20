"use client";

import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";

export type ProductImage = { url: string; altText: string | null };

type ProductImagesProps = {
  images: ProductImage[];
  title: string;
};

export default function ProductImages({ images, title }: ProductImagesProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const list = images.filter((img) => img.url);
  if (list.length === 0) return null;

  const main = list[activeIndex] ?? list[0];
  const mainAlt = main.altText ?? title;

  return (
    <div data-testid="product-image">
      <div className="relative aspect-[4/5] w-full overflow-hidden mb-3 bg-[var(--bgSecondary)]">
        <Image
          key={main.url}
          src={main.url}
          alt={mainAlt}
          fill
          priority
          sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      {list.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory [-webkit-overflow-scrolling:touch]"
          role="list"
        >
          {list.map((img, i) => {
            const isActive = i === activeIndex;
            const thumbAlt = img.altText ?? `${title} — thumbnail ${i + 1}`;
            return (
              <button
                key={`${img.url}-${i}`}
                type="button"
                role="listitem"
                onClick={() => setActiveIndex(i)}
                aria-label={`Show image ${i + 1} of ${list.length}`}
                className={clsx(
                  "relative shrink-0 h-20 w-16 overflow-hidden rounded-sm snap-start transition-[opacity,box-shadow] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current",
                  isActive
                    ? "ring-2 ring-neutral-900/80 ring-offset-2"
                    : "opacity-70 hover:opacity-100",
                )}
              >
                <Image
                  src={img.url}
                  alt={thumbAlt}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
