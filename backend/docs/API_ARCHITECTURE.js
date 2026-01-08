/**
 * ============================================================================
 * JIRA-LIKE SYSTEM: API & WORKFLOW ARCHITECTURE
 * ============================================================================
 * 
 * This document defines:
 * 1. Issue Status Workflow & Allowed Transitions
 * 2. Sprint Lifecycle Rules
 * 3. Required REST API Endpoints
 * 4. Request/Response Specifications
 * 5. Error Handling
 * 
 * Author: Senior SaaS Architect
 * Version: 1.0
 * Date: 2026-01-07
 */

// ============================================================================
// PART 1: ISSUE STATUS WORKFLOW
// ============================================================================

/**
 * Allowed Status Transitions (like real Jira)
 * 
 * States:
 * - BACKLOG: Issue exists, not in sprint or unstarted
 * - TODO: Issue is in sprint, not started
 * - IN_PROGRESS: Someone is actively working
 * - IN_REVIEW: Code/work under review
 * - DONE: Completed
 * - BLOCKED: Waiting on external blocker
 */

const ISSUE_WORKFLOW = {
    // From BACKLOG, you can:
    BACKLOG: ['TODO', 'BLOCKED'],
    
    // From TODO, you can:
    TODO: ['IN_PROGRESS', 'BLOCKED', 'BACKLOG'],
    
    // From IN_PROGRESS, you can:
    IN_PROGRESS: ['IN_REVIEW', 'BLOCKED', 'TODO'],
    
    // From IN_REVIEW, you can:
    IN_REVIEW: ['DONE', 'IN_PROGRESS', 'BLOCKED'],
    
    // From BLOCKED, you can:
    BLOCKED: ['TODO', 'IN_PROGRESS', 'BACKLOG'],
    
    // From DONE, you can REOPEN:
    DONE: ['IN_PROGRESS'],
};

/**
 * Helper: Check if transition is allowed
 * @param {string} currentStatus
 * @param {string} newStatus
 * @returns {boolean}
 */
function isValidTransition(currentStatus, newStatus) {
    if (!ISSUE_WORKFLOW[currentStatus]) return false;
    return ISSUE_WORKFLOW[currentStatus].includes(newStatus);
}

// ============================================================================
// PART 2: SPRINT LIFECYCLE RULES
// ============================================================================

/**
 * Sprint States & Rules:
 * 
 * FUTURE:
 *   - Issues can be added to backlog
 *   - Can plan/estimate issues
 *   - Cannot start until team agrees
 *   - Only ONE active sprint per project at a time
 * 
 * ACTIVE:
 *   - Team is actively working
 *   - Issues must be in BACKLOG or TO_DO (not pre-existing in other status)
 *   - Team moves issues through workflow
 *   - Burndown chart starts
 *   - Cannot add NEW issues (in real Jira, you can but it affects velocity)
 * 
 * CLOSED:
 *   - No issues can be changed
 *   - Metrics are calculated and frozen
 *   - Issues move to Backlog if reopened
 * 
 * Rules:
 * - Only ONE sprint can be ACTIVE per project
 * - New issues created go to BACKLOG if no active sprint
 * - Sprint duration: 1-4 weeks (configurable, default 2 weeks)
 * - Start date <= End date always
 */

const SPRINT_STATES = {
    FUTURE: 'future',
    ACTIVE: 'active',
    CLOSED: 'closed',
};

// ============================================================================
// PART 3: REST API ENDPOINTS (EXACT SPECIFICATIONS)
// ============================================================================

/**
 * ============================================================================
 * PROJECTS
 * ============================================================================
 */

/**
 * POST /api/projects
 * Create a new project
 * 
 * Request:
 * {
 *   "name": "Digital Dockers Suite",
 *   "key": "DDS",
 *   "description": "...",
 *   "projectType": "scrum",
 *   "leadId": "user-id",
 *   "teamMembers": ["user-id-1", "user-id-2"]
 * }
 * 
 * Response: 201 Created
 * {
 *   "_id": "proj-id",
 *   "name": "Digital Dockers Suite",
 *   "key": "DDS",
 *   "projectType": "scrum",
 *   "nextIssueNumber": 1,
 *   "createdAt": "2026-01-07T...",
 *   "updatedAt": "2026-01-07T..."
 * }
 */

/**
 * GET /api/projects/:projectId
 * Get project details
 */

