import { SanityPage } from "@/app/_types";
import clsx from "clsx";
import { PortableText } from "next-sanity";

const Page = ({ page }: { page: SanityPage }) => {
  return (
    <div>
      <h1 className={clsx("text-lg", "mb-4", "md:mb-8")}>{page.title}</h1>
      {page.body && <PortableText value={page.body} />}
    </div>
  );
};

export default Page;
