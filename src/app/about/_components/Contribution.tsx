import { FC } from "react";
import { ABOUT_QUERYResult } from "../../../../sanity.types";
import clsx from "clsx";

type ContributionProps = NonNullable<
  NonNullable<ABOUT_QUERYResult>["contributions"]
>[0];
const Contribution: FC<ContributionProps> = ({
  _key,
  title,
  contributions,
}) => {
  const hasContributions = contributions && contributions.length > 0;
  return (
    <li
      data-testid={`contribution_${_key}`}
      className={clsx("mb-8", "list-none")}
    >
      <h4
        className={clsx(
          "leading-none",
          "font-semibold",
          "accent",
          "small-caps",
          "lrg",
          "mb-4"
        )}
      >
        {title}
      </h4>
      <div className="space-y-4">
        {hasContributions &&
          contributions.map((c) => (
            <div key={c._key}>
              {c.link ? (
                <a
                  className="block text-sm font-semibold"
                  href={c.link}
                  target="_blank"
                  rel="noopener"
                >
                  {c.title}
                </a>
              ) : (
                <p className="text-sm font-semibold">{c.title}</p>
              )}
              <p className="small-caps text-sm">{c.description}</p>
            </div>
          ))}
      </div>
    </li>
  );
};

export default Contribution;
