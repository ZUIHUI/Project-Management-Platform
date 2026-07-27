export interface paths {
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Liveness health check */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Healthy */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["OkHealthResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health/ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Database readiness health check */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Ready to serve database-backed requests */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ReadyHealthResponse"];
                    };
                };
                /** @description Database is unavailable */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/openapi.yaml": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** OpenAPI spec document */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description YAML file */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List projects */
        get: {
            parameters: {
                query?: {
                    page?: components["parameters"]["Page"];
                    pageSize?: components["parameters"]["PageSize"];
                    q?: string;
                    status?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Paged project list */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ProjectListResponse"];
                    };
                };
                401: components["responses"]["Unauthorized"];
            };
        };
        put?: never;
        /** Create project */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["CreateProjectRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ProjectResponse"];
                    };
                };
                403: components["responses"]["Forbidden"];
                409: components["responses"]["Conflict"];
                422: components["responses"]["ValidationError"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get project detail */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: components["parameters"]["ProjectId"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Project detail */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ProjectResponse"];
                    };
                };
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
            };
        };
        /** Update project */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: components["parameters"]["ProjectId"];
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["UpdateProjectRequest"];
                };
            };
            responses: {
                /** @description Updated */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ProjectResponse"];
                    };
                };
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
                422: components["responses"]["ValidationError"];
            };
        };
        post?: never;
        /** Delete project */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: components["parameters"]["ProjectId"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Deleted project */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ProjectResponse"];
                    };
                };
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/timeline": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get project timeline projection */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: components["parameters"]["ProjectId"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Project timeline items */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ProjectTimelineResponse"];
                    };
                };
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/issues": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List issues by project */
        get: {
            parameters: {
                query?: {
                    page?: components["parameters"]["Page"];
                    pageSize?: components["parameters"]["PageSize"];
                    q?: string;
                    statusId?: string;
                    assigneeId?: string;
                    sortBy?: "number" | "updatedAt";
                    order?: "asc" | "desc";
                };
                header?: never;
                path: {
                    projectId: components["parameters"]["ProjectId"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Paged issue list */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["IssueListResponse"];
                    };
                };
                403: components["responses"]["Forbidden"];
            };
        };
        put?: never;
        /** Create issue */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: components["parameters"]["ProjectId"];
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["CreateIssueRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["IssueResponse"];
                    };
                };
                403: components["responses"]["Forbidden"];
                422: components["responses"]["ValidationError"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/issues/{issueId}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Transition issue status */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    issueId: components["parameters"]["IssueId"];
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        statusId: string;
                    };
                };
            };
            responses: {
                /** @description Updated issue */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["IssueResponse"];
                    };
                };
                403: components["responses"]["Forbidden"];
                /** @description Unknown or invalid transition */
                422: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorResponse"];
                    };
                };
            };
        };
        trace?: never;
    };
    "/tasks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Legacy task projection for compatibility
         * @deprecated
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Legacy tasks with dueDate field */
                200: {
                    headers: {
                        Deprecation?: "true";
                        Sunset?: string;
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data?: components["schemas"]["LegacyTask"][];
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Register a self-service project creator */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["RegisterRequest"];
                };
            };
            responses: {
                /** @description Registered */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["AuthSession"];
                    };
                };
                409: components["responses"]["Conflict"];
                422: components["responses"]["ValidationError"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Login with email and password */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["LoginRequest"];
                };
            };
            responses: {
                /** @description Authenticated */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["AuthSession"];
                    };
                };
                401: components["responses"]["Unauthorized"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Exchange a refresh token for an access token */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        refreshToken: string;
                    };
                };
            };
            responses: {
                /** @description Refreshed */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            accessToken: string;
                        };
                    };
                };
                401: components["responses"]["Unauthorized"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get the current user profile */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Current user */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["UserProfileResponse"];
                    };
                };
                401: components["responses"]["Unauthorized"];
            };
        };
        /** Update the current user profile */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        name: string;
                        /** Format: email */
                        email: string;
                    };
                };
            };
            responses: {
                /** @description Updated profile */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["UserProfileResponse"];
                    };
                };
                409: components["responses"]["Conflict"];
                422: components["responses"]["ValidationError"];
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/change-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Change the current user password */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** Format: password */
                        currentPassword: string;
                        /** Format: password */
                        newPassword: string;
                    };
                };
            };
            responses: {
                /** @description Password changed */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            message?: string;
                        };
                    };
                };
                401: components["responses"]["Unauthorized"];
                422: components["responses"]["ValidationError"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/archive": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Archive a project */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: components["parameters"]["ProjectId"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Archived project */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ProjectResponse"];
                    };
                };
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/member-candidates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Search users who can be added to a project */
        get: {
            parameters: {
                query?: {
                    /** @description Optional name or email search text */
                    q?: string;
                    limit?: number;
                };
                header?: never;
                path: {
                    projectId: components["parameters"]["ProjectId"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Users who are not already project members */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data: components["schemas"]["MemberCandidate"][];
                        };
                    };
                };
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/members": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Add or update a project member */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: components["parameters"]["ProjectId"];
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        userId: string;
                        /** @enum {string} */
                        role: "viewer" | "member" | "project_admin";
                    };
                };
            };
            responses: {
                /** @description Project member */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data?: components["schemas"]["ProjectMember"];
                        };
                    };
                };
                403: components["responses"]["Forbidden"];
                422: components["responses"]["ValidationError"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/milestones": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create a project milestone */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: components["parameters"]["ProjectId"];
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        name: string;
                        /** Format: date-time */
                        dueAt?: string | null;
                    };
                };
            };
            responses: {
                /** @description Created milestone */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data?: components["schemas"]["Milestone"];
                        };
                    };
                };
                403: components["responses"]["Forbidden"];
                422: components["responses"]["ValidationError"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/sprints": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create a project sprint */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: components["parameters"]["ProjectId"];
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        name: string;
                        goal?: string;
                        /** Format: date-time */
                        startAt?: string;
                        /** Format: date-time */
                        endAt?: string | null;
                    };
                };
            };
            responses: {
                /** @description Created sprint */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data?: components["schemas"]["Sprint"];
                        };
                    };
                };
                403: components["responses"]["Forbidden"];
                422: components["responses"]["ValidationError"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/workflows/statuses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List workflow statuses */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Workflow statuses */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data?: components["schemas"]["WorkflowStatus"][];
                        };
                    };
                };
                401: components["responses"]["Unauthorized"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{projectId}/board": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get project board columns */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    projectId: components["parameters"]["ProjectId"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Board columns */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data?: components["schemas"]["BoardColumn"][];
                        };
                    };
                };
                403: components["responses"]["Forbidden"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/issues/{issueId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get issue detail */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    issueId: components["parameters"]["IssueId"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Issue detail */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["IssueResponse"];
                    };
                };
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Update issue fields */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    issueId: components["parameters"]["IssueId"];
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["UpdateIssueRequest"];
                };
            };
            responses: {
                /** @description Updated issue */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["IssueResponse"];
                    };
                };
                403: components["responses"]["Forbidden"];
                422: components["responses"]["ValidationError"];
            };
        };
        trace?: never;
    };
    "/issues/{issueId}/assignee": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Assign an issue */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    issueId: components["parameters"]["IssueId"];
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        assigneeId: string | null;
                    };
                };
            };
            responses: {
                /** @description Assigned issue */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["IssueResponse"];
                    };
                };
                403: components["responses"]["Forbidden"];
                422: components["responses"]["ValidationError"];
            };
        };
        trace?: never;
    };
    "/issues/{issueId}/comments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List issue comments */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    issueId: components["parameters"]["IssueId"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Issue comments */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data?: components["schemas"]["Comment"][];
                        };
                    };
                };
                403: components["responses"]["Forbidden"];
            };
        };
        put?: never;
        /** Create an issue comment */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    issueId: components["parameters"]["IssueId"];
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        body: string;
                        mentionedUserIds?: string[];
                    };
                };
            };
            responses: {
                /** @description Created comment */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data?: components["schemas"]["Comment"];
                        };
                    };
                };
                403: components["responses"]["Forbidden"];
                422: components["responses"]["ValidationError"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/activity-logs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List activity logs */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Activity logs */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data?: components["schemas"]["ActivityLog"][];
                        };
                    };
                };
                403: components["responses"]["Forbidden"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/issues/{issueId}/activity": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List activity for one issue */
        get: {
            parameters: {
                query?: {
                    limit?: number;
                };
                header?: never;
                path: {
                    issueId: components["parameters"]["IssueId"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Issue activity */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data?: components["schemas"]["ActivityLog"][];
                        };
                    };
                };
                403: components["responses"]["Forbidden"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dashboard": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get dashboard projection */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Dashboard data */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["DashboardResponse"];
                    };
                };
                401: components["responses"]["Unauthorized"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/notifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List notifications for the current user */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Notifications */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data?: components["schemas"]["Notification"][];
                        };
                    };
                };
                401: components["responses"]["Unauthorized"];
            };
        };
        put?: never;
        /** Create a notification for self; platform admins may target another user */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        userId?: string;
                        type?: string;
                        message?: string;
                        payload?: unknown;
                    } | unknown | unknown;
                };
            };
            responses: {
                /** @description Created notification */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data?: components["schemas"]["Notification"];
                        };
                    };
                };
                403: components["responses"]["Forbidden"];
                422: components["responses"]["ValidationError"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/notifications/{notificationId}/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Mark a notification as read */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    notificationId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Updated notification */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            data?: components["schemas"]["Notification"];
                        };
                    };
                };
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
            };
        };
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        RegisterRequest: {
            name: string;
            /** Format: email */
            email: string;
            /** Format: password */
            password: string;
        };
        LoginRequest: {
            /** Format: email */
            email: string;
            /** Format: password */
            password: string;
        };
        AuthUser: {
            id: string;
            name: string;
            /** Format: email */
            email?: string;
            /** @enum {string} */
            role: "viewer" | "member" | "project_admin" | "org_admin" | "owner";
        };
        AuthSession: {
            accessToken: string;
            refreshToken: string;
            user: components["schemas"]["AuthUser"];
        };
        UserProfileResponse: {
            user: components["schemas"]["AuthUser"];
            passwordPolicy?: string;
        };
        ProjectMember: {
            projectId: string;
            userId: string;
            /** @enum {string} */
            role: "viewer" | "member" | "project_admin";
            name: string;
            /** Format: email */
            email: string;
        };
        Milestone: {
            id: string;
            projectId: string;
            name: string;
            /** Format: date-time */
            dueAt?: string | null;
            status: string;
            /** Format: date-time */
            createdAt?: string;
        };
        Sprint: {
            id: string;
            projectId: string;
            name: string;
            goal?: string;
            /** Format: date-time */
            startAt?: string;
            /** Format: date-time */
            endAt?: string | null;
            status: string;
            /** Format: date-time */
            createdAt?: string;
        };
        WorkflowStatus: {
            id: string;
            name: string;
            order: number;
            allowedToIds: string[];
        };
        BoardColumn: components["schemas"]["WorkflowStatus"] & {
            issues: components["schemas"]["Issue"][];
        };
        UpdateIssueRequest: {
            title?: string;
            description?: string;
            /** @enum {string} */
            priority?: "low" | "medium" | "high";
            assigneeId?: string | null;
            sprintId?: string | null;
            milestoneId?: string | null;
            /** Format: date-time */
            dueAt?: string | null;
            /**
             * Format: date-time
             * @description Deprecated compatibility alias of dueAt
             */
            dueDate?: string | null;
        };
        Comment: {
            id: string;
            issueId: string;
            authorId?: string | null;
            authorName?: string;
            authorEmail?: string | null;
            body: string;
            /** Format: date-time */
            createdAt: string;
            mentions?: string[];
        };
        ActivityUserReference: {
            id: string;
            name: string;
        };
        ActivityLog: {
            id: string;
            actorId?: string | null;
            actorName?: string;
            actorEmail?: string | null;
            issueId: string;
            issueNumber?: number;
            issueTitle?: string;
            projectId?: string;
            projectKey?: string;
            projectName?: string;
            action: string;
            before?: string | null;
            after?: string | null;
            userReferences: components["schemas"]["ActivityUserReference"][];
            /** Format: date-time */
            createdAt: string;
        };
        Notification: {
            id: string;
            userId: string;
            type: string;
            message: string;
            payload?: unknown;
            read: boolean;
            /** Format: date-time */
            createdAt: string;
        };
        DashboardResponse: {
            data?: {
                totals?: {
                    [key: string]: number;
                };
                statusBreakdown?: {
                    statusId: string;
                    statusName: string;
                    count: number;
                }[];
                openIssues?: components["schemas"]["DashboardIssue"][];
                overdueIssues?: components["schemas"]["DashboardIssue"][];
            };
        };
        OkHealthResponse: {
            data: {
                /** @enum {string} */
                status: "ok";
                /** Format: date-time */
                timestamp: string;
            };
        };
        ReadyHealthResponse: {
            data: {
                /** @enum {string} */
                status: "ready";
                /** Format: date-time */
                timestamp: string;
            };
        };
        AuthErrorResponse: {
            error?: string;
        };
        ErrorResponse: {
            error?: {
                message?: string;
                status?: number;
            };
        };
        Project: {
            id: string;
            key: string;
            name: string;
            description: string;
            ownerId: string | null;
            status: string;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
            members?: components["schemas"]["ProjectMember"][];
            milestones?: {
                id?: string;
                name?: string;
                /** Format: date-time */
                dueAt?: string | null;
            }[];
            sprints?: {
                id?: string;
                name?: string;
            }[];
        };
        MemberCandidate: {
            id: string;
            name: string;
            /** Format: email */
            email: string;
        };
        ProjectResponse: {
            data?: components["schemas"]["Project"];
        };
        ProjectListResponse: {
            data?: components["schemas"]["Project"][];
            meta?: {
                page?: number;
                pageSize?: number;
                total?: number;
                totalPages?: number;
            };
        };
        ProjectTimelineItem: {
            /** @enum {string} */
            type?: "milestone" | "sprint" | "issue";
            id?: string;
            name?: string;
            /** Format: date-time */
            startAt?: string | null;
            /** Format: date-time */
            endAt?: string | null;
            status?: string | null;
        };
        ProjectTimeline: {
            project?: {
                id?: string;
                key?: string;
                name?: string;
                status?: string;
            };
            items?: components["schemas"]["ProjectTimelineItem"][];
        };
        ProjectTimelineResponse: {
            data?: components["schemas"]["ProjectTimeline"];
            meta?: {
                /** Format: date-time */
                lastSync?: string;
            };
        };
        CreateProjectRequest: {
            key: string;
            name: string;
            description?: string;
            ownerId?: string;
        };
        UpdateProjectRequest: {
            key?: string;
            name?: string;
            description?: string;
            ownerId?: string;
            status?: string;
        };
        Issue: {
            id: string;
            number: number;
            projectId: string;
            title: string;
            description: string;
            /** @enum {string} */
            priority: "low" | "medium" | "high";
            statusId: string;
            assigneeId?: string | null;
            reporterId?: string | null;
            /** Format: date-time */
            dueAt: string | null;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        DashboardIssue: components["schemas"]["Issue"] & {
            projectKey: string;
            projectName: string;
        };
        CreateIssueRequest: {
            title: string;
            description?: string;
            /** @enum {string} */
            priority?: "low" | "medium" | "high";
            assigneeId?: string | null;
            reporterId?: string | null;
            /** Format: date-time */
            dueAt?: string | null;
            /**
             * Format: date-time
             * @description Deprecated compatibility alias of dueAt
             */
            dueDate?: string | null;
        };
        IssueResponse: {
            data?: components["schemas"]["Issue"];
        };
        IssueListResponse: {
            data?: components["schemas"]["Issue"][];
            meta?: {
                page?: number;
                pageSize?: number;
                total?: number;
                totalPages?: number;
            };
        };
        LegacyTask: {
            id?: string;
            title?: string;
            projectId?: string;
            status?: string;
            priority?: string;
            /** Format: date-time */
            dueDate?: string | null;
            /** Format: date-time */
            createdAt?: string;
            /** Format: date-time */
            updatedAt?: string;
        };
    };
    responses: {
        /** @description Missing/invalid token */
        Unauthorized: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["AuthErrorResponse"];
            };
        };
        /** @description Role/scope forbidden */
        Forbidden: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorResponse"];
            };
        };
        /** @description Resource not found */
        NotFound: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorResponse"];
            };
        };
        /** @description Unique constraint conflict */
        Conflict: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorResponse"];
            };
        };
        /** @description Validation failure */
        ValidationError: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorResponse"];
            };
        };
    };
    parameters: {
        ProjectId: string;
        IssueId: string;
        Page: number;
        PageSize: number;
    };
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
