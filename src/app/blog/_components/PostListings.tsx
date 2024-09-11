import { POSTS_QUERYResult } from "../../../../sanity.types";

const PostListings = ({ posts }: { posts: POSTS_QUERYResult }) => {
  return (
    <div>
      {posts.map((post) => (
        <div key={post._id}>{post.title}</div>
      ))}
    </div>
  );
};

export default PostListings;
