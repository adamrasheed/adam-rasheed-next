import { getProductByHandle } from "@/lib/shopify";

export async function GET(
  _request: Request,
  { params }: { params: { handle: string } },
) {
  const handle = decodeURIComponent(params.handle).trim();
  if (!handle) {
    return Response.json({ error: "Missing product handle" }, { status: 400 });
  }

  try {
    const product = await getProductByHandle(handle);
    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }
    return Response.json(product);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load product";
    return Response.json({ error: message }, { status: 500 });
  }
}