/**
 * GET /api/projects/:projectId/settings
 * Get project settings (issue types, statuses, custom fields)
 */

/**
 * PUT /api/projects/:projectId
 * Update project details
 */

/**
 * ============================================================================
 * SPRINTS
 * ============================================================================
 */

/**
 * POST /api/projects/:projectId/sprints
 * Create a new sprint
 * 
 * Request:
 * {
 *   "name": "Sprint 1 - User Auth",
 *   "goal": "Complete user authentication system",
 *   "startDate": "2026-01-20T00:00:00Z",
 *   "endDate": "2026-02-03T00:00:00Z",
 *   "sprintDuration": 14
 * }
 * 
 * Response: 201 Created
 * {
 *   "_id": "sprint-id",
 *   "name": "Sprint 1 - User Auth",
 *   "projectId": "proj-id",
 *   "status": "future",
 *   "goal": "...",
 *   "startDate": "2026-01-20T00:00:00Z",
 *   "endDate": "2026-02-03T00:00:00Z",
 *   "committedPoints": 0,
 *   "completedPoints": 0,
 *   "velocity": 0,
 *   "createdAt": "2026-01-07T..."
 * }
 */

/**
 * GET /api/projects/:projectId/sprints
 * Get all sprints for a project
 * 
 * Query params:
 * - status: "future|active|closed" (optional, defaults to all)
 * 
 * Response: 200 OK
 * {
 *   "data": [
 *     { sprint object },
 *     { sprint object }
 *   ],
 *   "total": 2,
 *   "activeSprint": { sprint object or null }
 * }
 */

/**
 * GET /api/projects/:projectId/sprints/active
 * Get the currently active sprint (if any)
 * 
 * Response: 200 OK
 * {
 *   "_id": "sprint-id",
 *   "name": "Sprint 2",
 *   "status": "active",
 *   ...
 * }
 * OR 404 Not Found (no active sprint)
 */

/**
 * POST /api/projects/:projectId/sprints/:sprintId/start
 * Start a sprint (change from FUTURE -> ACTIVE)
 * 
 * IMPORTANT RULES:
 * - Only one sprint can be ACTIVE at a time
 * - If another sprint is ACTIVE, close it first (or return error)
 * - All issues in this sprint must have status in [BACKLOG, TODO]
 * - Initialize burndown data
 * 
 * Request body: (optional)
 * {
 *   "forceStartDate": "2026-01-20T00:00:00Z" // optional override
 * }
 * 
 * Response: 200 OK
 * {
 *   "_id": "sprint-id",
 *   "status": "active",
 *   "actualStartDate": "2026-01-07T10:30:00Z",
 *   "issues": [ { issue data } ]
 * }
 * 
 * Error 400: If another sprint is active
 * {
 *   "error": "Only one active sprint allowed. Close sprint XYZ first.",
 *   "activeSprint": { sprint id and name }
 * }
 */

/**
 * POST /api/projects/:projectId/sprints/:sprintId/close
 * Close a sprint (change ACTIVE -> CLOSED)
 * 
 * IMPORTANT RULES:
 * - Calculate final metrics (velocity, burndown)
 * - Move unfinished issues back to BACKLOG
 * - Lock sprint for further edits
 * 
 * Request: (optional)
 * {
 *   "moveUnfinishedToBacklog": true // default true
 * }
 * 
 * Response: 200 OK
 * {
 *   "_id": "sprint-id",
 *   "status": "closed",
 *   "velocity": 45,
 *   "completionRate": 85,
 *   "movedToBacklog": 3,
 *   "finalMetrics": {
 *     "totalIssues": 20,
 *     "completedIssues": 17,
 *     "completedPoints": 45,
 *     "remainingPoints": 8
 *   }
 * }
 */

/**
 * PUT /api/projects/:projectId/sprints/:sprintId
 * Update sprint details (name, goal, dates)
 * 
 * RULE: Can only edit FUTURE sprints, not ACTIVE or CLOSED
 * 
 * Response: 200 OK { updated sprint }
 * Error 400: If sprint is not FUTURE
 */

/**
 * ============================================================================
 * ISSUES (THE MOST IMPORTANT ENDPOINTS)
 * ============================================================================
 */

