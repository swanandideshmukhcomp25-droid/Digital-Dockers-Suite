/**
 * ============================================================================
 * JIRA-LIKE SYSTEM: 7-10 DAY IMPLEMENTATION ROADMAP
 * ============================================================================
 * 
 * This is a production-grade breakdown for building core Jira functionality
 * Each phase builds on the previous one
 * Estimated: 7-10 business days (6-8 hours/day)
 * 
 * Version: 1.0
 * Target: MVP with core functionality
 * Tech: Node.js/Express, React, MongoDB
 */

// ============================================================================
// PHASE 1: FOUNDATION (Days 1-2) - 14 hours
// ============================================================================

/**
 * PHASE 1 OBJECTIVES:
 * ✓ Set up issue workflow engine
 * ✓ Implement project initialization
 * ✓ Create issue API endpoints
 * ✓ Build backlog view (no sprints yet)
 * 
 * DELIVERABLES:
 * 1. Backend: Issue CRUD with workflow validation
 * 2. Backend: Issue key auto-generation
 * 3. Frontend: Create Issue form
 * 4. Frontend: Backlog list view
 * 5. Database: Ensure Project, Task models have required fields
 * 
 * TIME BREAKDOWN:
 * - Models review & fixes: 1h
 * - Workflow engine (issueWorkflow.js): 3h
 * - Issue API endpoints: 4h
 * - Frontend form component: 3h
 * - Testing & debugging: 3h
 */

const PHASE_1_TASKS = [
    {
        task: 'Review and enhance Task/Issue schema',
        subtasks: [
            'Add fields: key, status, startDate, completedDate, blockedReason',
            'Add missing indexes for queries',
            'Add validation rules',
        ],
        estimatedHours: 1,
        priority: 'CRITICAL',
        owner: 'Backend Dev',
    },
    {
        task: 'Implement issueWorkflow.js',
        subtasks: [
            'WORKFLOW state machine',
            'validateTransition function',
            'moveIssueToStatus function',
            'Unit tests',
        ],
        estimatedHours: 3,
        priority: 'CRITICAL',
        owner: 'Backend Dev',
    },
    {
        task: 'Create Issue API endpoints',
        subtasks: [
            'POST /api/projects/:projectId/issues (create)',
            'GET /api/projects/:projectId/issues (list)',
            'GET /api/issues/:issueId (detail)',
            'PUT /api/issues/:issueId/move (status change)',
            'Add error handling & validation',
        ],
        estimatedHours: 4,
        priority: 'CRITICAL',
        owner: 'Backend Dev',
    },
    {
        task: 'Build Create Issue form (Frontend)',
        subtasks: [
            'Component: IssueCreateModal',
            'Form fields: title, type, priority, description',
            'Validation',
            'API integration',
        ],
        estimatedHours: 3,
        priority: 'HIGH',
        owner: 'Frontend Dev',
    },
    {
        task: 'Build Backlog view (Frontend)',
        subtasks: [
            'Component: BacklogView',
            'List all issues without sprint',
            'Drag to reorder (optional for MVP)',
            'Filter/search',
        ],
        estimatedHours: 2,
        priority: 'HIGH',
        owner: 'Frontend Dev',
    },
    {
        task: 'Testing & Debugging',
        subtasks: [
            'Test issue creation workflow',
            'Test status transitions',
            'Test API error cases',
            'Fix bugs',
        ],
        estimatedHours: 3,
        priority: 'CRITICAL',
        owner: 'QA / Dev',
    },
];

// ============================================================================
// PHASE 2: SPRINT MANAGEMENT (Days 3-4) - 14 hours
// ============================================================================

/**
 * PHASE 2 OBJECTIVES:
 * ✓ Sprint CRUD operations
 * ✓ Start/close sprint logic
 * ✓ Only one active sprint rule enforcement
 * ✓ Sprint metrics calculation
 * ✓ Board view for active sprint
 * 
 * DELIVERABLES:
 * 1. Backend: Sprint API endpoints
 * 2. Backend: Sprint lifecycle logic (start, close)
 * 3. Frontend: Sprint selector dropdown
 * 4. Frontend: Sprint board view (with columns)
 * 5. Backend: Metrics calculations
 */

