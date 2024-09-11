import clsx from "clsx";

const name = "Adam Rasheed";

type HeaderProps = {
  title: string;
};
const Header = ({ title }: HeaderProps) => {
  return (
    <header className={clsx("flex", "gap-4", "items-center", "justify-start")}>
      <h1 className={clsx("text-2xl", "font-bold")}>
        <span>{name}</span>
        <span>{"|"}</span>
        <span>{title}</span>
      </h1>
    </header>
  );
};

export default Header;
