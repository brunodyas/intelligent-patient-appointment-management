"use client";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useJune } from "./useJune";

type RouteChangeHandler = (url: string) => void;

export const useRouteChange = () => {
  const [routeClicked, setRouteClicked] = useState(false);
  const pathname = usePathname();
  const analytics = useJune();

  useEffect(() => {
    if (routeClicked) {
      setRouteClicked(false);
    }
    pathname && analytics && handleRouteChange(pathname);
  }, [pathname]);

  const handleRouteChange: RouteChangeHandler = (url) => {
    analytics.page(url);
  };

  return {
    currentRoute: pathname,
    routeClicked,
    setRouteClicked,
  };
};