const PHASE_2_TASKS = [
    {
        task: 'Enhance Sprint schema',
        subtasks: [
            'Add fields: actualStartDate, actualEndDate, velocity, completionRate',
            'Add burndown tracking fields',
            'Add indexes',
        ],
        estimatedHours: 1,
        priority: 'CRITICAL',
        owner: 'Backend Dev',
    },
    {
        task: 'Implement sprintLogic.js',
        subtasks: [
            'startSprint() - activate sprint',
            'closeSprint() - close sprint with metrics',
            'getBacklog() - unstarted issues',
            'getSprintMetrics() - calculate metrics',
            'Unit tests',
        ],
        estimatedHours: 4,
        priority: 'CRITICAL',
        owner: 'Backend Dev',
    },
    {
        task: 'Sprint API endpoints',
        subtasks: [
            'POST /api/projects/:projectId/sprints (create)',
            'GET /api/projects/:projectId/sprints (list)',
            'GET /api/projects/:projectId/sprints/active (get active)',
            'POST /api/projects/:projectId/sprints/:sprintId/start',
            'POST /api/projects/:projectId/sprints/:sprintId/close',
            'Error handling',
        ],
        estimatedHours: 4,
        priority: 'CRITICAL',
        owner: 'Backend Dev',
    },
    {
        task: 'Sprint Board API',
        subtasks: [
            'GET /api/projects/:projectId/sprints/:sprintId/board',
            'Return columns with issues',
            'Include metrics',
        ],
        estimatedHours: 2,
        priority: 'CRITICAL',
        owner: 'Backend Dev',
    },
    {
        task: 'Sprint selector (Frontend)',
        subtasks: [
            'Component: SprintSelector (dropdown)',
            'List all sprints with status',
            'Show active sprint',
            'On select, refresh board',
        ],
        estimatedHours: 2,
        priority: 'HIGH',
        owner: 'Frontend Dev',
    },
    {
        task: 'Sprint Board (Frontend)',
        subtasks: [
            'Component: SprintBoard',
            'Columns: TODO, IN_PROGRESS, IN_REVIEW, DONE',
            'Display issues in each column',
            'Show metrics (total, completed, velocity)',
            'Connect to API',
        ],
        estimatedHours: 3,
        priority: 'CRITICAL',
        owner: 'Frontend Dev',
    },
    {
        task: 'Testing & fixes',
        subtasks: [
            'Test sprint creation',
            'Test sprint start (one-active rule)',
            'Test sprint close (move unfinished to backlog)',
            'Test metrics calculation',
        ],
        estimatedHours: 2,
        priority: 'CRITICAL',
        owner: 'QA / Dev',
    },
];

// ============================================================================
// PHASE 3: DRAG & DROP FUNCTIONALITY (Days 5-6) - 12 hours
// ============================================================================

/**
 * PHASE 3 OBJECTIVES:
 * ✓ Implement drag & drop between columns
 * ✓ Validate transitions on drop
 * ✓ Update backend on drop
 * ✓ Optimistic UI updates
 * ✓ Handle errors gracefully
 * 
 * DELIVERABLES:
 * 1. Frontend: Drag & drop library setup (already done with @hello-pangea/dnd)
 * 2. Frontend: Enhanced board component
 * 3. Frontend: Drag handlers with API calls
 * 4. Backend: Improved move endpoint
 */

