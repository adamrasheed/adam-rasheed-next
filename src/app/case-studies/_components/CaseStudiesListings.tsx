import clsx from "clsx";
import { CASE_STUDIES_QUERYResult } from "../../../../sanity.types";

const CaseStudiesListings = ({
  caseStudies,
}: {
  caseStudies: CASE_STUDIES_QUERYResult;
}) => {
  return (
    <div>
      <h1 className="page-title">{"Case Studies"}</h1>
      <div
        className={clsx("container", "lg:px-0", "grid", "grid-cols-2", "gap-8")}
      >
        {caseStudies.map((caseStudy, idx) => (
          <div key={`${caseStudy._id}_${idx}`}>
            <h2>{caseStudy.title}</h2>
            <p>{caseStudy.subtitle}</p>
            <p>{caseStudy.teaser}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseStudiesListings;
