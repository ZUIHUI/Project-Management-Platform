type MentionableProjectMember = {
  id: string;
  name: string;
};

type MentionValidationResult =
  | { ids: string[] }
  | { error: string; status: 422 };

const escapeRegularExpression = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const hasInlineMention = (body: string, name: string) => {
  const normalizedName = name.trim();
  if (!normalizedName) return false;
  const pattern = new RegExp(
    `(^|[^\\p{L}\\p{N}_])@${escapeRegularExpression(normalizedName)}(?=$|[^\\p{L}\\p{N}_])`,
    "iu",
  );
  return pattern.test(body);
};

export const findMentionedMemberIds = (
  body: string,
  projectMembers: MentionableProjectMember[],
) => (
  [...new Set(
    projectMembers
      .filter((member) => hasInlineMention(body, member.name))
      .map((member) => member.id),
  )]
);

export const validateExplicitMentionIds = (
  value: unknown,
  projectMemberIds: Set<string>,
): MentionValidationResult => {
  if (value === undefined) return { ids: [] as string[] };
  if (!Array.isArray(value)) {
    return { error: "mentionedUserIds must be an array", status: 422 as const };
  }

  if (value.some((item) => typeof item !== "string" || !item.trim())) {
    return { error: "mentionedUserIds must contain non-empty strings", status: 422 as const };
  }
  if (value.length > 20) {
    return { error: "mentionedUserIds cannot contain more than 20 users", status: 422 as const };
  }
  const ids = [...new Set(value.map((item) => `${item}`.trim()))];
  if (ids.length !== value.length) {
    return { error: "mentionedUserIds cannot contain duplicate users", status: 422 as const };
  }
  if (ids.some((id) => !projectMemberIds.has(id))) {
    return { error: "mentioned users must belong to the project", status: 422 as const };
  }

  return { ids };
};
