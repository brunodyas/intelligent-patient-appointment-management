export interface CreatePostResponse {
  title: string;
  content: string;
  tags: string[];
  tag?: string[];
}

export interface Post {
  id: number;
  title: string;
  content: string;
  photo?: string;
  user: {
    id: number;
    name: string;
    email: string;
    photo: string;
    franchise: {
      id: number;
      franchise_name: string;
    };
  };
  createdAt: string;
  tags: string;
  tag_subcategories: string;
  like_count: number;
  has_liked: boolean;
}

export interface FeedResponse {
  count: number;
  results: Post[];
}

interface Franchise {
  id: number;
  franchise_name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  photo: string | null;
  franchise: Franchise;
}

export interface PostDetail {
  id: number;
  title: string;
  content: string;
  photo: string | null;
  user: User;
  createdAt: string;
  comments: any[];
  tags: string;
  tag_subcategories: string;
  likes: any[];
  like_count: number;
  has_liked: boolean;
}

export interface CommentDetail {
  comment: string;
  createdAt: string;
  feed: number;
  id: number;
  user: any;
}
