import PageWrapper from "../_components/PageWrapper";

export const metadata = {
  title: "The Bar",
  description: "What's pouring at Adam's place",
  // Unlisted: shared by link only, kept out of search engines.
  robots: {
    index: false,
    follow: false,
  },
};

export default function BarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageWrapper className="px-8 lg:px-0">{children}</PageWrapper>;
}
