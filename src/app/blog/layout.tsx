import PageWrapper from "../_components/PageWrapper";

export const metadata = {
  title: "Blog",
  description: "Adam Rasheed blog about software engineering, travel, and more",
};

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageWrapper className="px-8 lg:px-0">{children}</PageWrapper>;
}
