import { FieldValues } from "react-hook-form";
import { size } from '@/constants/constants';
import {
  CreatePostResponse,
  FeedResponse,
  PostDetail,
} from "../interface/feed";
import axiosInstance from "../lib/axios";

export const createPost = async (
  data: FieldValues
): Promise<CreatePostResponse> => {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("content", data.content);
  formData.append("tag_subcategories", data.subcategories);
  data.tags.forEach((tag: string) => formData.append("tags[]", tag));

  if (data.image) {
    formData.append("photo", data.image);
  } else {
    console.warn("No photo provided");
  }

  return await axiosInstance.post("/api/feed/create-feed/", formData);
};

export const AddCommentPost = async (
  data: FieldValues,
  id: string
): Promise<CreatePostResponse> => {
  const formData = new FormData();
  formData.append("comment", data.comments);

  return await axiosInstance.post(`/api/feed/add-comment-to-feedID/${id}/`, formData);
};

export const getPosts = async (page: number, search?: string): Promise<FeedResponse> => {
  return await axiosInstance.get(`/api/feed/list-feed/?page=${page}&page_size=${size}${search && "&search="+search}`);
};

export const getPostById = async (id: string): Promise<PostDetail> => {
  return await axiosInstance.get(`api/feed/view-feed/${id}/`);
};

export const likeFeed = async (id: number) => {
  return await axiosInstance.post(`api/feed/like-feed/${id}/`);
};

export const unLikeFeed = async (id: number) => {
  return await axiosInstance.delete(`api/feed/unlike-feed/${id}/`);
};
