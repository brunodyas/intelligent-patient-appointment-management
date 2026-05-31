  import axios, { AxiosError, AxiosResponse } from "axios";
  import { cookies as nextCookies } from "next/headers";
  import { JWT } from "@/constants/enums/enums";

  const serverAxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  serverAxiosInstance.interceptors.request.use(
    (config) => {
      const cookieStore = nextCookies();
      const jwtCookie = cookieStore.get(JWT);

      if (jwtCookie && jwtCookie?.value && config?.headers) {
        const { token, franchise_token } = JSON.parse(jwtCookie?.value);

        if (config.url?.includes("v1") && franchise_token) {
          config.headers.Authorization = `token ${franchise_token}`;
        } else {
          config.headers.Authorization = `token ${token}`;
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  function handleSuccess(response: AxiosResponse) {
    return response;
  }

  const handleError = (error: AxiosError<{ message?: string }>) => {
    const status = error?.response?.status;

    const customError = {
      ...error,
      message: error?.response?.data?.message || "An error occurred",
      statusCode: status,
    };
    return Promise.reject(customError);
  };

  serverAxiosInstance.interceptors.response.use(handleSuccess, handleError);

  export default serverAxiosInstance;
