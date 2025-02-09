import clsx from "clsx";
import { PortableText } from "next-sanity";
import { PAGE_QUERYResult } from "../../../../sanity.types";
import { FC } from "react";

type PageProps = NonNullable<PAGE_QUERYResult>;

const Page: FC<PageProps> = ({ title, body }) => {
  return (
    <div className="prose dark:prose-invert">
      <h1 className={clsx("page-title")}>{title}</h1>
      {body && <PortableText value={body} />}
    </div>
  );
};

export default Page;
