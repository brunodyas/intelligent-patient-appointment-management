import { useState } from "react";
import { signIn } from "../services/auth";
import { setCookie } from "nookies";
import { JWT } from "../constants/enums/enums";
import { Alert } from "@/interface/signIn";
import { SignInForm } from "@/types";
import { initializeAlert, initializeSignInForm } from "@/data";
import { useAuth } from "@/context/auth";
import { routes } from "@/constants/routes";
import { useRouter } from "next/navigation";
import { useRouteChange } from "./useRouteChange";
import { useJune } from "./useJune";

export const useSignIn = () => {
  const router = useRouter();
  const { setRouteClicked } = useRouteChange();

  const { setToken } = useAuth();

  const [formData, setFormData] = useState<SignInForm>(initializeSignInForm);
  const [isError, setIsError] = useState<boolean>(true);
  const [alert, setAlert] = useState<Alert>(initializeAlert);
  const [isLoading, setIsLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const analytics = useJune();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSignIn = (token: string, remember: boolean) => {
    const creationTime = new Date().toISOString();
    const cookieValue = JSON.stringify({ token, creationTime });
    setToken && setToken(token);
    const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 4;
    setCookie(null, JWT, cookieValue, {
      maxAge: maxAge,
      // maxAge: 30,
      path: "/",
      samesite: "strict",
      secure: process.env.NODE_ENV === 'production' // Secure cookie in production
    });
    setAlert({
      key: "sign-in-success",
      variant: "success",
      open: true,
      title: "Sign in successful",
      desc: "You have successfully signed in",
    });
    setIsError(false);
    router.push(routes.feed);
    setRouteClicked(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setIsLoading(true);
    try {
      const response = await signIn(formData, remember);
      analytics?.track("signIn");
      const { token } = response;

      if (token) {
        handleSignIn(token, remember);
      } else {
        throw new Error("Error signing in");
      }
    } catch (error: any) {
      setIsError(true);
      setAlert({
        key: "sign-in-error",
        variant: "error",
        open: true,
        title: error?.response?.data?.error,
        desc: "An error occurred while signing in",
      });
      console.error("Error signing in:", error);
    } finally {
      form.reset();
      setFormData(initializeSignInForm);
      setIsLoading(false);
    }
  };

  return {
    handleSubmit,
    handleChange,
    setAlert,
    setRemember,
    handleSignIn,
    remember,
    formData,
    isError,
    alert,
    isLoading,
  };
};
