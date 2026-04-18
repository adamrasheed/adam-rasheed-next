import clsx from "clsx";
import { config } from "@fortawesome/fontawesome-svg-core";
import "../styles/globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { cookies } from "next/headers";
import { getCart } from "@/lib/shopify";
import { CartProvider } from "@/context/CartContext";
config.autoAddCss = false;

export const metadata = {
  title: "Adam Rasheed",
  description: "Adam Rasheed is a software engineer based in Los Angeles, CA.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cartId = cookies().get("shopify_cart_id")?.value;
  const initialCart = cartId ? await getCart(cartId).catch(() => null) : null;

  return (
    <html lang="en">
      <body
        className={clsx(
          "min-h-screen",
          "flex",
          "flex-col",
          "items-stretch",
          "justify-start"
        )}
      >
        <CartProvider initialCart={initialCart}>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
