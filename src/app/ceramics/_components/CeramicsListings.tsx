import clsx from "clsx";
import Image from "next/image";
import { ShopifyProduct } from "@/lib/shopify";
import AddToCartButton from "./AddToCartButton";
import Link from "next/link";

type CeramicsListingsProps = {
  products: ShopifyProduct[];
};

export default function CeramicsListings({ products }: CeramicsListingsProps) {
  return (
    <div>
      <h1 className="page-title px-8 lg:px-0">Ceramics</h1>
      <div
        className={clsx(
          "container",
          "px-8",
          "lg:px-0",
          "grid",
          "grid-cols-1",
          "sm:grid-cols-2",
          "md:grid-cols-3",
          "gap-8",
          "mb-16",
          "lg:mb-24",
        )}
      >
        {products.map((product) => {
          const image = product.images.edges[0]?.node;
          const price = product.priceRange.minVariantPrice;
          const variantId = product.variants.edges[0]?.node.id;
          const productUrl = product.onlineStoreUrl;
          const handle = product.handle;
          const formattedPrice = parseFloat(price.amount).toLocaleString(
            "en-US",
            { style: "currency", currency: price.currencyCode },
          );

          return (
            <div key={product.id}>
              <Link
                href={`/ceramics/${handle}`}
                className={clsx(
                  "group",
                  "block",
                  "hover:no-underline",
                  "focus:no-underline",
                )}
              >
                {image && (
                  <div className="relative aspect-[4/5] w-full overflow-hidden mb-3 bg-[var(--bgSecondary)]">
                    <Image
                      src={image.url}
                      alt={image.altText ?? product.title}
                      fill
                      sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover group-hover:opacity-90 transition-opacity"
                    />
                  </div>
                )}
                <p className="font-medium text-sm">{product.title}</p>
                <p className="text-sm small-caps tracking-wider opacity-60">
                  {formattedPrice}
                </p>
              </Link>
              {variantId && <AddToCartButton variantId={variantId} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
