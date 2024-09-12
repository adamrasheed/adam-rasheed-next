import clsx from "clsx";

const PostSidebar = () => {
  return (
    <aside
      className={clsx(
        "sidebar",
        "space-y-8",
        "max-w-[16rem]",
        "md:sticky",
        "md:top-8",
        "md:place-self-start"
      )}
    >
      <h2
        className={clsx(
          "accent",
          "lrg",
          "leading-none",
          "font-semibold",
          "text-base",
          "small-caps"
        )}
      >
        Related Posts
      </h2>
      <ul>
        <li>Post 1</li>
        <li>Post 2</li>
        <li>Post 3</li>
      </ul>
    </aside>
  );
};

export default PostSidebar;
