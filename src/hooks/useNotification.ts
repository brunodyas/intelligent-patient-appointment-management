import { useState, useEffect, useCallback } from "react";
import { fetchNotifications } from "@/services/notifications";
import { Notification as NotificationType } from "@/interface/notification";
import useWebSocket from "@/utils/websocket";
import getWebSocketUrl from "@/utils/getWebSocketUrl";
import { useJune } from "@/hooks/useJune";

const useNotificationWebSocket = (isAuthenticated: boolean) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isAllNotificationRead, setIsAllNotificationRead] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); // To track if more data is available
  const [loading, setLoading] = useState(false);
  const analytics = useJune();

  const loadNotifications = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetchNotifications(page);
      analytics?.track("fetchNotifications");
      const newNotifications = response?.results || [];
      setNotifications((prev) => [...prev, ...newNotifications]);
      handleAllNotificationRead([...newNotifications]);
      setHasMore(!!response.next); // If there's a next page, keep loading
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications(page);
    }
  }, [isAuthenticated, page]);

  const handleAllNotificationRead = (notifications: NotificationType[]) => {
    setIsAllNotificationRead(
      notifications.every(
        (notification) => notification && notification?.is_read
      )
    );
  };

  const showPushNotification = (notification: NotificationType) => {
    if (Notification.permission === "granted" ) {
      const options = {
        body: notification.message, 
        icon: "/logo/bloomin_logo_180.png",
        tag: notification.id.toString(), 
        data: {
          url: `${window.location.origin}${notification.target_url}`
        }
      };
  
      const notificationInstance = new Notification("Notification From Bloomin' Blinds", options);
      console.log(Notification)
      notificationInstance.onclick = (event) => {
        event.preventDefault();
        if (options.data.url) {
          window.open(options.data.url, '_blank');
        }
      };
    }
  };
  

  const handleNewNotification = (data: NotificationType) => {
    setNotifications((prevNotifications) => [data, ...prevNotifications]);
    setIsAllNotificationRead(false);
    if (Notification.permission === "granted") {
      showPushNotification(data);
    } else if (Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          showPushNotification(data);
        }
      });
    }
  };

  const handleReadNotification = (index: number) => {
    const shallowNotifications = [...notifications];
    shallowNotifications[index].is_read = true;
    setNotifications(shallowNotifications);
    handleAllNotificationRead(shallowNotifications);
  };

  const backendUrl = process.env.NEXT_PUBLIC_BE_URL;
  const wsUrl = backendUrl ? getWebSocketUrl(backendUrl) : "";

  const { send } = useWebSocket(
    `${wsUrl}/ws/notifications/`,
    handleNewNotification,
    isAuthenticated
  );

  const loadMoreNotifications = useCallback(() => {
    if (hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [hasMore, loading]);

  return {
    isAllNotificationRead,
    notifications,
    loadMoreNotifications,
    hasMore,
    loading,
    handleReadNotification,
  };
};

export default useNotificationWebSocket;
