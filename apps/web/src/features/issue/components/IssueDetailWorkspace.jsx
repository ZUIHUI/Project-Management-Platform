import { useEffect, useState } from "react";
import { Clock3, ListChecks, MessageSquare } from "lucide-react";
import Modal from "../../../components/Modal";
import { Alert, Badge, Button, Card, CardHeader, EmptyState, FormField, LoadingState } from "../../../components/ui";
import { cn, inputClass } from "../../../components/ui/styles";
import { getProjectRoleLabel } from "../../project/components/teamRoles";
import { presentProjectMember } from "../../project/projectMemberPresentation";
import { getActivityActionLabel } from "../../activity/activityPresentation";
import {
  getIssuePriorityPresentation,
  getWorkflowStatusLabel,
  getWorkflowStatusTone,
} from "../workflowPresentation.js";

const formatDateTime = (value) => (
  value ? new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "時間未知"
);

const presentActorLabel = (name, id) => name === "System" ? "系統" : name ?? id ?? "系統";

const getMemberOptionLabel = (member) => {
  const identity = presentProjectMember(member);
  return [identity.displayName, identity.email, getProjectRoleLabel(member.role)].filter(Boolean).join(" · ");
};

function IssueDetailContent({
  issue,
  statuses,
  members,
  comments,
  activityLogs,
  canModify,
  loading,
  saving,
  error,
  notice,
  onAssign,
  onComment,
  onRetry,
}) {
  const [commentDraft, setCommentDraft] = useState("");

  useEffect(() => {
    setCommentDraft("");
  }, [issue?.id]);

  if (!issue) {
    return <EmptyState icon={ListChecks} title="尚未選擇 Issue" description="從清單或看板選擇一筆工作，詳細資訊會顯示在這裡。" />;
  }

  const priority = getIssuePriorityPresentation(issue.priority);
  const currentStatus = statuses.find((status) => status.id === issue.statusId);

  const submitComment = async (event) => {
    event.preventDefault();
    if (!commentDraft.trim() || saving) return;
    const created = await onComment(issue.id, commentDraft);
    if (created) setCommentDraft("");
  };

  return (
    <div className="space-y-6">
      {error ? (
        <Alert tone="error" title="Issue 操作未完成">
          {error}
          {onRetry ? <button type="button" className="ml-2 font-semibold underline" onClick={onRetry}>重試</button> : null}
        </Alert>
      ) : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}

      <section aria-labelledby={`issue-${issue.id}-title`}>
        <p className="font-mono text-xs font-medium text-muted">#{issue.number}</p>
        <h3 id={`issue-${issue.id}-title`} className="mt-1 text-lg font-semibold leading-7 text-ink">{issue.title}</h3>
        {issue.description ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-body">{issue.description}</p> : <p className="mt-2 text-sm text-muted">尚未提供描述。</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone={getWorkflowStatusTone(currentStatus ?? issue.statusId, statuses)}>{getWorkflowStatusLabel(currentStatus ?? issue.statusId)}</Badge>
          <Badge tone={priority.tone}>{priority.label}</Badge>
        </div>
      </section>

      <FormField label="指派成員" htmlFor={`issue-assignee-${issue.id}`}>
        <select
          id={`issue-assignee-${issue.id}`}
          className={inputClass}
          value={issue.assigneeId ?? ""}
          disabled={saving || !canModify}
          onChange={(event) => onAssign(issue.id, event.target.value)}
        >
          <option value="">未指派</option>
          {members.map((member) => <option key={member.userId} value={member.userId}>{getMemberOptionLabel(member)}</option>)}
        </select>
      </FormField>

      <section aria-labelledby={`issue-${issue.id}-comments`}>
        <div className="mb-3 flex items-center gap-2">
          <MessageSquare size={18} aria-hidden="true" />
          <h3 id={`issue-${issue.id}-comments`} className="font-semibold text-ink">留言</h3>
          <Badge>{comments.length}</Badge>
        </div>

        {canModify ? (
          <form className="space-y-2" onSubmit={submitComment}>
            <label htmlFor={`issue-comment-${issue.id}`} className="sr-only">新增留言</label>
            <textarea
              id={`issue-comment-${issue.id}`}
              className={cn(inputClass, "min-h-24 py-3 text-sm")}
              placeholder="輸入留言，可用 @name 提及成員"
              value={commentDraft}
              onChange={(event) => setCommentDraft(event.target.value)}
              disabled={saving}
            />
            <Button type="submit" size="sm" disabled={saving || !commentDraft.trim()}>
              {saving ? "處理中…" : "送出留言"}
            </Button>
          </form>
        ) : null}

        <div className="mt-4 max-h-56 space-y-2 overflow-auto pr-1" tabIndex="0" aria-label="Issue 留言紀錄">
          {comments.map((comment) => (
            <article key={comment.id} className="rounded-control bg-surface p-3">
              <p className="text-xs text-muted">
                {presentActorLabel(comment.authorName, comment.authorId)}
                {comment.authorEmail ? ` · ${comment.authorEmail}` : ""} · {formatDateTime(comment.createdAt)}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink">{comment.body}</p>
            </article>
          ))}
          {!comments.length && !loading ? <p className="text-sm text-muted">目前沒有留言。</p> : null}
        </div>
      </section>

      <section aria-labelledby={`issue-${issue.id}-activity`}>
        <div className="mb-3 flex items-center gap-2">
          <Clock3 size={18} aria-hidden="true" />
          <h3 id={`issue-${issue.id}-activity`} className="font-semibold text-ink">最近活動</h3>
        </div>
        <div className="max-h-56 space-y-3 overflow-auto pr-1" tabIndex="0" aria-label="Issue 最近活動">
          {activityLogs.map((log) => (
            <article key={log.id} className="border-l-2 border-line pl-3">
              <p className="text-xs text-muted">
                {presentActorLabel(log.actorName, log.actorId)}
                {log.actorEmail ? ` · ${log.actorEmail}` : ""} · {formatDateTime(log.createdAt)}
              </p>
              <p className="mt-1 text-sm text-ink">{getActivityActionLabel(log.action)}</p>
            </article>
          ))}
          {!activityLogs.length && !loading ? <p className="text-sm text-muted">目前沒有活動紀錄。</p> : null}
        </div>
      </section>

      {loading ? <LoadingState compact label="載入詳細資訊…" /> : null}
    </div>
  );
}

export default function IssueDetailWorkspace({ mode = "aside", isOpen, onClose, ...contentProps }) {
  const issue = contentProps.issue;

  if (mode === "dialog") {
    return (
      <Modal
        isOpen={Boolean(isOpen && issue)}
        onClose={onClose}
        title={issue ? `#${issue.number} ${issue.title}` : "Issue 詳細資訊"}
        description="指派、討論與最近活動"
        maxWidth="max-w-2xl"
      >
        <IssueDetailContent {...contentProps} />
      </Modal>
    );
  }

  return (
    <Card as="aside" aria-label="Issue 詳細資訊" className="h-fit xl:sticky xl:top-6">
      <CardHeader title="Issue 詳情" description="指派、討論與最近活動" />
      <div className={issue ? "p-5 sm:p-6" : ""}>
        <IssueDetailContent {...contentProps} />
      </div>
    </Card>
  );
}
