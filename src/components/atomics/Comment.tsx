import { CommentDetail } from "@/interface/feed";
import { getFranchise } from "@/utils/getFranchise";
import moment from "moment-timezone";
import Image from "next/image";
import { FaUser } from "react-icons/fa";

type Props = {
  commentData: CommentDetail;
  lastItem: boolean;
};

const Comment: React.FC<Props> = ({ commentData, lastItem }) => {
  const { franchise } = getFranchise();

  const convertToAgo = (timestamp: string) => {
    const timezone = franchise.franchise_timezone;
    const formattedTimestamp = moment.utc(timestamp).tz(timezone);
    return formattedTimestamp.fromNow();
  };

  return (
    <div className={`${lastItem && "border-b border-gray-300"} py-4`}>
      <div className="flex items-center">
        <div className="size-8 max-sm:size-7 object-cover rounded-full flex items-center justify-center bg-gray-200">
          {commentData?.user?.photo ? (
            <Image
              src={commentData?.user?.photo}
              width={10}
              height={10}
              alt={commentData?.user?.name}
              className="w-full h-full object-cover rounded-md gap-1"
              unoptimized
            />
          ) : (
            <FaUser size="50%" color="#fff" />
          )}
        </div>
        <div className="flex flex-col ml-2">
          <span className="font-bold">{commentData?.user?.name}</span>
          <span className="text-gray-500 text-xs">
            {convertToAgo(commentData?.createdAt)}
          </span>
        </div>
      </div>
      <div className="mt-2">
        <p className="text-sm whitespace-pre-line">{commentData?.comment}</p>
      </div>
    </div>
  );
};

export default Comment;
