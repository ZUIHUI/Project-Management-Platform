import { apiClient, apiRequest } from "../../shared/api/client";

export const dashboardService = {
  fetchDashboard() {
    return apiRequest(apiClient.GET("/dashboard"));
  },
};
