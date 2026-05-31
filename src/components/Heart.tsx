"use client";

import { likeFeed, unLikeFeed } from "@/services/feed";
import { useState } from "react";
import { useJune } from "@/hooks/useJune";

type Props = {
  hasLiked: boolean;
  initLikes: number;
  postId: number;
};

const Heart = ({ hasLiked, initLikes, postId }: Props) => {
  const [liked, setLiked] = useState(hasLiked); //use post data to determine initial value
  const [likes, setLikes] = useState(initLikes);
  const analytics = useJune();

  const handleLike = () => {
    setLiked((prevLiked) => !prevLiked);
    if (liked) {
      setLikes((prevLikes) => prevLikes - 1);
      unLikeFeed(postId);
      analytics?.track(`unLikeFeed: ${postId}`);
    } else {
      setLikes((prevLikes) => prevLikes + 1);
      likeFeed(postId);
      analytics?.track(`likeFeed: ${postId}`);
    }
  };

  return (
    <div className="flex justify-between items-center pt-2">
      <div
        className="relative w-[35px] h-[35x] flex items-center gap-1"
        onClick={handleLike}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill={liked ? "red" : "#e5e7eb"}
          viewBox="0 0 24 24"
          width="100%"
          height="100%"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <p className="font-semibold">{likes}</p>
      </div>
    </div>
  );
};

export default Heart;
