import axiosInstance from '../lib/axios';
import { Notification, NotificationResponse } from '@/interface/notification';

export const fetchNotifications = async (page: number = 1): Promise<NotificationResponse> => {
    return await axiosInstance.get(`/api/notification/list/?page=${page}`);
};

export const markNotificationAsRead = async (notificationId: number): Promise<Notification> => {
    return await axiosInstance.patch(`/api/notification/mark-as-read/${notificationId}/`);
};
