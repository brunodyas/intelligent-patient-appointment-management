import { useMemo } from "react";
import { routes } from "@/constants/routes";
import formatDate from "@/utils/formatDate";
import Heart from "./Heart";
import Tag from "./Tag";
import Route from "./atomics/Route";
import Image from "next/image";
import { FaUser } from "react-icons/fa";

type Props = {
  id: number;
  postId: number;
  username: string;
  content: string;
  initLikes: number;
  createdAt: string;
  franchiseName: string;
  hasLiked: boolean;
  photo?: string;
  tags: string;
  categories?: string;
  userPhoto?: string;
};

const Post = ({
  id,
  postId,
  username,
  content,
  initLikes,
  createdAt,
  franchiseName,
  hasLiked,
  photo,
  tags,
  categories,
  userPhoto,
}: Props) => {
  const dataTags = useMemo(() => {
    if (tags) {
      const dataObject = JSON.parse(tags);
      return Object.keys(dataObject).map((key) => ({
        label: key,
        color: dataObject[key],
      }));
    }
  }, [tags]);

  const dataCategories = useMemo(() => {
    if (categories) {
      const dataObject = JSON.parse(categories);
      return Object.keys(dataObject).map((key) => ({
        label: key,
        color: dataObject[key],
      }));
    }
  }, [categories]);

  const handleHeartClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.stopPropagation();
  };

  return (
    <div
      id={`post-${id}`}
      className="rounded-lg border mb-5 p-5 w-full hover:cursor-pointer hover:shadow-large transition-shadow duration-200 ease-in-out"
    >
      <Route route={`${routes.feed}/${postId}`} linkClassName="block">
        <div className="flex items-center">
          {userPhoto ? (
            <Image
              src={userPhoto}
              alt="Profile Picture"
              width={10}
              height={10}
              className="w-10 h-10 rounded-full mr-2 object-cover"
              unoptimized
            />
          ) : (
            <div className="w-10 h-10 object-cover rounded-full flex items-center justify-center bg-gray-200">
              <FaUser size="50%" color="#fff" />
            </div>
          )}
          <div className="p-2 rounded w-full">
            <span className="block text font-medium text-black">
              {username}
            </span>
            <span className="block text-xs text-gray-500">{franchiseName}</span>
          </div>
        </div>
        {photo && (
          <Image
            src={photo}
            alt="Feed photo"
            width={10}
            height={10}
            className="m-auto rounded-md w-3/4 object-cover"
            unoptimized
          />
        )}
      </Route>

      <Route
        route={`${routes.feed}/${postId}`}
        linkClassName="block text-base px-5 xl:px-[3.5rem]"
      >
        <p className="py-3 break-words font-semibold text-sm sm:text-md">{content}</p>
        <p className="mb-2 py-3 break-words text-sm sm:text-md">{content}</p>
      </Route>
      <div className="flex flex-wrap gap-1 py-2">
        {dataTags &&
          dataTags.map((item, index) => (
            <Tag key={index} label={item.label} color={item.color} />
          ))}
        {dataCategories &&
          dataCategories.map((item, index) => (
            <Tag key={index} label={item.label} color={item.color} />
          ))}
      </div>
      <div className="flex justify-between items-center border-t pt-2">
        <div onClick={handleHeartClick}>
          <Heart hasLiked={hasLiked} initLikes={initLikes} postId={postId} />
        </div>
        <div className="flex justify-end text-sm text-gray-500">
          {formatDate(createdAt)}
        </div>
      </div>
    </div>
  );
};

export default Post;
