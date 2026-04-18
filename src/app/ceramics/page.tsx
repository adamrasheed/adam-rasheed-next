import { getProducts } from "@/lib/shopify";
import CeramicsListings from "./_components/CeramicsListings";

export default async function CeramicsPage() {
  const products = await getProducts(24);

  return <CeramicsListings products={products} />;
}
