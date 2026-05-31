export interface Notification {
    id: number;
    user: number;
    notification_type: string;
    content_type?: string | null;
    object_id?: number | null; 
    message: string;
    is_read: boolean;
    created_at: string;
    target_url?: string | null;
}

export interface NotificationResponse {
    results?: Notification[];
    count: number;
    previous?: number;
    next?: number;
}