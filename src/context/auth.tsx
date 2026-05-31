"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { FieldValues } from "react-hook-form";
import { fetchUserData } from "../services/auth";
import { UserInterFace } from "../interface/user";
import eventEmitter from "@/utils/eventEmitter";
import PageLoader from "@/components/atomics/PageLoader";
import { useRouteChange } from "@/hooks/useRouteChange";
import { useLogout } from "@/hooks/useLogout";
import { useJune } from "@/hooks/useJune";

interface Props {
  children: ReactNode;
  userInfo: UserInterFace | null;
}

interface AuthContextType {
  user?: UserInterFace | null;
  handleSignIn?: (data: FieldValues) => void;
  handleLogout?: () => void;
  fetchUserDetails?: (isCheckLocale?: boolean) => void;
  setToken?: (token: string) => void;
  token?: string | null;
  isApiCalled?: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
});

function AuthProvider({ children, userInfo }: Props) {
  const analytics = useJune();
  const { handleLogout } = useLogout();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInterFace | null>(userInfo);
  const { routeClicked } = useRouteChange();
  const [isApiCalled, setIsApiCalled] = useState(false);

  const showLoader = () => setIsApiCalled(true);
  const hideLoader = () => setIsApiCalled(false);

  useEffect(() => {
    eventEmitter.on("Network_Request_Started", showLoader);
    eventEmitter.on("Network_Request_Completed", hideLoader);
    eventEmitter.on("Unauthorized_Access", handleLogout);
    // fetchUserDetails()

    return () => {
      eventEmitter.off("Network_Request_Started", showLoader);
      eventEmitter.off("Network_Request_Completed", hideLoader);
      eventEmitter.off("Unauthorized_Access", handleLogout);
    };
  }, []);

  useEffect(() => {
    analytics && user && analytics?.identify(user.id, user);
  }, [analytics, user]);

  const fetchUserDetails = async () => {
    const userInfo = await fetchUserData();
    analytics?.track("fetchUserData");
    if (userInfo) {
      setUser(userInfo);
      analytics?.identify(userInfo.id, userInfo);
      return userInfo;
    }
  };

  const authContextValue: AuthContextType = {
    user,
    token,
    setToken,
    fetchUserDetails,
    isApiCalled
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
      {(isApiCalled || routeClicked) && <PageLoader />}
    </AuthContext.Provider>
  );
}

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
