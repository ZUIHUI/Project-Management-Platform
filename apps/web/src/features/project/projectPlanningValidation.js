// @ts-check

export const SPRINT_END_DATE_ERROR = "結束日期必須晚於開始日期。";

/**
 * @param {string} startAt
 * @param {string} endAt
 */
export const getSprintEndDateError = (startAt, endAt) => (
  startAt && endAt && startAt >= endAt ? SPRINT_END_DATE_ERROR : ""
);
