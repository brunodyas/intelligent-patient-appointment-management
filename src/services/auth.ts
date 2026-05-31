// src/services/auth.ts
import axiosInstance from '@/lib/axios';
import { FieldValues } from 'react-hook-form';
import { FranchiseUserLoginResponse, UpdatePasswordResponse, UserForgotPasswordResponse, UserInterFace, UserLoginResponse } from '@/interface/user';
import { convertUtcToLocalTime } from '@/utils/utcToLocalTimeZone';

export const signIn = async (data: FieldValues, remember: boolean): Promise<UserLoginResponse> => {
  return await axiosInstance.post(`api/user/login/${remember ? '?remember_me=True' : ''}`, data);
};

export const signInByFranchise = async (data: FieldValues): Promise<FranchiseUserLoginResponse> => {
  return await axiosInstance.post(`api/user/franchise-login/`,data);
};

export const forgotPassword= async (data: FieldValues, baseUrl: string): Promise<UserForgotPasswordResponse> => {
  const encodedBaseUrl = encodeURIComponent(baseUrl);
  return await axiosInstance.post(`api/user/password-reset/?base_url=${encodedBaseUrl}`, data);
}
export const resetPassword = async (data: FieldValues): Promise<UpdatePasswordResponse> => {
  return await axiosInstance.post('api/user/reset-password-confirm/', data);
}
export const fetchUserData = async (): Promise<UserInterFace> => {
  const response: UserInterFace =  await axiosInstance.get('api/user/user-details/');
  return {
    ...response,
    shift_start_time: response?.shift_start_time ? convertUtcToLocalTime(response?.shift_start_time + " UTC") : null,
    shift_end_time: response?.shift_end_time ? convertUtcToLocalTime(response?.shift_end_time + " UTC") : null
  };
}

export const verifyOAuth = async (provider: string, payload: Object): Promise<UserLoginResponse> => {
  return await axiosInstance.post(`api/user/auth/${provider}/`, payload);
};

export const unlinkGoogleAccount = async (email: any): Promise<UserInterFace> => {
  return await axiosInstance.post(`api/user/auth/google/un-link/${email}/`);
};

// export const forgotPassword = async (
//   data: FieldValues
// ): Promise<UserForgotPasswordResponse> => {
//   return await axiosInstance.post(`${API_BASE_URL}/forgot-password`, data);
// };

// export const resetPassword = async (
//   data: FieldValues
// ): Promise<UpdatePasswordResponse> => {
//   return await axiosInstance.post(`${API_BASE_URL}/reset-password`, data);