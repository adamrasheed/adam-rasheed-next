import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Site")
    .items([
      S.documentTypeListItem("post").title("Posts"),
      S.documentTypeListItem("page").title("Pages"),
      S.documentTypeListItem("category").title("Categories"),
      S.documentTypeListItem("caseStudy").title("Case Studies"),
      S.listItem()
        .title("About")
        .child(S.document().schemaType("about").documentId("about")),
      S.divider(),
      S.listItem()
        .title("Site Info")
        .child(S.document().schemaType("siteInfo").documentId("siteInfo")),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) =>
          item.getId() &&
          ![
            "post",
            "page",
            "category",
            "caseStudy",
            "siteInfo",
            "about",
          ].includes(item.getId()!)
      ),
      S.divider(),
    ]);
