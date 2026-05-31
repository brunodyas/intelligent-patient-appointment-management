"use client";

import { markNotificationAsRead } from "@/services/notifications";
import {
  // Button,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@relume_io/relume-ui";
import { Fragment } from "react";
// import { FaUser } from "react-icons/fa";
// import Image from "next/image";
import { timeAgo } from "@/utils/timeAgo";
import { twMerge } from "tailwind-merge";
import Spinner from "../atomics/Spinner";
import { useJune } from "@/hooks/useJune";

const Notification = ({
  notifications,
  loading,
  lastNotificationRef,
  user,
  handleReadNotification,
}: any) => {
  const analytics = useJune();

  const handleNotificationClick = async (
    index: number,
    notificationId: number,
    targetUrl?: string
  ) => {
    try {
      await markNotificationAsRead(notificationId);
      analytics?.track("markNotificationAsRead");
      !notifications[index].is_read && handleReadNotification(index);
      if (targetUrl) {
        window.open(targetUrl, "_blank");
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <Fragment>
      <div className="flex flex-col py-1">
        <div className="h-full max-h-[40vh] overflow-auto px-1 py-0">
          {notifications && notifications.length === 0 ? (
            <div className="px-4 py-2">No new notifications</div>
          ) : (
            notifications.map((notification: any, index: any) => {
              const isLastItem = index === notifications.length - 1;
              const read = notification?.is_read;
              return (
                <>
                  <DropdownMenuItem
                    key={notification.id}
                    className={`m-0 grid grid-cols-[max-content_1fr] gap-2 px-2 py-2 hover:bg-neutral-101 items-start ${
                      !read && "bg-gray-100"
                    }`}
                    onClick={() =>
                      handleNotificationClick(
                        index,
                        notification.id,
                        notification.target_url || undefined
                      )
                    }
                    ref={isLastItem ? lastNotificationRef : null}
                  >
                    {/* Will be used in future */}
                    {/* <div className="relative size-11 max-sm:size-9 object-cover rounded-full flex items-center justify-center bg-gray-200">
                      {user?.photo ? (
                        <Image src={user.photo} height={44} width={44} alt="" />
                      ) : (
                        <FaUser size="50%" color="#fff" />
                      )}
                      <div
                        className={`absolute right-[-1px] bottom-[0] size-[14px] rounded-full bg-[#17B26A] border-2 border-white`}
                      />
                    </div> */}
                    <div />
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="capitalize font-medium">
                            {user.name}
                          </span>
                          <span className="text-sm text-gray-600">
                            {notification?.created_at &&
                              timeAgo(notification.created_at)}
                          </span>
                        </div>
                        <div
                          className={twMerge(
                            "size-2 max-sm:size-1 rounded-full bg-primary-main",
                            read && "hidden"
                          )}
                        />
                      </div>
                      <p className="leading-tight text-gray-600">
                        {notification.message
                          .split(":")
                          .map((part: string, index: number) =>
                            index % 2 === 1 ? (
                              <span
                                key={part}
                                className="font-medium text-primary-main"
                              >
                                {part}
                              </span>
                            ) : (
                              part
                            )
                          )}
                      </p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator
                    className={isLastItem ? "hidden" : "bg-gray-200 my-1 mx-0 "}
                  />
                </>
              );
            })
          )}
          {loading && <Spinner />}
        </div>
      </div>
    </Fragment>
  );
};

export default Notification;
