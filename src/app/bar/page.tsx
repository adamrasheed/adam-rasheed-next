import { sanityFetch } from "@/sanity/lib/client";
import { COCKTAILS_QUERY } from "@/sanity/queries";
import { COCKTAILS_QUERYResult } from "../../../sanity.types";
import { COCKTAIL_CATEGORIES } from "@/sanity/cocktailCategories";

export default async function BarPage() {
  const cocktails = await sanityFetch<COCKTAILS_QUERYResult>({
    query: COCKTAILS_QUERY,
  });

  const sections = COCKTAIL_CATEGORIES.map((category) => ({
    ...category,
    cocktails: cocktails.filter((c) => c.category === category.value),
  })).filter((section) => section.cocktails.length > 0);

  return (
    <div className="page-container sml">
      <h1 className="page-title">The Bar</h1>

      <div className="grid gap-y-0 [&>section]:p-y-2">
        {sections.map((section) => (
          <section key={section.value}>
            <h2 className="section-title small-caps text-lg">
              {section.title} —
            </h2>
            <ul className="grid gap-6">
              {section.cocktails.map((cocktail) => (
                <li key={cocktail._id}>
                  <h3 className="text-lg font-bold mb-1">{cocktail.name}</h3>
                  <p className="text-sm mb-1">{cocktail.description}</p>
                  <p className="text-xs text-gray-500 small-caps">
                    {cocktail.ingredients?.join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
