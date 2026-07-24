import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { startTestServer, stopTestServer, testPort } from './test-server.mjs';

let baseUrl;

const login = async (email, password) => {
  const res = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  return body.accessToken;
};

const authHeaders = (token) => ({ Authorization: `Bearer ${token}`, 'content-type': 'application/json' });

const readNotificationPayload = (notification) => {
  if (notification?.payload && typeof notification.payload === 'object') return notification.payload;
  const source = notification?.payload ?? notification?.message;
  if (typeof source !== 'string') return {};
  try {
    const parsed = JSON.parse(source);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const run = async () => {
  const server = await startTestServer(testPort('INTEGRATION_TEST_PORT', 3102));
  baseUrl = server.baseUrl;
  try {
    const pmToken = await login('pm@example.com', 'password');
    const pmHeaders = authHeaders(pmToken);

    // auth integration
    const meRes = await fetch(`${baseUrl}/me`, { headers: { Authorization: `Bearer ${pmToken}` } });
    assert.equal(meRes.status, 200);

    const projectIdentityRes = await fetch(`${baseUrl}/projects/proj-1`, { headers: pmHeaders });
    assert.equal(projectIdentityRes.status, 200);
    const projectIdentity = (await projectIdentityRes.json()).data;
    const projectAdminMember = projectIdentity.members.find((member) => member.userId === 'user-pm');
    assert.ok(projectAdminMember, 'project response should include the authenticated project member');
    assert.equal(projectAdminMember.name, 'PM');
    assert.equal(projectAdminMember.email, 'pm@example.com');

    // project scope integration: outsider must be forbidden
    const outsiderEmail = `scope-outsider_${randomUUID()}@example.com`;
    const registerRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Scope Outsider',
        email: outsiderEmail,
        password: 'Password1',
        role: 'owner',
      }),
    });
    assert.equal(registerRes.status, 201);
    const outsider = await registerRes.json();
    assert.equal(outsider.user.role, 'project_admin', 'public registration must ignore caller-provided roles');
    const outsiderHeaders = authHeaders(outsider.accessToken);

    const forbiddenRes = await fetch(`${baseUrl}/projects/proj-1`, { headers: outsiderHeaders });
    assert.equal(forbiddenRes.status, 403);

    const spoofedRoleRes = await fetch(`${baseUrl}/projects/proj-1`, {
      headers: { ...outsiderHeaders, 'x-role': 'owner' },
    });
    assert.equal(spoofedRoleRes.status, 403, 'x-role must not elevate an authenticated user');

    const headerOnlyRes = await fetch(`${baseUrl}/projects/proj-1`, { headers: { 'x-role': 'owner' } });
    assert.equal(headerOnlyRes.status, 401, 'x-role must not replace authentication');

    const outsiderProjectsRes = await fetch(`${baseUrl}/projects`, { headers: outsiderHeaders });
    assert.equal(outsiderProjectsRes.status, 200);
    const outsiderProjects = await outsiderProjectsRes.json();
    assert.deepEqual(outsiderProjects.data, []);
    assert.equal(outsiderProjects.meta.total, 0);

    const forbiddenCandidatesRes = await fetch(`${baseUrl}/projects/proj-1/member-candidates`, {
      headers: outsiderHeaders,
    });
    assert.equal(forbiddenCandidatesRes.status, 403, 'only project administrators may search member candidates');

    const candidateSearchRes = await fetch(
      `${baseUrl}/projects/proj-1/member-candidates?q=${encodeURIComponent(outsiderEmail.toUpperCase())}`,
      { headers: pmHeaders },
    );
    assert.equal(candidateSearchRes.status, 200);
    const candidateSearch = (await candidateSearchRes.json()).data;
    assert.equal(candidateSearch.some((candidate) => candidate.id === outsider.user.id), true);
    assert.equal(candidateSearch.some((candidate) => candidate.id === 'user-pm'), false, 'existing members must be excluded');

    const outsiderDashboardRes = await fetch(`${baseUrl}/dashboard`, { headers: outsiderHeaders });
    assert.equal(outsiderDashboardRes.status, 200);
    const outsiderDashboard = (await outsiderDashboardRes.json()).data;
    assert.equal(outsiderDashboard.totals.projects, 0);
    assert.equal(outsiderDashboard.totals.issues, 0);
    assert.equal(outsiderDashboard.totals.comments, 0);
    assert.equal(outsiderDashboard.totals.notifications, 0);

    const outsiderActivityRes = await fetch(`${baseUrl}/activity-logs`, { headers: outsiderHeaders });
    assert.equal(outsiderActivityRes.status, 200);
    assert.deepEqual((await outsiderActivityRes.json()).data, []);

    // notification ownership integration
    const notificationRes = await fetch(`${baseUrl}/notifications`, {
      method: 'POST',
      headers: pmHeaders,
      body: JSON.stringify({ message: `Private notification ${Date.now()}` }),
    });
    assert.equal(notificationRes.status, 201);
    const privateNotification = (await notificationRes.json()).data;

    const pmNotificationsRes = await fetch(`${baseUrl}/notifications`, { headers: pmHeaders });
    assert.equal(pmNotificationsRes.status, 200);
    const pmNotifications = (await pmNotificationsRes.json()).data;
    const pmDashboardRes = await fetch(`${baseUrl}/dashboard`, { headers: pmHeaders });
    assert.equal(pmDashboardRes.status, 200);
    const pmDashboard = (await pmDashboardRes.json()).data;
    assert.equal(
      pmDashboard.totals.notifications,
      pmNotifications.filter((notification) => !notification.read).length,
      "dashboard notification metric must match the current user's unread inbox",
    );

    const outsiderNotificationsRes = await fetch(`${baseUrl}/notifications`, { headers: outsiderHeaders });
    assert.equal(outsiderNotificationsRes.status, 200);
    const outsiderNotifications = (await outsiderNotificationsRes.json()).data;
    assert.equal(outsiderNotifications.some((item) => item.id === privateNotification.id), false);

    const outsiderReadRes = await fetch(`${baseUrl}/notifications/${privateNotification.id}/read`, {
      method: 'PATCH',
      headers: outsiderHeaders,
    });
    assert.equal(outsiderReadRes.status, 404);

    const outsiderCreateForPmRes = await fetch(`${baseUrl}/notifications`, {
      method: 'POST',
      headers: outsiderHeaders,
      body: JSON.stringify({ userId: 'user-pm', message: 'Cross-user write attempt' }),
    });
    assert.equal(outsiderCreateForPmRes.status, 403);

    // workflow transition integration
    const createRes = await fetch(`${baseUrl}/projects/proj-1/issues`, {
      method: 'POST',
      headers: pmHeaders,
      body: JSON.stringify({ title: 'Integration transition issue', reporterId: outsider.user.id }),
    });
    assert.equal(createRes.status, 201);
    const issue = (await createRes.json()).data;
    assert.equal(issue.reporterId, 'user-pm', 'reporter identity must come from the access token');

    const forgedIssueNotificationRes = await fetch(`${baseUrl}/notifications`, {
      method: 'POST',
      headers: outsiderHeaders,
      body: JSON.stringify({ type: 'system', payload: { issueId: issue.id } }),
    });
    assert.equal(forgedIssueNotificationRes.status, 201);
    const forgedIssueNotification = (await forgedIssueNotificationRes.json()).data;
    const outsiderNotificationsAfterForgeRes = await fetch(`${baseUrl}/notifications`, { headers: outsiderHeaders });
    assert.equal(outsiderNotificationsAfterForgeRes.status, 200);
    const outsiderNotificationsAfterForge = (await outsiderNotificationsAfterForgeRes.json()).data;
    const forgedIssueNotificationFromList = outsiderNotificationsAfterForge.find((item) => item.id === forgedIssueNotification.id);
    assert.ok(forgedIssueNotificationFromList);
    assert.equal(readNotificationPayload(forgedIssueNotificationFromList).projectId, undefined);
    assert.equal(readNotificationPayload(forgedIssueNotificationFromList).projectKey, undefined);
    assert.equal(readNotificationPayload(forgedIssueNotificationFromList).issueTitle, undefined);

    const addCollaboratorRes = await fetch(`${baseUrl}/projects/proj-1/members`, {
      method: 'POST',
      headers: pmHeaders,
      body: JSON.stringify({ userId: outsider.user.id, role: 'member' }),
    });
    assert.equal(addCollaboratorRes.status, 201);

    const genericAssignRes = await fetch(`${baseUrl}/issues/${issue.id}`, {
      method: 'PATCH',
      headers: pmHeaders,
      body: JSON.stringify({ assigneeId: outsider.user.id }),
    });
    assert.equal(genericAssignRes.status, 200);
    assert.equal((await genericAssignRes.json()).data.assigneeId, outsider.user.id);

    const outsiderInboxAfterAssignmentRes = await fetch(`${baseUrl}/notifications`, { headers: outsiderHeaders });
    assert.equal(outsiderInboxAfterAssignmentRes.status, 200);
    const outsiderInboxAfterAssignment = (await outsiderInboxAfterAssignmentRes.json()).data;
    assert.ok(
      outsiderInboxAfterAssignment.some((item) => (
        item.type === 'issue.assigned' && readNotificationPayload(item).issueId === issue.id
      )),
      'the generic Issue editor must notify a newly selected assignee',
    );

    const activityAfterAssignmentRes = await fetch(`${baseUrl}/issues/${issue.id}/activity`, { headers: pmHeaders });
    assert.equal(activityAfterAssignmentRes.status, 200);
    const activityCountAfterAssignment = (await activityAfterAssignmentRes.json()).data.length;

    const noOpUpdateRes = await fetch(`${baseUrl}/issues/${issue.id}`, {
      method: 'PATCH',
      headers: pmHeaders,
      body: JSON.stringify({ assigneeId: outsider.user.id }),
    });
    assert.equal(noOpUpdateRes.status, 200);

    const activityAfterNoOpRes = await fetch(`${baseUrl}/issues/${issue.id}/activity`, { headers: pmHeaders });
    assert.equal(activityAfterNoOpRes.status, 200);
    assert.equal(
      (await activityAfterNoOpRes.json()).data.length,
      activityCountAfterAssignment,
      'saving an unchanged Issue must not append audit noise',
    );

    const addDueDateRes = await fetch(`${baseUrl}/issues/${issue.id}`, {
      method: 'PATCH',
      headers: pmHeaders,
      body: JSON.stringify({ dueAt: '2030-01-02T00:00:00.000Z' }),
    });
    assert.equal(addDueDateRes.status, 200);
    assert.equal((await addDueDateRes.json()).data.dueAt, '2030-01-02T00:00:00.000Z');

    const clearOptionalFieldsRes = await fetch(`${baseUrl}/issues/${issue.id}`, {
      method: 'PATCH',
      headers: pmHeaders,
      body: JSON.stringify({ assigneeId: null, dueAt: null }),
    });
    assert.equal(clearOptionalFieldsRes.status, 200);
    const clearedIssue = (await clearOptionalFieldsRes.json()).data;
    assert.equal(clearedIssue.assigneeId, null);
    assert.equal(clearedIssue.dueAt, null);

    const assignSelfRes = await fetch(`${baseUrl}/issues/${issue.id}/assignee`, {
      method: 'PATCH',
      headers: pmHeaders,
      body: JSON.stringify({ assigneeId: 'user-pm' }),
    });
    assert.equal(assignSelfRes.status, 200);

    const invalidTransitionRes = await fetch(`${baseUrl}/issues/${issue.id}/status`, {
      method: 'PATCH',
      headers: pmHeaders,
      body: JSON.stringify({ statusId: 'done' }),
    });
    assert.equal(invalidTransitionRes.status, 422);

    const toDoingRes = await fetch(`${baseUrl}/issues/${issue.id}/status`, {
      method: 'PATCH',
      headers: pmHeaders,
      body: JSON.stringify({ statusId: 'doing' }),
    });
    assert.equal(toDoingRes.status, 200);

    const toDoneRes = await fetch(`${baseUrl}/issues/${issue.id}/status`, {
      method: 'PATCH',
      headers: pmHeaders,
      body: JSON.stringify({ statusId: 'done' }),
    });
    assert.equal(toDoneRes.status, 200);

    const commentRes = await fetch(`${baseUrl}/issues/${issue.id}/comments`, {
      method: 'POST',
      headers: pmHeaders,
      body: JSON.stringify({ body: 'Identity-bound comment', authorId: outsider.user.id }),
    });
    assert.equal(commentRes.status, 201);
    const createdComment = (await commentRes.json()).data;
    assert.equal(createdComment.authorId, 'user-pm', 'comment author must come from the access token');
    assert.equal(createdComment.authorName, 'PM');
    assert.equal(createdComment.authorEmail, 'pm@example.com');

    const contextualNotificationsRes = await fetch(`${baseUrl}/notifications`, { headers: pmHeaders });
    assert.equal(contextualNotificationsRes.status, 200);
    const contextualNotifications = (await contextualNotificationsRes.json()).data;
    const assignmentNotification = contextualNotifications.find((item) => (
      item.type === 'issue.assigned' && readNotificationPayload(item).issueId === issue.id
    ));
    assert.ok(assignmentNotification, 'issue assignment should create a notification for the assignee');
    assert.equal(readNotificationPayload(assignmentNotification).projectId, 'proj-1');
    assert.equal(readNotificationPayload(assignmentNotification).projectKey, 'CORE');
    assert.equal(readNotificationPayload(assignmentNotification).issueTitle, issue.title);

    const contextualActivityRes = await fetch(`${baseUrl}/activity-logs`, { headers: pmHeaders });
    assert.equal(contextualActivityRes.status, 200);
    const contextualActivities = (await contextualActivityRes.json()).data;
    const createdActivity = contextualActivities.find((item) => item.issueId === issue.id && item.action === 'issue.created');
    assert.ok(createdActivity, 'created issue should appear in the accessible activity stream');
    assert.equal(createdActivity.actorName, 'PM');
    assert.equal(createdActivity.projectId, 'proj-1');
    assert.equal(createdActivity.projectKey, 'CORE');
    assert.equal(createdActivity.issueNumber, issue.number);
    assert.equal(createdActivity.issueTitle, issue.title);

    // project deletion must clean up project-owned relations without terminating the server
    const disposableProjectKey = `T${randomUUID().replaceAll('-', '').slice(0, 11).toUpperCase()}`;
    const disposableProjectRes = await fetch(`${baseUrl}/projects`, {
      method: 'POST',
      headers: pmHeaders,
      body: JSON.stringify({ key: disposableProjectKey, name: 'Disposable integration project' }),
    });
    assert.equal(disposableProjectRes.status, 201);
    const disposableProject = (await disposableProjectRes.json()).data;

    const addDisposableMemberRes = await fetch(`${baseUrl}/projects/${disposableProject.id}/members`, {
      method: 'POST',
      headers: pmHeaders,
      body: JSON.stringify({ userId: outsider.user.id, role: 'viewer' }),
    });
    assert.equal(addDisposableMemberRes.status, 201);
    const disposableMember = (await addDisposableMemberRes.json()).data;
    assert.equal(disposableMember.name, outsider.user.name);
    assert.equal(disposableMember.email, outsiderEmail);

    const disposableMilestoneRes = await fetch(`${baseUrl}/projects/${disposableProject.id}/milestones`, {
      method: 'POST',
      headers: pmHeaders,
      body: JSON.stringify({ name: 'Disposable milestone' }),
    });
    assert.equal(disposableMilestoneRes.status, 201);

    const disposableSprintRes = await fetch(`${baseUrl}/projects/${disposableProject.id}/sprints`, {
      method: 'POST',
      headers: pmHeaders,
      body: JSON.stringify({ name: 'Disposable sprint' }),
    });
    assert.equal(disposableSprintRes.status, 201);

    const deleteProjectRes = await fetch(`${baseUrl}/projects/${disposableProject.id}`, {
      method: 'DELETE',
      headers: pmHeaders,
    });
    assert.equal(deleteProjectRes.status, 200);

    const projectsAfterDeleteRes = await fetch(`${baseUrl}/projects`, { headers: pmHeaders });
    assert.equal(projectsAfterDeleteRes.status, 200, 'API must remain available after project deletion');
    const projectsAfterDelete = (await projectsAfterDeleteRes.json()).data;
    assert.equal(projectsAfterDelete.some((project) => project.id === disposableProject.id), false);

    // changing a password must revoke both previously issued token types
    const passwordEmail = `password-revocation_${randomUUID()}@example.com`;
    const passwordRegisterRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Password User', email: passwordEmail, password: 'Password1' }),
    });
    assert.equal(passwordRegisterRes.status, 201);
    const passwordSession = await passwordRegisterRes.json();

    const rejectedPasswordChangeRes = await fetch(`${baseUrl}/change-password`, {
      method: 'POST',
      headers: authHeaders(passwordSession.accessToken),
      body: JSON.stringify({ currentPassword: 'WrongPassword1', newPassword: 'Password2' }),
    });
    assert.equal(rejectedPasswordChangeRes.status, 422, 'wrong current password is a field validation error, not an auth-token failure');

    const accessAfterRejectedChangeRes = await fetch(`${baseUrl}/me`, {
      headers: authHeaders(passwordSession.accessToken),
    });
    assert.equal(accessAfterRejectedChangeRes.status, 200, 'a rejected password change must not revoke the current session');

    const changePasswordRes = await fetch(`${baseUrl}/change-password`, {
      method: 'POST',
      headers: authHeaders(passwordSession.accessToken),
      body: JSON.stringify({ currentPassword: 'Password1', newPassword: 'Password2' }),
    });
    assert.equal(changePasswordRes.status, 200);

    const revokedAccessRes = await fetch(`${baseUrl}/me`, {
      headers: authHeaders(passwordSession.accessToken),
    });
    assert.equal(revokedAccessRes.status, 401);

    const revokedRefreshRes = await fetch(`${baseUrl}/refresh`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken: passwordSession.refreshToken }),
    });
    assert.equal(revokedRefreshRes.status, 401);

    const replacementToken = await login(passwordEmail, 'Password2');
    assert.ok(replacementToken);

    console.log('Integration tests passed');
  } finally {
    await stopTestServer(server.child);
  }
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
