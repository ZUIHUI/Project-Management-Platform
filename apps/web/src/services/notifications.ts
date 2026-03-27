import axiosInstance from "./axiosInstance";

export const notificationsService = {
  fetchNotifications(userId?: string) {
    return axiosInstance.get("/notifications", { params: userId ? { userId } : undefined });
  },

  markAsRead(notificationId: string) {
    return axiosInstance.patch(`/notifications/${notificationId}/read`);
  },

  createNotification(payload: { userId?: string; type?: string; message: string }) {
    return axiosInstance.post("/notifications", payload);
  },
};
