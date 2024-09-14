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
      <header className={clsx("flex", "justify-between", "items-center")}>
        <h2>{title}</h2>
        <Link href={href}>{"View all →"}</Link>
      </header>
      {children}
    </section>
  );
};

export default PreviewBlock;
