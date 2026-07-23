import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { projectService } from "../project";
import { dashboardService } from "../dashboard/dashboardService";
import { notificationsService } from "../../services/notifications";
import { getApiErrorMessage } from "../../shared/api/apiErrorPresentation.js";
import type { components } from "../../shared/api/schema";
import { createLatestRequestGuard } from "../../shared/latestRequestGuard.js";

type Issue = components["schemas"]["Issue"];
type Notification = components["schemas"]["Notification"];
type Project = components["schemas"]["Project"];

type HomeDashboard = {
  totals: Record<string, number>;
  openIssues: Issue[];
  overdueIssues: Issue[];
};

const priorityOrder: Record<Issue["priority"], number> = { high: 0, medium: 1, low: 2 };

const dueTime = (issue: Issue) => issue.dueAt ? new Date(issue.dueAt).getTime() : Number.POSITIVE_INFINITY;

const sortIssuesByAttention = (left: Issue, right: Issue) => {
  const dueDifference = dueTime(left) - dueTime(right);
  if (dueDifference !== 0) return dueDifference;
  const priorityDifference = priorityOrder[left.priority] - priorityOrder[right.priority];
  if (priorityDifference !== 0) return priorityDifference;
  return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
};

export const useHomeWorkspace = (userId?: string) => {
  const [dashboard, setDashboard] = useState<HomeDashboard | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [readingNotificationIds, setReadingNotificationIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const requestGuardRef = useRef(createLatestRequestGuard());
  const readingNotificationIdsRef = useRef(new Set<string>());
  const readOverridesRef = useRef(new Set<string>());

  useEffect(() => () => {
    requestGuardRef.current.invalidate();
  }, []);

  const loadWorkspace = useCallback(async () => {
    const requestToken = requestGuardRef.current.begin("home");
    setLoading(true);
    setError("");
    try {
      const [dashboardResponse, projectsResponse, notificationsResponse] = await Promise.all([
        dashboardService.fetchDashboard(),
        projectService.fetchProjects({ page: 1, pageSize: 100 }),
        notificationsService.fetchNotifications(),
      ]);
      if (!requestGuardRef.current.isLatest(requestToken, "home")) return;
      const dashboardData = dashboardResponse.data?.data;
      if (!dashboardData) throw new Error("Dashboard response is empty");

      setDashboard({
        totals: dashboardData.totals ?? {},
        openIssues: dashboardData.openIssues ?? [],
        overdueIssues: dashboardData.overdueIssues ?? [],
      });
      setProjects((projectsResponse.data?.data ?? []) as Project[]);
      setNotifications(((notificationsResponse.data?.data ?? []) as Notification[]).map((notification) => (
        readOverridesRef.current.has(notification.id) ? { ...notification, read: true } : notification
      )));
      setLastUpdatedAt(new Date());
    } catch (loadError) {
      if (!requestGuardRef.current.isLatest(requestToken, "home")) return;
      setDashboard(null);
      setProjects([]);
      setNotifications([]);
      setError(getApiErrorMessage(loadError, "無法載入今日工作摘要，請稍後再試。"));
    } finally {
      if (requestGuardRef.current.isLatest(requestToken, "home")) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const projectById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );
  const myIssues = useMemo(
    () => [...(dashboard?.openIssues ?? [])].filter((issue) => issue.assigneeId === userId).sort(sortIssuesByAttention),
    [dashboard, userId],
  );
  const riskIssues = useMemo(
    () => [...(dashboard?.overdueIssues ?? [])].sort(sortIssuesByAttention),
    [dashboard],
  );
  const myOverdueCount = useMemo(
    () => myIssues.filter((issue) => issue.dueAt && new Date(issue.dueAt).getTime() < Date.now()).length,
    [myIssues],
  );
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );
  const inboxNotifications = useMemo(
    () => [...notifications]
      .sort((left, right) => {
        if (left.read !== right.read) return left.read ? 1 : -1;
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      })
      .slice(0, 5),
    [notifications],
  );

  const markNotificationRead = useCallback(async (notificationId: string) => {
    const notification = notifications.find((item) => item.id === notificationId);
    if (!notification || notification.read) return true;
    if (readingNotificationIdsRef.current.has(notificationId)) return false;

    readingNotificationIdsRef.current.add(notificationId);
    setReadingNotificationIds((items) => [...items, notificationId]);
    setError("");
    setNotice("");
    try {
      await notificationsService.markAsRead(notificationId);
      readOverridesRef.current.add(notificationId);
      setNotifications((items) => items.map((item) => (
        item.id === notificationId ? { ...item, read: true } : item
      )));
      setNotice("通知已標示為已讀。");
      return true;
    } catch (markError) {
      setError(getApiErrorMessage(markError, "通知狀態更新失敗。"));
      return false;
    } finally {
      readingNotificationIdsRef.current.delete(notificationId);
      setReadingNotificationIds((items) => items.filter((item) => item !== notificationId));
    }
  }, [notifications]);

  return {
    dashboard,
    projects,
    projectById,
    notifications,
    myIssues,
    riskIssues,
    myOverdueCount,
    unreadCount,
    inboxNotifications,
    loading,
    readingNotificationIds,
    error,
    notice,
    lastUpdatedAt,
    refresh: loadWorkspace,
    markNotificationRead,
  };
};
