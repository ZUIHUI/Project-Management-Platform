type WorkflowStatusRecord = {
  id: string;
  order: number;
};

type WorkflowTransitionRecord = {
  fromStatusId: string;
  toStatusId: string;
};

export const buildWorkflowStatuses = <TStatus extends WorkflowStatusRecord>(
  statuses: TStatus[],
  transitions: WorkflowTransitionRecord[],
) => {
  const statusOrder = new Map(statuses.map((status) => [status.id, status.order]));
  const allowedByStatus = new Map<string, Set<string>>();

  transitions.forEach(({ fromStatusId, toStatusId }) => {
    if (!statusOrder.has(fromStatusId) || !statusOrder.has(toStatusId)) return;
    const targets = allowedByStatus.get(fromStatusId) ?? new Set<string>();
    targets.add(toStatusId);
    allowedByStatus.set(fromStatusId, targets);
  });

  return statuses.map((status) => ({
    ...status,
    allowedToIds: [...(allowedByStatus.get(status.id) ?? [])].sort((left, right) => (
      (statusOrder.get(left) ?? Number.MAX_SAFE_INTEGER)
      - (statusOrder.get(right) ?? Number.MAX_SAFE_INTEGER)
    )),
  }));
};
