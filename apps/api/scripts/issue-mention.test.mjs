import assert from "node:assert/strict";
import test from "node:test";
import {
  findMentionedMemberIds,
  validateExplicitMentionIds,
} from "../src/application/issue/issueMention.ts";

const projectMembers = [
  { id: "user-zh", name: "王小明" },
  { id: "user-space", name: "QA Lead" },
  { id: "user-ann", name: "Ann" },
  { id: "user-anna", name: "Anna" },
];

test("recognizes Unicode and spaced project-member names without substring collisions", () => {
  assert.deepEqual(
    findMentionedMemberIds("請 @王小明 和 @QA Lead 確認，@Anna 稍後覆核。", projectMembers),
    ["user-zh", "user-space", "user-anna"],
  );
});

test("only resolves names from the supplied project scope", () => {
  assert.deepEqual(
    findMentionedMemberIds("@External User 請協助，@王小明 請留意。", projectMembers),
    ["user-zh"],
  );
});

test("validates explicit mention recipients against project membership", () => {
  const memberIds = new Set(projectMembers.map((member) => member.id));
  assert.deepEqual(validateExplicitMentionIds(["user-zh"], memberIds), {
    ids: ["user-zh"],
  });
  assert.deepEqual(validateExplicitMentionIds(["user-zh", "user-zh"], memberIds), {
    error: "mentionedUserIds cannot contain duplicate users",
    status: 422,
  });
  assert.deepEqual(validateExplicitMentionIds(["user-external"], memberIds), {
    error: "mentioned users must belong to the project",
    status: 422,
  });
  assert.deepEqual(validateExplicitMentionIds("user-zh", memberIds), {
    error: "mentionedUserIds must be an array",
    status: 422,
  });
});