const PHASE_3_TASKS = [
    {
        task: 'Enhance moveIssueToStatus endpoint',
        subtasks: [
            'Better error messages',
            'Return allowed transitions',
            'Track who moved it',
            'Log to history',
        ],
        estimatedHours: 2,
        priority: 'HIGH',
        owner: 'Backend Dev',
    },
    {
        task: 'Implement drag & drop handlers',
        subtasks: [
            'onDragEnd handler',
            'Validate status transition',
            'Optimistic UI update',
            'API call to backend',
            'Error handling (rollback UI)',
        ],
        estimatedHours: 3,
        priority: 'CRITICAL',
        owner: 'Frontend Dev',
    },
    {
        task: 'Enhance board component',
        subtasks: [
            'Draggable columns',
            'Drag-over state styling',
            'Handle invalid drops',
            'Show transition error messages',
        ],
        estimatedHours: 2,
        priority: 'HIGH',
        owner: 'Frontend Dev',
    },
    {
        task: 'Add card animations',
        subtasks: [
            'Move animation',
            'Column highlight on drag-over',
            'Success feedback',
        ],
        estimatedHours: 2,
        priority: 'MEDIUM',
        owner: 'Frontend Dev',
    },
    {
        task: 'Testing',
        subtasks: [
            'Test all valid transitions',
            'Test invalid transition error',
            'Test UI recovery on error',
            'Test performance with many cards',
        ],
        estimatedHours: 3,
        priority: 'CRITICAL',
        owner: 'QA / Dev',
    },
];

// ============================================================================
// PHASE 4: METRICS & REPORTS (Days 7-8) - 10 hours
// ============================================================================

/**
 * PHASE 4 OBJECTIVES:
 * ✓ Calculate burndown data
 * ✓ Calculate velocity
 * ✓ Calculate completion rate
 * ✓ Display metrics on board
 * ✓ Basic charts
 * 
 * DELIVERABLES:
 * 1. Backend: Metrics calculation functions
 * 2. Frontend: Metrics display cards
 * 3. Frontend: Simple charts (burndown, velocity)
 */

const PHASE_4_TASKS = [
    {
        task: 'Add history/audit model',
        subtasks: [
            'Create IssueHistory schema',
            'Track all status changes',
            'Store who, when, why',
        ],
        estimatedHours: 1,
        priority: 'HIGH',
        owner: 'Backend Dev',
    },
    {
        task: 'Implement metrics calculations',
        subtasks: [
            'getSprintMetrics() - status counts, points',
            'calculateBurndown() - daily remaining points',
            'getProjectVelocity() - average points/sprint',
        ],
        estimatedHours: 3,
        priority: 'CRITICAL',
        owner: 'Backend Dev',
    },
    {
        task: 'Metrics API endpoints',
        subtasks: [
            'GET /api/projects/:projectId/sprints/:sprintId/metrics',
            'GET /api/projects/:projectId/velocity',
            'GET /api/projects/:projectId/sprints/:sprintId/burndown',
        ],
        estimatedHours: 2,
        priority: 'HIGH',
        owner: 'Backend Dev',
    },
    {
        task: 'Display metrics on board',
        subtasks: [
            'Component: MetricsCard',
            'Show: total, completed, velocity',
            'Show: days remaining, points remaining',
        ],
        estimatedHours: 2,
        priority: 'HIGH',
        owner: 'Frontend Dev',
    },
    {
        task: 'Add charts',
        subtasks: [
            'Burndown chart (Chart.js)',
            'Velocity chart',
            'Status distribution pie chart',
        ],
        estimatedHours: 2,
        priority: 'MEDIUM',
        owner: 'Frontend Dev',
    },
];

// ============================================================================
// PHASE 5: POLISH & FIXES (Days 9-10) - 10 hours
// ============================================================================

/**
 * PHASE 5 OBJECTIVES:
 * ✓ Bug fixes from testing
 * ✓ Performance optimization
 * ✓ UI polish
 * ✓ Error handling improvements
 * ✓ Documentation
 * 
 * DELIVERABLES:
 * 1. Fully functional MVP
 * 2. No critical bugs
 * 3. Responsive design
 * 4. API documentation
 */

const PHASE_5_TASKS = [
    {
        task: 'Bug fixes & refactoring',
        subtasks: [
            'Fix reported issues',
            'Refactor duplicate code',
            'Add missing error handling',
        ],
        estimatedHours: 4,
        priority: 'CRITICAL',
        owner: 'Full Team',
    },
    {
        task: 'Performance optimization',
        subtasks: [
            'Add database indexes',
            'Optimize queries (pagination, projection)',
            'Cache frequently accessed data',
            'Optimize frontend rendering',
        ],
        estimatedHours: 2,
        priority: 'HIGH',
        owner: 'Backend Dev',
    },
    {
        task: 'UI Polish',
        subtasks: [
            'Responsive mobile design',
            'Accessibility improvements',
            'Consistent styling',
            'Better error messages',
        ],
        estimatedHours: 2,
        priority: 'MEDIUM',
        owner: 'Frontend Dev',
    },
    {
        task: 'Documentation',
        subtasks: [
            'API documentation (README or Postman)',
            'Database schema docs',
            'Code comments for complex logic',
        ],
        estimatedHours: 2,
        priority: 'MEDIUM',
        owner: 'Dev Lead',
    },
];

