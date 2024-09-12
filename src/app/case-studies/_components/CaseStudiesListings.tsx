import clsx from "clsx";
import { CASE_STUDIES_QUERYResult } from "../../../../sanity.types";

const CaseStudiesListings = ({
  caseStudies,
}: {
  caseStudies: CASE_STUDIES_QUERYResult;
}) => {
  console.log({ caseStudies });

  return (
    <div className={clsx("container", "grid", "grid-cols-2", "gap-8")}>
      {caseStudies.map((caseStudy, idx) => (
        <div key={`${caseStudy._id}_${idx}`}>
          <h2>{caseStudy.title}</h2>
          <p>{caseStudy.subtitle}</p>
          <p>{caseStudy.teaser}</p>
        </div>
      ))}
    </div>
  );
};

export default CaseStudiesListings;
