"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import moment from "moment";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@relume_io/relume-ui";
import Heart from "@/components/Heart";
import Tag from "@/components/Tag";
import { PostDetail, CommentDetail } from "@/interface/feed";
import { AddCommentPost, getPostById } from "@/services/feed";
import formatDate from "@/utils/formatDate";
import { Button, Input, Comment } from "@/components/atomics";
import { routes } from "@/constants/routes";
import Route from "@/components/atomics/Route";
import { useAuth } from "@/context/auth";
import Image from "next/image";
import { FaUser } from "react-icons/fa";
import { getFranchise } from "@/utils/getFranchise";
import { useJune } from "@/hooks/useJune";

const PostDetails = () => {
  const { franchise } = getFranchise();
  const { postId } = useParams<{ postId: string }>() ?? {postId: ''};
  const [postDetail, setPostDetail] = useState<PostDetail>();
  const { user } = useAuth();
  const [comments, setComments] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [commentPost, setCommentPost] = useState<CommentDetail[]>([]);
  const analytics = useJune();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getPostById(postId);
        analytics?.track("getPostById");
        setPostDetail(response);
        setCommentPost(response?.comments);
      } catch (e) {
        throw e;
      }
    };
    fetchData();
  }, [postId]);

  const tags = useMemo(() => {
    if (postDetail) {
      const dataObject = JSON.parse(postDetail?.tags);
      return Object.keys(dataObject).map((key) => ({
        label: key,
        color: dataObject[key],
      }));
    }
  }, [postDetail]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target;
    setComments(value);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const response = await AddCommentPost({ comments: comments }, postId);
      analytics?.track("AddCommentPost");
      if (response) {
        setCommentPost([
          {
            comment: comments,
            createdAt: moment()
              .tz(franchise.franchise_timezone)
              .format("YYYY-MM-DDTHH:mm:ss.SSSSSSZ"),
            feed: Number(postId),
            user: user,
            id: commentPost.length,
          },
          ...commentPost,
        ]);
        setComments("");
      }
    } catch (e) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {postDetail && (
        <div className="p-5 max-w-4xl mx-auto shadow-lg rounded-lg bg-white">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <Route
                  route={routes.feed}
                  linkClassName="text-primary-main font-medium hover:cursor-pointer"
                >
                  Feed
                </Route>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-primary-main" />
              <BreadcrumbItem>
                <BreadcrumbLink className="text-primary-main font-semibold cursor-auto">
                  {postDetail.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex justify-end">
            <Button size="md" variant="primary-bg" className="!h-10">
              <Route route={routes.feed} linkClassName="">
                Back
              </Route>
            </Button>
          </div>
          <div className="flex items-center mb-1">
            {postDetail?.user?.photo ? (
              <Image
                src={postDetail.user.photo}
                width={10}
                height={10}
                alt="Profile Picture"
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
                {postDetail.user.name}
              </span>
              <span className="block text-xs text-gray-500">
                {postDetail.user.franchise.franchise_name}
              </span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row">
            {postDetail?.photo && (
              <Image
                src={postDetail.photo}
                alt="Feed photo"
                width={10}
                height={10}
                className="m-auto rounded-md w-3/4 max-h-[400px] object-cover"
                unoptimized
              />
            )}
            <div className="md:w-1/2 md:pl-4">
              <h2 className="text-md font-bold mt-2 md:mt-0">
                {postDetail.title}
              </h2>
              <p className="text-gray-700 text-sm">{postDetail.content}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 py-2">
            {tags &&
              tags.map((item, index) => (
                <Tag key={index} label={item.label} color={item.color} />
              ))}
          </div>
          <div className="flex justify-between items-center border-t pt-2 mt-2">
            <Heart
              hasLiked={postDetail.has_liked}
              initLikes={postDetail.like_count}
              postId={Number(postId)}
            />
            <div className="flex justify-end text-sm text-gray-500">
              {formatDate(postDetail.createdAt)}
            </div>
          </div>
          <div className="flex flex-col md:flex-row mt-5">
            <Input
              type="textarea"
              disabled={isLoading}
              autoComplete="off"
              userPhoto={user?.photo || ""}
              className="text-base"
              id="comments"
              variant="comments"
              label="Comments"
              value={comments}
              placeholder="Write something..."
              handleTextAreaChange={handleChange}
              handleSubmit={handleSubmit}
            />
          </div>
          <div className="w-full min-h-[400px]">
            {commentPost.length > 0 ? (
              commentPost.map((item, index) => (
                <Comment
                  key={index}
                  commentData={item}
                  lastItem={commentPost.length !== index + 1}
                />
              ))
            ) : (
              <div className="text-center h-full text-gray-500 flex-col items-center justify-center">
                <Image
                  src="/image/comments-empty.png"
                  alt="Feed photo"
                  width={10}
                  height={10}
                  className="max-w-[192px] max-h-[112px] mx-auto lg:mt-32 mt-5 object-cover"
                  unoptimized
                />
                <p className="my-4">Nothing yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PostDetails;
