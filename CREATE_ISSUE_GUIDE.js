/**
 * ============================================================================
 * CREATE ISSUE - COMPLETE END-TO-END DEBUGGING GUIDE
 * ============================================================================
 * 
 * Problem: Create Issue button does nothing
 * 
 * Root Cause: TaskBoard.jsx does NOT import/use CreateModal component
 * 
 * Solution: Wire up Create Issue in 3 steps (15 minutes)
 */

// ============================================================================
// STEP 1: FRONTEND FLOW (React)
// ============================================================================

/*
EXACT FLOW:
1. User clicks "+ Create Issue" button
   ↓
2. Modal opens with form fields:
   - Title (required, text)
   - Description (optional, textarea)
   - Issue Type (BUG, TASK, FEATURE, EPIC)
   - Priority (lowest, low, medium, high, highest)
   - Sprint (dropdown - optional, backlog if null)
   - Assignee (optional)
   - Story Points (optional)
   ↓
3. User fills form and clicks "Create"
   ↓
4. Frontend validates fields
   ↓
5. POST /api/issues with body
   ↓
6. Backend saves and returns issue with key (e.g., DDS-9)
   ↓
7. Frontend optimistically adds issue to board
   ↓
8. Modal closes, board refreshes
*/

// ============================================================================
// STEP 2: FIX TaskBoard.jsx - ADD MODAL
// ============================================================================

/*
FILE: frontend/src/components/tasks/TaskBoard.jsx

CHANGES:
1. Import CreateIssueModal at top
2. Add state for modal open/close
3. Add onClick handler to button
4. Render modal at bottom
*/

// AT TOP OF FILE, add this import:
import CreateIssueModal from './CreateIssueModal';

// INSIDE TaskBoard component, after other useState:
const [createModalOpen, setCreateModalOpen] = useState(false);

// CHANGE the Create Issue button from:
// <Button type="primary" icon={<PlusOutlined />}>Create Issue</Button>
// TO:
// <Button 
//   type="primary" 
//   icon={<PlusOutlined />}
//   onClick={() => setCreateModalOpen(true)}
// >
//   Create Issue
// </Button>

// AT BOTTOM of component (before final </> closing div), add:
// <CreateIssueModal 
//   open={createModalOpen} 
//   onClose={() => setCreateModalOpen(false)}
//   onIssueCreated={() => {
//     loadSprintIssues(); // Refresh board
//     setCreateModalOpen(false);
//   }}
// />

// ============================================================================
// STEP 3: CREATE CreateIssueModal.jsx COMPONENT
// ============================================================================

/*
FILE: frontend/src/components/tasks/CreateIssueModal.jsx

NEW FILE - Copy the code below
*/

// ============================================================================
// STEP 4: FIX BACKEND API - Ensure POST /api/issues exists
// ============================================================================

/*
The backend taskController.createTask already exists at:
backend/controllers/taskController.js

But we need to make sure the endpoint is registered.

Check: backend/server.js has this line:
app.use('/api/tasks', require('./routes/taskRoutes'));

The taskRoutes.js has:
router.post('/', protect, createTask);

So POST /api/tasks works, BUT frontend calls POST /api/issues

FIX: We need either:
A) Frontend should call /api/tasks (not /api/issues)
B) Backend should add /api/issues route pointing to same controller

RECOMMENDATION: Use Option A - change frontend to call /api/tasks

The taskService.createTask already uses POST /api/tasks ✓
*/

// ============================================================================
// API CONTRACT
// ============================================================================

/*
ENDPOINT: POST /api/tasks
(Uses taskService.createTask which already exists)

REQUEST BODY:
{
  "title": "Fix login button",
  "description": "Button not clickable on mobile",
  "projectId": "6956615c6baa742aa3a410ff",
  "priority": "high",
  "issueType": "bug",
  "sprintId": "6956615c6baa742aa3a41103",  // null for backlog
  "assignedTo": ["user123"],               // optional
  "deadline": "2024-01-20T23:59:59Z",      // optional
  "storyPoints": 5                         // optional
}

RESPONSE (201 Created):
{
  "_id": "issue456",
  "key": "DDS-9",
  "title": "Fix login button",
  "description": "...",
  "status": "todo",
  "priority": "high",
  "issueType": "bug",
  "projectId": "6956615c6baa742aa3a410ff",
  "sprintId": "6956615c6baa742aa3a41103",
  "assignedTo": ["user123"],
  "createdAt": "2024-01-15T10:30:00Z"
}

ERRORS:
- 400: Missing required fields (title)
- 401: Not authenticated
- 404: Project not found
*/

// ============================================================================
// OPTIMISTIC UI UPDATE PATTERN
// ============================================================================

/*
Why: Issues appear instantly on board while API call happens in background

HOW IT WORKS:
1. User submits form
2. Generate temporary issue object with temp ID
3. Add temp issue to boardData state IMMEDIATELY (looks created)
4. Call API in background
5. On success: Replace temp issue with real issue (with key like DDS-9)
6. On error: Remove temp issue from board, show error message
*/

const handleCreateIssueOptimistic = async (formValues) => {
  // Step 1: Generate temp issue
  const tempId = 'temp-' + Date.now();
  const tempIssue = {
    _id: tempId,
    key: 'DDS-?',
    title: formValues.title,
    status: 'todo',
    priority: formValues.priority,
    issueType: formValues.issueType,
    assignedTo: formValues.assignedTo,
    // ... other fields
  };

  // Step 2: Add to board immediately
  setIssues([...issues, tempIssue]);
  setBoardData(prev => ({
    ...prev,
    todo: [...(prev.todo || []), tempIssue]
  }));

  try {
    // Step 3: Call API
    const response = await taskService.createTask({
      ...formValues,
      projectId: currentProject._id,
      sprintId: activeSprint?._id
    });

    // Step 4: Replace temp with real
    const realIssue = response.data || response;
    setIssues(issues.map(i => i._id === tempId ? realIssue : i));
    setBoardData(prev => ({
      ...prev,
      todo: prev.todo.map(i => i._id === tempId ? realIssue : i)
    }));

    message.success(`Created ${realIssue.key}`);
  } catch (error) {
    // Step 5: Remove on error
    setIssues(issues.filter(i => i._id !== tempId));
    setBoardData(prev => ({
      ...prev,
      todo: prev.todo.filter(i => i._id !== tempId)
    }));
    message.error('Failed to create issue');
  }
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

/*
Frontend Form Validation (Ant Form):
- title: required, min 3 chars
- priority: required, must be in [lowest, low, medium, high, highest]
- issueType: required, must be in [bug, task, feature, epic]
- sprintId: optional (null means backlog)

Backend Validation (taskController):
- title: required, must be string
- projectId: required, must be valid ObjectId
- All other fields optional but typed
*/

// ============================================================================
// 30-MINUTE IMPLEMENTATION CHECKLIST
// ============================================================================

const CHECKLIST = `
⏱️ 30-MINUTE QUICK FIX:

[ 5 min] Read this file to understand flow
[10 min] Create CreateIssueModal.jsx (copy code below)
[ 3 min] Update TaskBoard.jsx (add 3 import/state/onClick)
[ 5 min] Test in browser - click Create Issue
[ 3 min] Fill form and submit
[ 2 min] Verify issue appears on board with key (DDS-9)
[ 2 min] Check browser console for any errors

TOTAL: ~30 minutes to working Create Issue
`;

module.exports = {
  CHECKLIST,
};
