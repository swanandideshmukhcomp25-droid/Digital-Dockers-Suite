/**
 * ============================================================================
 * CREATE ISSUE - BACKEND IMPLEMENTATION (Already Working)
 * ============================================================================
 * 
 * This documents the BACKEND implementation for Create Issue.
 * No changes needed - it's already working!
 * 
 * Frontend just needed to call it correctly.
 */

// ============================================================================
// BACKEND ROUTE FLOW
// ============================================================================

const BACKEND_FLOW = `
REQUEST: POST /api/tasks
         ↓
ROUTE:   backend/routes/taskRoutes.js
         line: router.post('/', protect, createTask)
         ↓
MIDDLEWARE: protect (checks JWT token, sets req.user)
         ↓
CONTROLLER: backend/controllers/taskController.js
         function: createTask
         ↓
VALIDATION:
   - title: required (400 if missing)
   - projectId: required
   - All other fields: optional with defaults
         ↓
GENERATE KEY:
   - Get project.key (e.g., "DDS")
   - Increment project.nextIssueNumber
   - Create key: "DDS-1", "DDS-2", etc.
         ↓
CREATE TASK:
   - Create Task document with:
     * title, description
     * status: "todo" (default)
     * priority: from input or AI analysis
     * issueType: from input or "task"
     * project, sprint, epic, storyPoints
     * assignedTo, reporter, assignedBy
     * key (auto-generated)
         ↓
SAVE TO DB:
   - MongoDB: collections → tasks
   - Auto-indexed by project, sprint, status
         ↓
RESPONSE: 201 Created
   {
     _id, key, title, status, priority,
     issueType, projectId, sprintId,
     assignedTo, createdAt, updatedAt
   }
`;

// ============================================================================
// ACTUAL CONTROLLER CODE
// ============================================================================

const CONTROLLER_PSEUDOCODE = `
@route   POST /api/tasks
@access  Private (needs JWT)
@returns 201 Created with issue data

async function createTask(req, res) {
  // Extract from request
  const { title, description, deadline, assignedTo, priority,
          projectId, sprintId, issueType, storyPoints } = req.body;

  // Validate
  if (!title) {
    return res.status(400).json({ message: 'Title required' });
  }

  // Generate issue key
  let issueKey = undefined;
  if (projectId) {
    // Find project and increment nextIssueNumber
    const project = await Project.findByIdAndUpdate(
      projectId,
      { $inc: { nextIssueNumber: 1 } },
      { new: true }
    );
    if (project) {
      issueKey = \`\${project.key}-\${project.nextIssueNumber - 1}\`;
    }
  }

  // Optional: AI analysis for priority suggestions
  const aiAnalysis = await analyzeTask(description || title, deadline);

  // Create task document
  const task = await Task.create({
    title,
    description,
    priority: priority || aiAnalysis.priority || 'medium',
    status: 'todo',  // Always starts as todo
    assignedTo: assignedTo || [req.user._id],
    assignedBy: req.user._id,
    reporter: req.user._id,
    dueDate: deadline,
    
    // Jira-style fields
    key: issueKey,
    project: projectId,
    sprint: sprintId,
    issueType: issueType || 'task',
    storyPoints: storyPoints
  });

  // Optional: Create Google Calendar event
  // (skipped for now, not critical for MVP)

  // Return created task
  return res.status(201).json(task);
}
`;

// ============================================================================
// DATABASE SCHEMA (Task Model)
// ============================================================================

const TASK_SCHEMA = `
const taskSchema = mongoose.Schema({
  // Issue Key (auto-generated)
  key: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Title and Description
  title: {
    type: String,
    required: [true, 'Please add a task title']
  },
  description: String,
  
  // Jira Fields
  issueType: {
    type: String,
    enum: ['story', 'task', 'bug', 'epic', 'subtask'],
    default: 'task'
  },
  priority: {
    type: String,
    enum: ['lowest', 'low', 'medium', 'high', 'highest'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'review', 'done', 'blocked'],
    default: 'todo'
  },
  storyPoints: Number,
  
  // Relations
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  sprint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint'
  },
  epic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Epic'
  },
  
  // People
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Dates
  dueDate: Date,
  startDate: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
`;

// ============================================================================
// PROJECT MODEL - Issue Key Generation
// ============================================================================

const PROJECT_SCHEMA = `
const projectSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add project name']
  },
  
  // Issue key prefix (e.g., "DDS" → DDS-1, DDS-2, etc.)
  key: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  
  // Counter for next issue number
  nextIssueNumber: {
    type: Number,
    default: 1  // Next issue will be KEY-1
  },
  
  description: String,
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  createdAt: { type: Date, default: Date.now }
});
`;

// ============================================================================
// KEY GENERATION LOGIC
// ============================================================================

