import clsx from "clsx";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity";
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
        {draftMode().isEnabled && (
          <>
            <VisualEditing />
            <a
              href="/api/draft-mode/disable"
              className="fixed bottom-4 right-4 z-50 rounded bg-slate-900 px-3 py-2 text-xs text-white"
            >
              Exit draft preview
            </a>
          </>
        )}
      </body>
    </html>
  );
}
