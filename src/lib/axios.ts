import type { AxiosError, AxiosResponse } from "axios";
import axios from "axios";
import type { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { JWT } from "../constants/enums/enums";

import eventEmitter from "@/utils/eventEmitter";
type Props = { host: string | null };

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => ({
  props: { host: context.req.headers.host || null },
});

const AxiosGlobalConfig = () => {
  function handleSuccess(response: AxiosResponse) {
    eventEmitter.emit("Network_Request_Completed");
    return response.data;
  }

  function handleError(error: AxiosError) {
    eventEmitter.emit("Network_Request_Completed");
    switch (error?.response?.status) {
      case 401:
        eventEmitter.emit("Unauthorized_Access");
      default: {
        const responseData = error.response?.data as { message: string };
        const customError = {
          ...error,
          message: responseData?.message,
          statusCode: Number(error.response?.status),
        };
        return Promise.reject(customError);
      }
    }
  }

  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  function handleRequest(config: any) {
    const isGet = config.method?.includes("get");
    isGet && eventEmitter.emit("Network_Request_Started");
    const cookies = parseCookies();
    const cookieValue = cookies[JWT];
    if (cookieValue && config.headers) {
      const { token, franchise_token } = JSON.parse(cookieValue);
      if (config.url.includes("v1") && isGet && franchise_token) {
        config.headers.Authorization = `token ${franchise_token}`;
        config.headers.user = `token ${token}`;
      } else {
        config.headers.Authorization = `token ${token}`;
      } 
    } else if (!cookieValue){
      eventEmitter.emit("Unauthorized_Access");
    }

    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }

    return config;
  }

  instance.interceptors.request.use(handleRequest, (error) => {
    eventEmitter.emit("Network_Request_Completed");
    return Promise.reject(error);
  });

  instance.interceptors.response.use(handleSuccess, handleError);

  return instance;
};

const axiosInstance = AxiosGlobalConfig();
export default axiosInstance;