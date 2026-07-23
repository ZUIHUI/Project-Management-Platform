import { apiClient, apiRequest } from "../shared/api/client";

export const notificationsService = {
  fetchNotifications(_userId?: string) {
    return apiRequest(apiClient.GET("/notifications"));
  },

  markAsRead(notificationId: string) {
    return apiRequest(
      apiClient.PATCH("/notifications/{notificationId}/read", {
        params: { path: { notificationId } },
      }),
    );
  },

  createNotification(payload: { userId?: string; type?: string; message: string }) {
    return apiRequest(apiClient.POST("/notifications", { body: payload }));
  },
};
