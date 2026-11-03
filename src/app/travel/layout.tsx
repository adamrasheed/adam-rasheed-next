import PageWrapper from "../_components/PageWrapper";

export const metadata = {
  title: "Travel",
  description: "Photos and stories from Adam Rasheed's travels",
  alternates: {
    canonical: "/travel",
    types: { "application/rss+xml": "/blog/rss.xml" },
  },
};

export default function TravelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageWrapper className="px-8 lg:px-0">{children}</PageWrapper>;
}
