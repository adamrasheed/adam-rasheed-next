import { getProductByHandle } from "@/lib/shopify";
import AddToCartButton from "../_components/AddToCartButton";
import ProductImages from "../_components/ProductImages";
import Link from "next/link";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default async function CeramicsProductPage({
  params: { handle },
}: {
  params: { handle: string };
}) {
  const product = await getProductByHandle(handle);

  const title = product?.title;
  const description = product?.description;
  const price = product?.priceRange.minVariantPrice;
  const formattedPrice = parseFloat(price?.amount ?? "0").toLocaleString(
    "en-US",
    {
      style: "currency",
      currency: price?.currencyCode ?? "USD",
    },
  );
  const imageNodes = product?.images.edges.map((e) => e.node) ?? [];
  const variantId = product?.variants.edges[0]?.node.id;

  if (!product || !variantId) {
    return null;
  }

  return (
    <>
      <div className="container px-8 mb-4 small-caps leading-none opacity-60">
        <Link href="/ceramics">
          <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> Ceramics
        </Link>
      </div>
      <div className="container px-8 mb-8 grid md:grid-cols-2 md:align-top gap-8">
        <ProductImages images={imageNodes} title={title ?? ""} />
        <div data-testid="product-details">
          <h1 className="text-2xl font-bold mb-8">{title}</h1>
          <p>{description}</p>
          <p>{formattedPrice}</p>
          <AddToCartButton variantId={variantId} />
        </div>
      </div>
    </>
  );
}
