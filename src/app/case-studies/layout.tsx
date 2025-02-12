import PageWrapper from "../_components/PageWrapper";

export const metadata = {
  title: "Blog",
  description: "Adam Rasheed blog about software engineering, travel, and more",
};

export default async function CaseStudiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageWrapper className="px-0">{children}</PageWrapper>;
}