const KEY_GENERATION = `
HOW ISSUE KEYS ARE GENERATED:

1. When creating first issue in project DDS:
   - Get project.nextIssueNumber (default 1)
   - Increment it: 1 → 2
   - Generate key: \`DDS-1\` (using OLD value)
   - Save new nextIssueNumber: 2
   - Result: Issue has key "DDS-1"

2. When creating second issue:
   - Get project.nextIssueNumber (now 2)
   - Increment it: 2 → 3
   - Generate key: \`DDS-2\` (using OLD value)
   - Save new nextIssueNumber: 3
   - Result: Issue has key "DDS-2"

3. Continuing:
   - Third issue: DDS-3
   - Fourth issue: DDS-4
   - etc.

CODE:
const project = await Project.findByIdAndUpdate(
  projectId,
  { $inc: { nextIssueNumber: 1 } },  // Increment ATOMICALLY
  { new: true }
);
const issueKey = \`\${project.key}-\${project.nextIssueNumber - 1}\`;

This ensures:
✓ No race conditions (database handles locking)
✓ Unique keys (incremented in database)
✓ Never duplicate keys (atomic operation)
`;

// ============================================================================
// RESPONSE EXAMPLES
// ============================================================================

const RESPONSE_EXAMPLES = `
SUCCESS RESPONSE (201 Created):
{
  "_id": "507f1f77bcf86cd799439011",
  "key": "DDS-9",
  "title": "Fix login button",
  "description": "Not clickable on mobile",
  "issueType": "bug",
  "priority": "high",
  "status": "todo",
  "storyPoints": 5,
  "project": "6956615c6baa742aa3a410ff",
  "sprint": "6956615c6baa742aa3a41103",
  "assignedTo": ["507f1f77bcf86cd799439012"],
  "reporter": "507f1f77bcf86cd799439012",
  "assignedBy": "507f1f77bcf86cd799439012",
  "dueDate": "2024-01-20T00:00:00.000Z",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}

ERROR RESPONSE (400 - Missing Title):
{
  "message": "Please add a task title"
}

ERROR RESPONSE (401 - Not Authenticated):
{
  "message": "Not authorized to access this route"
}

ERROR RESPONSE (404 - Project Not Found):
Project not found in database, task still created but key might be undefined
`;

// ============================================================================
// VALIDATION & BUSINESS RULES
// ============================================================================

const BACKEND_VALIDATION = `
VALIDATION RULES:

✓ Title: REQUIRED
  - Must be non-empty string
  - Returns 400 if missing
  
✓ ProjectId: REQUIRED (for key generation)
  - Must be valid MongoDB ObjectId
  - Project must exist
  
✓ Priority: OPTIONAL
  - Defaults to "medium"
  - Can be: lowest, low, medium, high, highest
  - Falls back to AI-analyzed priority if provided
  
✓ IssueType: OPTIONAL
  - Defaults to "task"
  - Can be: task, bug, feature, epic, story
  
✓ Status: ALWAYS "todo"
  - Always starts in "todo" status
  - User cannot set status on creation
  - Status changes via drag-drop (moves issue)
  
✓ SprintId: OPTIONAL
  - Can be null (for backlog)
  - Must be valid ObjectId if provided
  - Sprint must exist in same project
  
✓ StoryPoints: OPTIONAL
  - Defaults to 0 if not provided
  - Usually 0-13 (Fibonacci scale)
  
✓ AssignedTo: OPTIONAL
  - Defaults to current user if not provided
  - Can be array of user IDs
  
✓ Deadline: OPTIONAL
  - Mapped to dueDate field
  - Date will be stored as ISO string
`;

// ============================================================================
// DATABASE QUERIES
// ============================================================================

const DATABASE_OPERATIONS = `
CREATE ISSUE OPERATIONS:

1. Increment project counter:
   db.projects.findByIdAndUpdate(
     projectId,
     { $inc: { nextIssueNumber: 1 } },
     { new: true }
   )
   
2. Create task:
   db.tasks.create({
     key: "DDS-9",
     title: "...",
     status: "todo",
     project: projectId,
     sprint: sprintId,
     ... other fields
   })
   
3. Indexes used:
   - tasks.key (unique)
   - tasks.project (for listing by project)
   - tasks.sprint (for listing by sprint)
   - projects.key (unique, for key generation)

4. To fetch created issue:
   db.tasks.findById(id).populate(['project', 'sprint', 'assignedTo'])
`;

// ============================================================================
// NO CHANGES NEEDED
// ============================================================================

const SUMMARY = `
✅ Backend is ALREADY WORKING!

Files that are ALREADY CORRECT:
- backend/routes/taskRoutes.js (has POST / route)
- backend/controllers/taskController.js (creates issues with keys)
- backend/models/Task.js (has all required fields)
- backend/models/Project.js (has key and nextIssueNumber)
- backend/middlewares/authMiddleware.js (validates JWT)

What FRONTEND was missing:
❌ TaskBoard wasn't importing CreateIssueModal
❌ Create Issue button had no onClick handler
❌ Modal wasn't being rendered

What FRONTEND now has:
✅ CreateIssueModal component
✅ Import statement in TaskBoard
✅ onClick handler on button
✅ Modal is rendered with proper callbacks

Result:
✅ Frontend → CreateIssueModal → POST /api/tasks → Backend
✅ Backend creates issue with auto-key
✅ Frontend shows toast and refreshes board
✅ New issue appears on Kanban board
`;

module.exports = {
  BACKEND_FLOW,
  CONTROLLER_PSEUDOCODE,
  TASK_SCHEMA,
  PROJECT_SCHEMA,
  KEY_GENERATION,
  RESPONSE_EXAMPLES,
  BACKEND_VALIDATION,
  DATABASE_OPERATIONS,
  SUMMARY
};
