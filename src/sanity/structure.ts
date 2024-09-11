import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Site")
    .items([
      S.documentTypeListItem("post").title("Posts"),
      S.documentTypeListItem("category").title("Categories"),
      S.documentTypeListItem("caseStudy").title("Case Studies"),
      S.divider(),
      S.listItem()
        .title("Site Info")
        .child(S.document().schemaType("siteInfo").documentId("siteInfo")),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) =>
          item.getId() &&
          !["post", "category", "caseStudy", "siteInfo"].includes(item.getId()!)
      ),
      S.divider(),
    ]);
