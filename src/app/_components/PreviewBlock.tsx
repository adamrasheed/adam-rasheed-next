import clsx from "clsx";
import Link from "next/link";
import { FC, ReactNode } from "react";

type PreviewBlockProps = {
  title: string;
  href: string;
  children: ReactNode;
};
const PreviewBlock: FC<PreviewBlockProps> = ({ title, href, children }) => {
  return (
    <section>
      <header
        data-testid="previewBlock_header"
        className={clsx(
          "flex",
          "justify-between",
          "items-center",
          "mb-8",
          "px-4",
          "md:px-0"
        )}
      >
        <h2
          data-testid="previewBlock_title"
          className={clsx(
            "flex-1",
            "font-bold",
            "text-lg",
            "small-caps",
            "accent"
          )}
        >
          {title}
        </h2>
        <Link
          className={clsx("font-bold", "small-caps", "leading-none")}
          href={href}
        >{`More ${title} `}</Link>
      </header>
      {children}
    </section>
  );
};

export default PreviewBlock;
