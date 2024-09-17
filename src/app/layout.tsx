import clsx from "clsx";
import "../styles/globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";

export const metadata = {
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
