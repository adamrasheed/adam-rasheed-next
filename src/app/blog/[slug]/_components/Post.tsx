import clsx from "clsx";
import { SINGLE_POST_QUERYResult } from "../../../../../sanity.types";
import { PortableText } from "next-sanity";
import { getFormattedDate } from "@/app/_utils";
import PostSidebar from "./PostSidebar";

const Post = ({ post }: { post: NonNullable<SINGLE_POST_QUERYResult> }) => {
  const { title, body, publishedAt } = post;
  console.log({ publishedAt });
  return (
    <div className={clsx("post-container")}>
      <div className="grid gap-8">
        <nav>breadcrumbs</nav>
        <article className="prose dark:prose-invert">
          <h1>{title}</h1>
          {publishedAt && (
            <p className="small-caps">{getFormattedDate(publishedAt)}</p>
          )}
          {body && <PortableText value={body} />}
        </article>
      </div>
      <PostSidebar />
    </div>
  );
};

export default Post;
