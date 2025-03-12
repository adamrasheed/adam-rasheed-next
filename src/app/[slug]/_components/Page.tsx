import clsx from "clsx";
import { PAGE_QUERYResult } from "../../../../sanity.types";
import { FC } from "react";
import RichText from "@/app/_components/RichText";

type PageProps = NonNullable<PAGE_QUERYResult>;

const Page: FC<PageProps> = ({ title, body }) => {
  if (!body) return null;

  return (
    <>
      <h1 className={clsx("page-title")}>{title}</h1>
      <RichText className="pb-8" content={body} />
    </>
  );
};

export default Page;
