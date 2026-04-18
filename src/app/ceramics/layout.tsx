import PageWrapper from "../_components/PageWrapper";

export const metadata = {
  title: "Ceramics — Adam Rasheed",
  description: "Handmade ceramics available in my shop.",
};

export default async function CeramicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageWrapper className="px-0">{children}</PageWrapper>;
}
