import clsx from "clsx";
import Link from "next/link";
import { FC, ReactNode } from "react";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
library.add(faChevronRight);

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
          "mb-4",
          "px-8",
          "lg:px-0"
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
        >
          {
            <div className="flex justify-end items-center gap-2">
              <span className="tracking-none">{`More ${title}`}</span>
              <FontAwesomeIcon
                className="translate-y-[1px]"
                icon={faChevronRight}
                height={8}
                size={"xs"}
              />
            </div>
          }
        </Link>
      </header>
      {children}
    </section>
  );
};

export default PreviewBlock;
