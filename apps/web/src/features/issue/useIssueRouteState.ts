import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  buildIssueViewHref,
  ISSUE_QUERY_KEY,
  isIssueCollectionPending,
  resolveLinkedIssueState,
  withIssueSelection,
} from "./issueRouteState.js";

type IssueSummary = { id: string };

type Options = {
  projectId: string;
  issues: IssueSummary[];
  issuesLoading: boolean;
  issuesResolvedProjectId: string;
  selectedIssueId: string;
  setSelectedIssueId: (issueId: string) => void;
  clearDetailFeedback: () => void;
  isDesktopDetail: boolean;
  viewMode: "list" | "board";
};

export const useIssueRouteState = ({
  projectId,
  issues,
  issuesLoading,
  issuesResolvedProjectId,
  selectedIssueId,
  setSelectedIssueId,
  clearDetailFeedback,
  isDesktopDetail,
  viewMode,
}: Options) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [detailOpen, setDetailOpen] = useState(false);
  const [routeNotice, setRouteNotice] = useState("");
  const linkedIssueId = searchParams.get(ISSUE_QUERY_KEY) ?? "";
  const issuesPending = isIssueCollectionPending(projectId, issuesResolvedProjectId, issuesLoading);
  const linkedIssueState = resolveLinkedIssueState(linkedIssueId, issues, issuesPending);

  useEffect(() => {
    setDetailOpen(false);
    setRouteNotice("");
  }, [projectId]);

  useEffect(() => {
    if (isDesktopDetail) setDetailOpen(false);
  }, [isDesktopDetail]);

  useEffect(() => {
    if (linkedIssueState === "none" || linkedIssueState === "pending") return;

    if (linkedIssueState === "invalid") {
      setRouteNotice("連結中的 Issue 已不存在或不屬於此專案，已改為顯示目前可用的工作。");
      setSearchParams((current) => withIssueSelection(current, ""), { replace: true });
      setDetailOpen(false);
      return;
    }

    setRouteNotice("");
    if (selectedIssueId !== linkedIssueId) {
      setSelectedIssueId(linkedIssueId);
      clearDetailFeedback();
    }
    if (!isDesktopDetail) setDetailOpen(true);
  }, [
    clearDetailFeedback,
    isDesktopDetail,
    linkedIssueId,
    linkedIssueState,
    selectedIssueId,
    setSearchParams,
    setSelectedIssueId,
  ]);

  const selectIssue = useCallback((issueId: string) => {
    setSelectedIssueId(issueId);
    clearDetailFeedback();
    setRouteNotice("");
    setSearchParams((current) => withIssueSelection(current, issueId), { replace: true });
    if (!isDesktopDetail) setDetailOpen(true);
  }, [clearDetailFeedback, isDesktopDetail, setSearchParams, setSelectedIssueId]);

  const closeDetail = useCallback(() => {
    setDetailOpen(false);
    setSearchParams((current) => withIssueSelection(current, ""), { replace: true });
  }, [setSearchParams]);

  const changeProject = useCallback((nextProjectId: string) => {
    if (!nextProjectId) return;
    navigate(buildIssueViewHref(nextProjectId, viewMode, ""));
  }, [navigate, viewMode]);

  const viewHrefs = useMemo(() => ({
    list: buildIssueViewHref(projectId, "list", selectedIssueId),
    board: buildIssueViewHref(projectId, "board", selectedIssueId),
  }), [projectId, selectedIssueId]);

  return {
    linkedIssueId,
    routeNotice,
    detailOpen,
    selectIssue,
    closeDetail,
    changeProject,
    listHref: viewHrefs.list,
    boardHref: viewHrefs.board,
  };
};
