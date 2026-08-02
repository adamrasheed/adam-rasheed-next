import clsx from "clsx";
import type { Metadata } from "next";
import { config } from "@fortawesome/fontawesome-svg-core";
import { SITE_URL } from "@/constants";
import "../styles/globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

export const metadata: Metadata = {
  // Required so relative OG/Twitter image paths resolve to absolute URLs.
  metadataBase: new URL(SITE_URL),
  title: "Adam Rasheed",
  description: "Adam Rasheed is a software engineer based in Los Angeles, CA.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        {children}
      </body>
    </html>
  );
}