/**
 * POST /api/projects/:projectId/issues
 * Create a new issue
 * 
 * Request:
 * {
 *   "title": "Fix login bug",
 *   "description": "Users cannot log in with SSO...",
 *   "issueType": "bug",
 *   "priority": "high",
 *   "assignedTo": ["user-id"],
 *   "storyPoints": 5,
 *   "sprintId": "sprint-id" // optional, defaults to backlog
 * }
 * 
 * IMPORTANT:
 * - Auto-generate KEY like "DDS-1", "DDS-2" etc
 * - If no sprintId, add to BACKLOG
 * - Initial status depends on sprint state:
 *   - FUTURE sprint: TODO
 *   - ACTIVE sprint: TODO
 *   - No sprint (BACKLOG): BACKLOG
 * 
 * Response: 201 Created
 * {
 *   "_id": "issue-id",
 *   "key": "DDS-1",
 *   "title": "Fix login bug",
 *   "status": "todo",
 *   "sprintId": null,
 *   "assignedTo": [ { user object } ],
 *   "storyPoints": 5,
 *   "createdAt": "2026-01-07T...",
 *   "updatedAt": "2026-01-07T..."
 * }
 */

/**
 * GET /api/projects/:projectId/issues
 * Get all issues for a project
 * 
 * Query params:
 * - sprintId: "sprint-id" (optional, get only sprint issues)
 * - status: "todo,in_progress,done" (optional, filter)
 * - assignedTo: "user-id" (optional)
 * - searchText: "login" (optional, search in title/description)
 * - page: 1 (optional, pagination)
 * - limit: 20 (optional)
 * 
 * Response: 200 OK
 * {
 *   "data": [ { issue 1 }, { issue 2 }, ... ],
 *   "total": 42,
 *   "page": 1,
 *   "pageSize": 20
 * }
 */

/**
 * GET /api/projects/:projectId/sprints/:sprintId/board
 * Get board data for a specific sprint
 * 
 * This is the MOST IMPORTANT endpoint for the UI
 * Returns all issues grouped by status for the kanban board
 * 
 * Response: 200 OK
 * {
 *   "sprint": { sprint object },
 *   "columns": {
 *     "TODO": [
 *       {
 *         "_id": "issue-id",
 *         "key": "DDS-1",
 *         "title": "...",
 *         "status": "todo",
 *         "priority": "high",
 *         "storyPoints": 5,
 *         "assignedTo": [ { user } ],
 *         "createdAt": "..."
 *       },
 *       ...
 *     ],
 *     "IN_PROGRESS": [ ... ],
 *     "IN_REVIEW": [ ... ],
 *     "DONE": [ ... ]
 *   },
 *   "metrics": {
 *     "total": 20,
 *     "todo": 5,
 *     "inProgress": 8,
 *     "inReview": 2,
 *     "done": 5,
 *     "storyPointsTotal": 45,
 *     "storyPointsCompleted": 15
 *   }
 * }
 */

/**
 * GET /api/projects/:projectId/backlog
 * Get backlog view (all unstarted issues not in active sprint)
 * 
 * Response: 200 OK
 * {
 *   "backlogIssues": [ { issue 1 }, { issue 2 }, ... ],
 *   "futureSprints": [
 *     {
 *       "sprint": { sprint object },
 *       "issues": [ { issue 1 }, { issue 2 } ]
 *     }
 *   ],
 *   "total": 30
 * }
 */

/**
 * GET /api/issues/:issueId
 * Get detailed issue view
 * 
 * Response: 200 OK
 * {
 *   "_id": "issue-id",
 *   "key": "DDS-1",
 *   "title": "...",
 *   "description": "...",
 *   "status": "in_progress",
 *   "assignedTo": [ { user object with full details } ],
 *   "reporter": { user object },
 *   "storyPoints": 5,
 *   "priority": "high",
 *   "issueType": "bug",
 *   "sprintId": "sprint-id",
 *   "projectId": "proj-id",
 *   "comments": [
 *     {
 *       "user": { user object },
 *       "text": "...",
 *       "timestamp": "2026-01-07T10:30:00Z"
 *     }
 *   ],
 *   "history": [
 *     {
 *       "changedBy": { user object },
 *       "field": "status",
 *       "oldValue": "todo",
 *       "newValue": "in_progress",
 *       "timestamp": "2026-01-07T10:30:00Z"
 *     }
 *   ],
 *   "createdAt": "...",
 *   "updatedAt": "..."
 * }
 */