// ============================================================================
// TESTING STRATEGY
// ============================================================================

const TESTING_STRATEGY = {
    UNIT_TESTS: {
        issueWorkflow: 'Test all transitions, validation',
        sprintLogic: 'Test start/close, metrics calculation',
        coverage: '80% of business logic',
    },
    INTEGRATION_TESTS: {
        apis: 'Test all endpoints with real DB',
        workflows: 'Full user journeys',
        sprints: 'Sprint lifecycle end-to-end',
    },
    MANUAL_TESTS: {
        ui: 'Board drag-drop, form validation',
        performance: 'Load testing with 100+ issues',
        edge_cases: 'Closing sprint with blocked issues, reopening, etc.',
    },
};

// ============================================================================
// RISK MITIGATION
// ============================================================================

const RISKS = [
    {
        risk: 'Drag-drop performance with many issues',
        mitigation: 'Virtualization, pagination, lazy loading',
        probability: 'MEDIUM',
    },
    {
        risk: 'Metrics calculation complexity',
        mitigation: 'Pre-calculate and cache, background jobs',
        probability: 'LOW',
    },
    {
        risk: 'Sprint logic bugs (one active rule)',
        mitigation: 'Extensive testing, database constraints',
        probability: 'MEDIUM',
    },
    {
        risk: 'Real-time updates (other users moving issues)',
        mitigation: 'Add WebSocket or polling later, not MVP',
        probability: 'LOW',
    },
    {
        risk: 'Database queries too slow',
        mitigation: 'Add indexes, optimize queries early',
        probability: 'LOW',
    },
];

// ============================================================================
// SUCCESS CRITERIA
// ============================================================================

const SUCCESS_CRITERIA = [
    '✓ Can create project and sprints',
    '✓ Can create issues in backlog',
    '✓ Can start/close sprints',
    '✓ Can drag issues between status columns',
    '✓ Status transitions validated & enforced',
    '✓ Only one active sprint at a time',
    '✓ Metrics calculated correctly',
    '✓ No critical bugs',
    '✓ <2 second API response time',
    '✓ Responsive on mobile',
];

// ============================================================================
// DAILY STANDUP TEMPLATE
// ============================================================================

const DAILY_STANDUP = `
DAILY STANDUP TEMPLATE:

What did I complete yesterday?
- ...

What am I working on today?
- ...

Do I have any blockers?
- ...

Blockers:
- Database indexes slow: → Ask DB admin
- UI not updating: → Debug React state
- API timeout: → Check MongoDB queries

Current Phase: [Phase X/5]
Tasks completed: X/Y
On track: YES/NO
Blockers to resolve: [list]
`;

// ============================================================================
// SUMMARY TABLE
// ============================================================================

const IMPLEMENTATION_SUMMARY = {
    'Phase 1 - Foundation': '14 hours | Days 1-2',
    'Phase 2 - Sprints': '14 hours | Days 3-4',
    'Phase 3 - Drag & Drop': '12 hours | Days 5-6',
    'Phase 4 - Metrics': '10 hours | Days 7-8',
    'Phase 5 - Polish': '10 hours | Days 9-10',
    TOTAL: '60 hours | 7-10 business days (6-8 hrs/day)',
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    PHASE_1_TASKS,
    PHASE_2_TASKS,
    PHASE_3_TASKS,
    PHASE_4_TASKS,
    PHASE_5_TASKS,
    TESTING_STRATEGY,
    RISKS,
    SUCCESS_CRITERIA,
    DAILY_STANDUP,
    IMPLEMENTATION_SUMMARY,
};
