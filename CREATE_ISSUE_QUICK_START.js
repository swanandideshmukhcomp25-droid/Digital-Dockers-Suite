/**
 * ============================================================================
 * CREATE ISSUE - QUICK START (5 MINUTE SUMMARY)
 * ============================================================================
 * 
 * PROBLEM: "+ Create Issue" button does nothing
 * 
 * ROOT CAUSE: TaskBoard component wasn't wired to modal
 * 
 * SOLUTION APPLIED: 
 * ✅ Fixed TaskBoard.jsx (add 3 imports/state)
 * ✅ Created CreateIssueModal.jsx (form component)
 * ✅ Backend already works (no changes needed)
 */

// ============================================================================
// WHAT TO DO NOW
// ============================================================================

const NEXT_STEPS = `
1️⃣  RELOAD BROWSER (Vite auto-reloaded, but refresh to be sure)
    Refresh: Ctrl+R or Cmd+R
    
2️⃣  LOGIN
    Email: test@example.com
    Password: password123
    
3️⃣  GO TO DASHBOARD → TASKS
    
4️⃣  CLICK "+ CREATE ISSUE" BUTTON
    Modal should pop up
    
5️⃣  FILL FORM
    Title: "Test Issue" (required)
    Type: "Task" (or Bug, Feature, Epic)
    Priority: "Medium" (or any)
    Sprint: "Current Sprint" (or leave empty)
    Story Points: 5 (or leave empty)
    
6️⃣  CLICK "CREATE"
    Should show green toast: "Created DDS-9"
    Issue appears on board
    
7️⃣  VERIFY
    - Issue visible in Backlog column
    - Has key like "DDS-9"
    - Can drag to other columns
    - Persists after page refresh
`;

// ============================================================================
// FILES CHANGED
// ============================================================================

const FILES_CHANGED = {
  MODIFIED: [
    "frontend/src/components/tasks/TaskBoard.jsx"
  ],
  CREATED: [
    "frontend/src/components/tasks/CreateIssueModal.jsx"
  ],
  UNCHANGED: [
    "backend/controllers/taskController.js (already works)",
    "backend/models/Task.js (already has all fields)",
    "backend/routes/taskRoutes.js (already registered)"
  ]
};

// ============================================================================
// KEY CHANGES IN TaskBoard.jsx
// ============================================================================

const TASKBOARD_CHANGES = `
ADDED AT TOP:
import CreateIssueModal from './CreateIssueModal';

ADDED STATE:
const [createModalOpen, setCreateModalOpen] = useState(false);

UPDATED BUTTON:
<Button 
  type="primary" 
  icon={<PlusOutlined />}
  onClick={() => setCreateModalOpen(true)}  // ← NEW
>
  Create Issue
</Button>

ADDED AT BOTTOM:
<CreateIssueModal 
  open={createModalOpen} 
  onClose={() => setCreateModalOpen(false)}
  onIssueCreated={() => {
    loadSprintIssues();
    setCreateModalOpen(false);
  }}
/>
`;

// ============================================================================
// HOW THE FORM WORKS
// ============================================================================

const FORM_LOGIC = `
1. User opens modal
   ↓
2. Fills form fields:
   - title (REQUIRED)
   - description (optional)
   - issueType (REQUIRED, defaults to "task")
   - priority (REQUIRED, defaults to "medium")
   - sprintId (optional, uses activeSprint if set, else null=backlog)
   - storyPoints (optional, defaults to 0)
   ↓
3. Clicks "Create"
   ↓
4. Form validates:
   - title must be 3+ characters
   - Other fields type-checked
   ↓
5. API Call:
   POST /api/tasks
   {
     title: "...",
     description: "...",
     projectId: currentProject._id,
     sprintId: selectedSprint._id (or null),
     priority: "...",
     issueType: "...",
     storyPoints: 5
   }
   ↓
6. Backend:
   - Generates key (DDS-9)
   - Saves to MongoDB
   - Returns with key and metadata
   ↓
7. Frontend:
   - Shows success toast
   - Refreshes board data
   - Closes modal
   - New issue appears in board
`;

// ============================================================================
// API CONTRACT (BACKEND)
// ============================================================================

const API_CONTRACT = `
ENDPOINT: POST /api/tasks
AUTH: Required (Bearer token)

REQUEST:
{
  "title": "Fix login button",
  "description": "Not clickable on mobile",
  "projectId": "6956615c6baa742aa3a410ff",
  "sprintId": "6956615c6baa742aa3a41103",  // null for backlog
  "priority": "high",
  "issueType": "bug",
  "storyPoints": 5
}

RESPONSE (201):
{
  "_id": "issue789",
  "key": "DDS-9",
  "title": "Fix login button",
  "status": "todo",
  "priority": "high",
  "issueType": "bug",
  "projectId": "6956615c6baa742aa3a410ff",
  "sprintId": "6956615c6baa742aa3a41103",
  "storyPoints": 5,
  "createdAt": "2024-01-15T10:30:00Z"
}

ERRORS:
- 400: Missing title or invalid fields
- 401: Not authenticated
- 404: Project not found
`;

// ============================================================================
// TROUBLESHOOTING
// ============================================================================

const TROUBLESHOOTING = `
❌ Modal doesn't open
→ Check browser console (F12) for errors
→ Verify onClick is attached to button
→ Try refreshing page (Ctrl+R)

❌ Form won't submit
→ Check title is filled in
→ Check browser console for errors
→ Check Network tab (F12) → see POST request

❌ Issue created but not visible
→ Check if it's in backlog or active sprint
→ Check filters at top (search, type, priority)
→ Refresh page (Ctrl+R)

❌ Error "Please select a project first"
→ Login again
→ Make sure you selected a project
→ Check ProjectContext is loaded

❌ Key is undefined (no DDS-9)
→ Check backend logs for error
→ Make sure project has key and nextIssueNumber
→ Run seed script: node backend/scripts/seedData.js

❌ API error 500
→ Check backend console for error
→ Make sure MongoDB is connected
→ Check all required fields are sent
`;

// ============================================================================
// VALIDATION RULES
// ============================================================================

const VALIDATION = `
FRONTEND (Form validation):
✓ Title: required, min 3 chars, max 100
✓ Description: optional, max 500
✓ Type: required, enum [bug, task, feature, epic]
✓ Priority: required, enum [lowest, low, medium, high, highest]
✓ Sprint: optional (null for backlog)
✓ Points: optional, 0-13

BACKEND (Controller validation):
✓ Title: required (if missing returns 400)
✓ ProjectId: required
✓ All other fields: optional with defaults
✓ Auto-generates issue key (PROJECT_KEY-NUMBER)
`;

// ============================================================================
// TEST DATA
// ============================================================================

const TEST_DATA = `
Login Credentials:
- Email: test@example.com
- Password: password123

Project:
- Name: Digital Dockers Suite
- Key: DDS
- Has sprints: Current Sprint (active)

Sample Tasks (from seed):
- DDS-1: Fix login button UI
- DDS-2: Implement Kanban board
- DDS-3: Add user authentication
- ... and more

New Issues Created By You:
- Will be DDS-9, DDS-10, DDS-11, etc.
- Will show in Backlog or selected sprint
- Can be dragged between columns
`;

module.exports = {
  NEXT_STEPS,
  FILES_CHANGED,
  TASKBOARD_CHANGES,
  FORM_LOGIC,
  API_CONTRACT,
  TROUBLESHOOTING,
  VALIDATION,
  TEST_DATA
};
