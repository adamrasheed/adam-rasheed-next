import clsx from "clsx";
import { POSTS_QUERYResult } from "../../../../sanity.types";

const PostListings = ({ posts }: { posts: POSTS_QUERYResult }) => {
  return (
    <div className={clsx("container", "grid", "grid-cols-2", "gap-8")}>
      {posts.map((post) => (
        <div key={post._id}>{post.title}</div>
      ))}
    </div>
  );
};

export default PostListings;
