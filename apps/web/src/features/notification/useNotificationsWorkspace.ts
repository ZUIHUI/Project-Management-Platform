import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getApiErrorMessage } from "../../shared/api/apiErrorPresentation.js";
import type { components } from "../../shared/api/schema";
import { createLatestRequestGuard } from "../../shared/latestRequestGuard.js";
import { notificationsService } from "../../services/notifications";

type Notification = components["schemas"]["Notification"];
export type NotificationFilter = "all" | "unread";

export const useNotificationsWorkspace = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [readingIds, setReadingIds] = useState<string[]>([]);
  const [createSaving, setCreateSaving] = useState(false);
  const [error, setError] = useState("");
  const [createError, setCreateError] = useState("");
  const [notice, setNotice] = useState("");
  const requestGuardRef = useRef(createLatestRequestGuard());
  const readingIdsRef = useRef(new Set<string>());
  const readOverridesRef = useRef(new Set<string>());

  useEffect(() => () => {
    requestGuardRef.current.invalidate();
  }, []);

  const loadNotifications = useCallback(async (background = false) => {
    const requestToken = requestGuardRef.current.begin("notifications");
    if (background) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const response = await notificationsService.fetchNotifications();
      const data = (response.data?.data ?? []) as Notification[];
      if (!requestGuardRef.current.isLatest(requestToken, "notifications")) return;
      setNotifications(data.map((notification) => (
        readOverridesRef.current.has(notification.id) ? { ...notification, read: true } : notification
      )).sort((left, right) => (
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      )));
    } catch (loadError) {
      if (!requestGuardRef.current.isLatest(requestToken, "notifications")) return;
      if (!background) setNotifications([]);
      setError(getApiErrorMessage(loadError, "無法載入通知，請稍後再試。"));
    } finally {
      if (requestGuardRef.current.isLatest(requestToken, "notifications")) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );
  const visibleNotifications = useMemo(
    () => filter === "unread" ? notifications.filter((notification) => !notification.read) : notifications,
    [filter, notifications],
  );

  const markRead = useCallback(async (notificationId: string) => {
    const notification = notifications.find((item) => item.id === notificationId);
    if (!notification || notification.read) return true;
    if (readingIdsRef.current.has(notificationId)) return false;
    readingIdsRef.current.add(notificationId);
    setReadingIds((items) => [...items, notificationId]);
    setError("");
    setNotice("");
    try {
      await notificationsService.markAsRead(notificationId);
      readOverridesRef.current.add(notificationId);
      setNotifications((items) => items.map((item) => (
        item.id === notificationId ? { ...item, read: true } : item
      )));
      setNotice("已將通知標示為已讀。");
      return true;
    } catch (markError) {
      setError(getApiErrorMessage(markError, "更新通知狀態失敗。"));
      return false;
    } finally {
      readingIdsRef.current.delete(notificationId);
      setReadingIds((items) => items.filter((item) => item !== notificationId));
    }
  }, [notifications]);

  const createReminder = useCallback(async (message: string) => {
    if (!message.trim()) return false;
    setCreateSaving(true);
    setCreateError("");
    setNotice("");
    try {
      const response = await notificationsService.createNotification({ type: "manual", message: message.trim() });
      const created = response.data?.data as Notification | undefined;
      if (!created) throw new Error("提醒已建立，但伺服器未回傳通知資料。請重新整理確認結果。");
      setNotifications((items) => [created, ...items.filter((item) => item.id !== created.id)]);
      setNotice("自用提醒已建立。");
      setFilter("all");
      return true;
    } catch (creationError) {
      setCreateError(getApiErrorMessage(creationError, "建立提醒失敗。"));
      return false;
    } finally {
      setCreateSaving(false);
    }
  }, []);

  const refresh = useCallback(() => loadNotifications(true), [loadNotifications]);
  const clearCreateError = useCallback(() => setCreateError(""), []);

  return {
    notifications,
    visibleNotifications,
    unreadCount,
    filter,
    setFilter,
    loading,
    refreshing,
    readingIds,
    createSaving,
    error,
    createError,
    notice,
    refresh,
    clearCreateError,
    markRead,
    createReminder,
  };
};
