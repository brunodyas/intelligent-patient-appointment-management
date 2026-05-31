import { useState } from "react";
import { destroyCookie } from "nookies";
import { JWT } from "../constants/enums/enums";
import { Alert } from "@/interface/signIn";
import { initializeAlert } from "@/data";
import { useRouter } from "next/navigation";
import { useRouteChange } from "./useRouteChange";
import { routes } from "@/constants/routes";

export const useLogout = () => {
  const [alert, setAlert] = useState<Alert>(initializeAlert);
  const router = useRouter();
  const { routeClicked, setRouteClicked } = useRouteChange();

  const handleLogout = async () => {
    destroyCookie(null, JWT, {
      path: "/",
      samesite: "strict",
    });
    setAlert({
      key: "logout-success",
      variant: "success",
      open: true,
      title: "Logout successful",
      desc: "You have successfully logged out",
    });
    setRouteClicked(true);
    window.location.href = routes.signIn;
  };

  return {
    routeClicked,
    logoutAlert: alert,
    handleLogout,
    setLogoutAlert: setAlert,
  };
};
