import { useEffect, useMemo, useState } from "react";
import { notificationsService } from "../services/notifications";
import { safeStorage } from "../shared/storage";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const currentUser = useMemo(() => {
    const raw = safeStorage.get("pmp.currentUser");
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const loadNotifications = async () => {
    try {
      setError("");
      const response = await notificationsService.fetchNotifications(currentUser?.id);
      setNotifications(response.data?.data ?? []);
    } catch (loadError) {
      setError(loadError?.response?.data?.error?.message ?? "無法載入通知");
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (notificationId) => {
    try {
      await notificationsService.markAsRead(notificationId);
      await loadNotifications();
    } catch {
      setError("更新通知狀態失敗");
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;

    try {
      await notificationsService.createNotification({
        userId: currentUser?.id,
        type: "manual",
        message: message.trim(),
      });
      setMessage("");
      await loadNotifications();
    } catch {
      setError("建立通知失敗");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-sm text-gray-600">可查看通知、標示已讀，也可手動建立測試通知。</p>
      </div>

      {error ? <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

      <form className="flex gap-2" onSubmit={handleCreate}>
        <input
          className="flex-1 rounded border px-3 py-2"
          placeholder="輸入通知內容"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button className="rounded bg-blue-600 px-4 py-2 text-white" type="submit">新增</button>
      </form>

      <div className="space-y-2">
        {notifications.length === 0 ? <p className="text-sm text-gray-500">尚無通知</p> : null}
        {notifications.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded border px-3 py-2">
            <div>
              <p className="font-medium">{item.message ?? item.type}</p>
              <p className="text-xs text-gray-500">{item.createdAt}</p>
            </div>
            <button
              type="button"
              disabled={item.read}
              className="rounded border px-3 py-1 text-xs disabled:opacity-40"
              onClick={() => handleMarkRead(item.id)}
            >
              {item.read ? "已讀" : "標示已讀"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
