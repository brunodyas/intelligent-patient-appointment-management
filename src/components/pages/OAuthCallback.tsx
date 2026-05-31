"use client";
import React, { useLayoutEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setCookie } from "nookies";
import { JWT } from "@/constants/enums/enums";
import { routes } from "@/constants/routes";
import { verifyOAuth } from "@/services/auth";
import { LoadingIcon } from "@/assets/icons";
import { useJune } from "@/hooks/useJune";
import PageLoader from "../atomics/PageLoader";

const OAuthCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const analytics = useJune();

  const handleOAuth = async (provider: string, payload: Object) => {
    try {
      const response = await verifyOAuth(provider, payload);
      analytics?.track("verifyOAuth");
      const { token: jwtToken } = response;

      if (!jwtToken) throw new Error(`Failed to sign in with ${provider}`);

      const creationTime = new Date().toISOString();
      const cookieValue = JSON.stringify({ token: jwtToken, creationTime });

      setCookie(null, JWT, cookieValue, {
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
        samesite: "strict",
      });

      router.push(routes.feed);
    } catch (error) {
      console.error("OAuthCallback Error:", error);
      router.push("/sign-in?error=OAuthFailed");
    }
  };

  useLayoutEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const idToken = searchParams?.get("code");
    const state = searchParams?.get('state');
    const stateData = state ? JSON.parse(decodeURIComponent(state)) : null;
    const email = stateData?.email || null;

    console.log("OAuth Callback started", email);
    const provider = "google";

    const token = accessToken || idToken;
    const payload: any = {
      token: token,
    };

    if(email){
      payload['email'] = email;
    }


    if (token) {
      if (idToken) {
        handleOAuth(provider, payload);
      } else {
        console.log("Missing provider or token, redirecting to sign-in page...");
        router.push("/sign-in?error=OAuthFailed");
      }
    }
  }, [router, searchParams, analytics]);

  return <PageLoader />;
};

export default OAuthCallback;
