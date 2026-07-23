import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { components } from "../../shared/api/schema";
import { getApiErrorMessage } from "../../shared/api/apiErrorPresentation.js";
import { createLatestRequestGuard } from "../../shared/latestRequestGuard.js";
import { issueService } from "../issue";
import { activityActorId, buildActivityActorOptions } from "./activityPresentation";

type ActivityLog = components["schemas"]["ActivityLog"];
export type ActivitySortOrder = "asc" | "desc";

export const useActivityWorkspace = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filterAction, setFilterAction] = useState("all");
  const [filterActor, setFilterActor] = useState("all");
  const [sortOrder, setSortOrder] = useState<ActivitySortOrder>("desc");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const requestGuardRef = useRef(createLatestRequestGuard());

  useEffect(() => () => {
    requestGuardRef.current.invalidate();
  }, []);

  const loadActivities = useCallback(async (background = false) => {
    const requestToken = requestGuardRef.current.begin("activity");
    if (background) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const response = await issueService.fetchActivityLogs();
      if (!requestGuardRef.current.isLatest(requestToken, "activity")) return;
      setActivities((response.data?.data ?? []) as ActivityLog[]);
    } catch (loadError) {
      if (!requestGuardRef.current.isLatest(requestToken, "activity")) return;
      if (!background) setActivities([]);
      setError(getApiErrorMessage(loadError, "無法載入活動紀錄。"));
    } finally {
      if (requestGuardRef.current.isLatest(requestToken, "activity")) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadActivities();
  }, [loadActivities]);

  const actors = useMemo(() => buildActivityActorOptions(activities), [activities]);
  const actionTypes = useMemo(
    () => [...new Set(activities.map((activity) => activity.action))].sort(),
    [activities],
  );
  const filteredActivities = useMemo(() => [...activities]
    .filter((activity) => filterAction === "all" || activity.action === filterAction)
    .filter((activity) => filterActor === "all" || activityActorId(activity) === filterActor)
    .sort((left, right) => {
      const difference = new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      return sortOrder === "desc" ? difference : -difference;
    }), [activities, filterAction, filterActor, sortOrder]);
  const createdCount = useMemo(
    () => activities.filter((activity) => activity.action === "issue.created").length,
    [activities],
  );
  const filtersActive = filterAction !== "all" || filterActor !== "all" || sortOrder !== "desc";

  const resetFilters = useCallback(() => {
    setFilterAction("all");
    setFilterActor("all");
    setSortOrder("desc");
  }, []);
  const refresh = useCallback(() => loadActivities(true), [loadActivities]);

  return {
    activities,
    filteredActivities,
    actors,
    actionTypes,
    createdCount,
    filterAction,
    setFilterAction,
    filterActor,
    setFilterActor,
    sortOrder,
    setSortOrder,
    filtersActive,
    resetFilters,
    loading,
    refreshing,
    error,
    refresh,
  };
};
