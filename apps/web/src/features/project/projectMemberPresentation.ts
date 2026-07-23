import type { components } from "../../shared/api/schema";

type ProjectMember = components["schemas"]["ProjectMember"];

export type ProjectMemberPresentation = {
  userId: string;
  displayName: string;
  email: string;
  initial: string;
  hasReadableName: boolean;
};

export const presentProjectMember = (
  member: Pick<ProjectMember, "userId" | "name" | "email">,
): ProjectMemberPresentation => {
  const userId = member.userId?.trim() ?? "";
  const readableName = member.name?.trim() ?? "";
  const displayName = readableName || userId || "未知使用者";

  return {
    userId,
    displayName,
    email: member.email?.trim() ?? "",
    initial: displayName.slice(0, 1).toLocaleUpperCase("zh-TW"),
    hasReadableName: Boolean(readableName && readableName !== userId),
  };
};

export const buildProjectMemberLabelMap = (
  members: Array<Pick<ProjectMember, "userId" | "name" | "email">> = [],
) => new Map(members.map((member) => {
  const identity = presentProjectMember(member);
  return [identity.userId, identity.displayName];
}));
