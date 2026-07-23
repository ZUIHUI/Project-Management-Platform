import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getApiErrorMessage } from "../../shared/api/apiErrorPresentation.js";
import type { components } from "../../shared/api/schema";
import { createLatestRequestGuard } from "../../shared/latestRequestGuard.js";
import { dashboardService } from "./dashboardService";

type DashboardIssue = components["schemas"]["DashboardIssue"];
type DashboardResponse = components["schemas"]["DashboardResponse"];
type DashboardData = NonNullable<DashboardResponse["data"]>;

export type DashboardSnapshot = {
  totals: Record<string, number>;
  statusBreakdown: Array<{ statusId: string; statusName: string; count: number }>;
  openIssues: DashboardIssue[];
  overdueIssues: DashboardIssue[];
};

const normalizeDashboard = (data: DashboardData): DashboardSnapshot => ({
  totals: Object.fromEntries(
    Object.entries(data.totals ?? {}).map(([key, value]) => [key, Number(value) || 0]),
  ),
  statusBreakdown: (data.statusBreakdown ?? []).map((item) => ({
    statusId: item.statusId ?? "unknown",
    statusName: item.statusName?.trim() || item.statusId || "未知狀態",
    count: Number(item.count) || 0,
  })),
  openIssues: data.openIssues ?? [],
  overdueIssues: data.overdueIssues ?? [],
});

export const useDashboardWorkspace = () => {
  const [dashboard, setDashboard] = useState<DashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const requestGuardRef = useRef(createLatestRequestGuard());

  const loadDashboard = useCallback(async (background = false) => {
    const requestGuard = requestGuardRef.current;
    const requestScope = "dashboard";
    const request = requestGuard.begin(requestScope);
    if (background) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const response = await dashboardService.fetchDashboard();
      if (!requestGuard.isLatest(request, requestScope)) return false;
      const data = response.data?.data;
      if (!data) throw new Error("Dashboard response is empty");
      setDashboard(normalizeDashboard(data));
      setLastUpdatedAt(new Date());
      return true;
    } catch (loadError) {
      if (!requestGuard.isLatest(request, requestScope)) return false;
      setError(getApiErrorMessage(loadError, "無法載入儀表板資料，請稍後再試。"));
      return false;
    } finally {
      if (requestGuard.isLatest(request, requestScope)) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
    return () => requestGuardRef.current.invalidate();
  }, [loadDashboard]);

  const maxStatusCount = useMemo(
    () => Math.max(...(dashboard?.statusBreakdown ?? []).map((item) => item.count), 1),
    [dashboard],
  );

  return {
    dashboard,
    loading,
    refreshing,
    error,
    lastUpdatedAt,
    maxStatusCount,
    refresh: () => loadDashboard(true),
    retry: () => loadDashboard(false),
  };
};
