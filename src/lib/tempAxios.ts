import type { AxiosError, AxiosResponse } from "axios";
import axios from "axios";
import type { GetServerSideProps } from "next";
import nookies, { parseCookies } from "nookies";
import { JWT } from "../constants/enums/enums";

type Props = { host: string | null };

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => ({
  props: { host: context.req.headers.host || null },
});

const AxiosGlobalConfig = () => {
  function handleSuccess(response: AxiosResponse) {
    console.log("Axios response:", response); // Add this line for debugging
    return response.data;
  }

  function handleError(error: AxiosError) {
    switch (error?.response?.status) {
      case 401:
        return error;
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

  // set cookies in header what getInfo() uses
  instance.interceptors.request.use((config) => {
    const cookies = parseCookies();
    const cookieValue = cookies[JWT];
    if (cookieValue && config.headers) {
      const { token } = JSON.parse(cookieValue);
      config.headers.Authorization = `token ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(handleSuccess, handleError);

  return instance;
};

const axiosInstance = AxiosGlobalConfig();
export default axiosInstance;
