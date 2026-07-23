// @ts-check

/**
 * Creates a stable request scope for a project's planning collection.
 * JSON encoding keeps project IDs and planning kinds unambiguous.
 *
 * @param {string} projectId
 * @param {"milestone" | "sprint"} kind
 */
export const buildProjectPlanningScope = (projectId, kind) => JSON.stringify([projectId, kind]);
