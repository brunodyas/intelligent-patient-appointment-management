"use client";
import "../../../app/globals.css";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { routes } from "@/constants/routes";
import { useSignIn } from "@/hooks/useSignIn";
import { initializeAlert } from "@/data";
import { Alerts, Button, Checkbox, Input } from "../atomics";
import Spinner from "../atomics/Spinner";
import PageLoader from "../atomics/PageLoader";
import Route from "../atomics/Route";
import { useRouteChange } from "@/hooks/useRouteChange";
import AppleIcon from "@/assets/icons/AppleIcon";
import GoogleIcon from "@/assets/icons/GoogleIcon";
import Image from "next/image";
import { useAuth } from "@/context/auth";

const SignIn = () => {
  const {
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
  } = useSignIn();

  const { routeClicked } = useRouteChange();
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");
  const token = searchParams?.get("token");
  const router = useRouter();


  const [hasTriggeredAlert, setHasTriggeredAlert] = useState(false);

  const handleUrlParams = (state: string) => {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete(state);
      window.history.replaceState({}, '', newUrl.toString());
  }

  useEffect(() => {
    if(!hasTriggeredAlert){
      if (error === "OAuthFailed") {
        setAlert({
          open: true,
          variant: "error",
          title: "OAuth Sign-In Failed",
          desc: "There was an issue with your OAuth sign-in. Please try again.",
          key: "oauth-failed",
        });
      } else if(error?.includes("Apple")) {
        setAlert({
          open: true,
          variant: "error",
          title: "Apple Sign-In Failed",
          desc: error || "There was an issue with your Apple sign-in. Please try again.",
          key: "oauth-failed",
        });
      }
      
      handleUrlParams("error")
      setHasTriggeredAlert(true);
    }
  }, [error, hasTriggeredAlert, setAlert]);

  useMemo(()=>{
    if(token){
      handleSignIn(token, true);
      handleUrlParams("token")
    }
  },[token])

  const handleGoogleSignIn = () => {
    const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    }&redirect_uri=${encodeURIComponent(
      `${window.location.origin}/callback`
    )}&response_type=code&scope=email profile openid https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.send&access_type=offline&prompt=consent`;
  window.location.href = googleOAuthUrl;
  };

  const handleAppleSignIn = () => window.location.href = `${process.env.NEXT_PUBLIC_BE_URL}api/user/auth/apple/login/`;

  return (
    <section className="px-[5%]">
      <div className="relative flex min-h-svh flex-col items-stretch justify-center overflow-auto py-24 lg:py-20 ">
        <div className="absolute bottom-auto left-0 right-0 top-0 flex h-16 w-full items-center justify-between md:h-18">
          <a href="#">
            <Image
              src="/logo/bloomin-logo.webp"
              alt="Blomin Blinds Logo"
              width="250"
              height="50"
            />
          </a>
        </div>
        <div className="container max-w-sm">
          <div className="mb-6 text-center md:mb-8">
            <h1 className="mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
              Sign in
            </h1>
            <p className="md:text-md">Everything you need in one portal</p>
          </div>
          <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit} action="">
            <div className="grid w-full items-center">
              <Input
                type="email"
                id="email"
                variant="text"
                label="Email"
                placeholder="Enter email"
                handleChange={handleChange}
                value={formData.email}
                isRequired
              />
            </div>
            <div className="grid w-full items-center">
              <Input
                type="password"
                id="password"
                variant="text"
                label="Password"
                placeholder="Enter password"
                handleChange={handleChange}
                value={formData.password}
                isRequired
              />
            </div>
            <div className="grid-col-1 grid gap-4">
              <div className="flex justify-between items-center">
                <div className="flex justify-start cursor-pointer gap-2">
                  <Checkbox
                    active={remember}
                    setActive={() => {
                      setRemember(!remember);
                    }}
                  />
                  <p className="text-sm capitalize">Remember for 30 days</p>
                </div>
                <div>
                  <Route
                    route={routes.requestResetPassword}
                    linkClassName="text-primary-main font-medium ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
                  >
                    Forgot password
                  </Route>
                </div>
              </div>
              <Button
                variant="primary-bg"
                type="submit"
                className="border-none !h-12"
                disabled={isLoading}
              >
                {isLoading && <Spinner />}
                Sign in
              </Button>
              <Button
                variant="default-bg"
                className="border !border-gray-200 !h-12"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <GoogleIcon />
                Sign in with Google
              </Button>
              <Button
                variant="default-nude"
                className="!bg-black !text-white hover:!bg-gray-900 !h-12"
                onClick={handleAppleSignIn}
                disabled={isLoading}
              >
                <AppleIcon />
                Sign in with Apple
              </Button>
            </div>
          </form>
        </div>
      </div>
      {alert && (
        <Alerts
          key={alert.key}
          variant={alert.variant}
          open={alert.open}
          setOpen={() => setAlert(initializeAlert)}
          title={alert.title}
          desc={alert.desc}
        />
      )}
      {routeClicked && <PageLoader />}
    </section>
  );
};

export default SignIn;
