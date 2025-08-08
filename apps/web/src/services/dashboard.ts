import axiosInstance from "./axiosInstance";

// 取得儀錶板總覽資料
export const fetchDashboardData = () => axiosInstance.get("/dashboard");