/**
 * PUT /api/issues/:issueId
 * Update issue details
 * 
 * Request:
 * {
 *   "title": "Updated title",
 *   "description": "...",
 *   "storyPoints": 8,
 *   "priority": "medium",
 *   "assignedTo": ["user-id-1", "user-id-2"],
 *   "dueDate": "2026-02-01T00:00:00Z"
 * }
 * 
 * Note: Do NOT update status in this endpoint
 * Use the specific "move" endpoint below
 * 
 * Response: 200 OK { updated issue }
 */

/**
 * PUT /api/issues/:issueId/move
 * Move issue to a different status (DRAG & DROP)
 * 
 * This is the core workflow endpoint
 * Validates transition rules before allowing
 * 
 * Request:
 * {
 *   "newStatus": "in_progress",
 *   "sprintId": "sprint-id" // optional, if moving to different sprint
 * }
 * 
 * VALIDATION:
 * 1. Check if currentStatus -> newStatus is allowed
 * 2. If moving to DONE, optionally require comment
 * 3. If moving from DONE back, allow with warning
 * 
 * Response: 200 OK
 * {
 *   "_id": "issue-id",
 *   "key": "DDS-1",
 *   "status": "in_progress",
 *   "statusChangedAt": "2026-01-07T10:45:00Z",
 *   "statusChangedBy": "user-id"
 * }
 * 
 * Error 400: Invalid transition
 * {
 *   "error": "Cannot move from 'todo' to 'backlog'",
 *   "currentStatus": "todo",
 *   "requestedStatus": "backlog",
 *   "allowedTransitions": ["in_progress", "blocked"]
 * }
 */

/**
 * POST /api/issues/:issueId/move-to-sprint
 * Move issue to a different sprint
 * 
 * Request:
 * {
 *   "sprintId": "new-sprint-id"
 * }
 * 
 * RULES:
 * - Can only move between sprints in same project
 * - Can move from backlog to sprint or vice versa
 * - If target sprint is ACTIVE, reset issue status to TODO
 * 
 * Response: 200 OK { updated issue }
 */

/**
 * DELETE /api/issues/:issueId
 * Delete/Archive an issue
 * 
 * RULES:
 * - Only allow if issue is in BACKLOG status
 * - Prevent deletion of completed issues (archive instead)
 * - Soft delete (keep in DB with deleted flag)
 * 
 * Response: 200 OK
 * {
 *   "message": "Issue deleted",
 *   "issueId": "issue-id"
 * }
 * 
 * Error 400: Cannot delete
 * {
 *   "error": "Cannot delete issue with status 'done'"
 * }
 */

/**
 * ============================================================================
 * BOARD DATA (FOR UI)
 * ============================================================================
 */

/**
 * GET /api/board/kanban?projectId=X
 * Get full kanban board for project (all sprints)
 * 
 * Response:
 * {
 *   "projectId": "proj-id",
 *   "boardType": "kanban",
 *   "columns": {
 *     "TODO": [ { issues } ],
 *     "IN_PROGRESS": [ { issues } ],
 *     "DONE": [ { issues } ]
 *   },
 *   "metrics": { ... }
 * }
 */

/**
 * GET /api/board/scrum?projectId=X&sprintId=Y
 * Get sprint board (scrum view)
 * 
 * If sprintId not provided, use active sprint
 * If no active sprint, return error or empty
 * 
 * Response:
 * {
 *   "projectId": "proj-id",
 *   "sprintId": "sprint-id",
 *   "boardType": "scrum",
 *   "sprint": { sprint object },
 *   "columns": { ... },
 *   "metrics": { ... }
 * }
 */

// ============================================================================
// ERROR RESPONSES
// ============================================================================

/**
 * All endpoints should return standardized errors:
 * 
 * 400 Bad Request:
 * {
 *   "error": "Description of what went wrong",
 *   "code": "VALIDATION_ERROR",
 *   "details": { ... }
 * }
 * 
 * 401 Unauthorized:
 * {
 *   "error": "User not authenticated"
 * }
 * 
 * 403 Forbidden:
 * {
 *   "error": "User does not have permission",
 *   "requiredRole": "project_lead"
 * }
 * 
 * 404 Not Found:
 * {
 *   "error": "Resource not found",
 *   "resource": "issue",
 *   "id": "issue-id"
 * }
 * 
 * 500 Server Error:
 * {
 *   "error": "Internal server error",
 *   "requestId": "req-xyz"
 * }
 */

module.exports = {
    ISSUE_WORKFLOW,
    SPRINT_STATES,
    isValidTransition,
};
