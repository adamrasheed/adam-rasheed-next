import clsx from "clsx";
import {
  CASE_STUDIES_PREVIEW_QUERYResult,
  HOME_QUERYResult,
} from "../../../../sanity.types";
import CaseStudyPreview from "@/app/_components/CaseStudyPreview";
import { FC } from "react";

type CaseStudiesListingsProps = {
  caseStudies:
    | HOME_QUERYResult["caseStudies"]
    | CASE_STUDIES_PREVIEW_QUERYResult;
};

const CaseStudiesListings: FC<CaseStudiesListingsProps> = ({ caseStudies }) => {
  if (!caseStudies) {
    return null;
  }

  return (
    <div>
      <h1 className="page-title">{"Case Studies"}</h1>
      <div className={clsx("container", "lg:px-0", "grid", "gap-8")}>
        {caseStudies.map((caseStudy) => (
          <CaseStudyPreview key={caseStudy._id} {...caseStudy} />
        ))}
      </div>
    </div>
  );
};

export default CaseStudiesListings;
