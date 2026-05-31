'use client';
import Link from "next/link";
import PageLoader from "./PageLoader";
import { useRouteChange } from "@/hooks/useRouteChange";

const Route = ({
  linkClassName,
  route,
  children,
}: {
  linkClassName: string;
  route: any;
  children: React.ReactNode;
}) => {
  const { currentRoute , routeClicked, setRouteClicked } = useRouteChange();

  const handleClick = () => {
    route && route !== "#" && currentRoute !== route && setRouteClicked(true);
  };

  return (
    <div onClick={handleClick} className="w-full">
      <Link href={route} className={linkClassName}>
        {children}
      </Link>
      {routeClicked && <PageLoader />}
    </div>
  );
};

export default Route;
