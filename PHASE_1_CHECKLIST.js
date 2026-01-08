/**
 * ============================================================================
 * QUICK START GUIDE - Phase 1 Implementation
 * ============================================================================
 * 
 * You now have 3 complete service files + 1 controller:
 * ✓ issueWorkflow.js (backend/services/) - Status transition logic
 * ✓ sprintLogic.js (backend/services/) - Sprint management
 * ✓ API_ARCHITECTURE.js (backend/docs/) - Full API specification
 * ✓ issueController.js (backend/controllers/) - Phase 1 endpoints
 * ✓ IMPLEMENTATION_ROADMAP.js (backend/docs/) - 7-10 day plan
 * 
 * THIS IS YOUR NEXT 4-HOUR CHECKLIST:
 */

// ============================================================================
// STEP 1: Wire up the Issue Controller (30 minutes)
// ============================================================================

console.log(`
STEP 1: Register Issue Controller in App

Location: backend/app.js or backend/server.js

Add these lines:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Add near the top with other requires
const issueController = require('./controllers/issueController');

// Add after auth middleware (IMPORTANT!)
app.use('/api', authMiddleware);  // This should set req.user from JWT
app.use('/api', issueController);

// If you don't have auth middleware yet, create one:
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next();  // Allow for now, will fail in controller if needed
  
  // TODO: Verify JWT token and set req.user
  // const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // req.user = { id: decoded.userId, email: decoded.email };
  
  next();
};

app.use('/api', authMiddleware);
app.use('/api', issueController);
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Test: curl http://localhost:5000/api/issues/test
  Should return 404 (issue not found) not 500
`);

// ============================================================================
// STEP 2: Verify Task Model Has All Required Fields (30 minutes)
// ============================================================================

console.log(`
STEP 2: Check Task Model (backend/models/Task.js)

Make sure it has ALL these fields:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const taskSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },              // PROJ-1
  title: { type: String, required: true },                          // Issue title
  description: { type: String, default: '' },                       // Full text
  projectId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Which project
  sprintId: { type: mongoose.Schema.Types.ObjectId, default: null },   // Which sprint (null = backlog)
  
  // Status workflow
  status: { 
    type: String, 
    enum: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'],
    default: 'BACKLOG'
  },
  
  // Issue classification
  issueType: { 
    type: String, 
    enum: ['BUG', 'FEATURE', 'TASK', 'EPIC'],
    required: true 
  },
  priority: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  
  // Metadata
  storyPoints: { type: Number, default: 0 },
  assigneeId: { type: mongoose.Schema.Types.ObjectId, default: null },
  blockedReason: { type: String, default: null },
  
  // Tracking dates
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  startDate: { type: Date, default: null },           // When moved to IN_PROGRESS
  completedDate: { type: Date, default: null },       // When moved to DONE
  statusChangedAt: { type: Date, default: null },     // Last status change
  statusChangedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
});

// Create indexes for performance
taskSchema.index({ projectId: 1 });
taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ sprintId: 1 });
taskSchema.index({ key: 1 });

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If any fields are missing, add them now!
`);

// ============================================================================
// STEP 3: Test Issue Creation via Postman/curl (1 hour)
// ============================================================================

console.log(`
STEP 3: Test Create Issue Endpoint

POSTMAN REQUEST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

POST http://localhost:5000/api/projects/YOUR_PROJECT_ID/issues

Headers:
  Content-Type: application/json
  Authorization: Bearer YOUR_JWT_TOKEN

Body (JSON):
{
  "title": "Fix login button not working",
  "description": "The login button on homepage doesn't respond to clicks",
  "issueType": "BUG",
  "priority": "HIGH",
  "assigneeId": null
}

EXPECTED RESPONSE:
{
  "success": true,
  "issue": {
    "id": "...",
    "key": "PROJ-1",
    "title": "Fix login button not working",
    "status": "BACKLOG",
    "issueType": "BUG",
    "priority": "HIGH",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CURL COMMAND (if you don't have Postman):
curl -X POST http://localhost:5000/api/projects/PROJECT_ID/issues \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer TOKEN" \\
  -d '{
    "title": "Test issue",
    "description": "Test",
    "issueType": "TASK",
    "priority": "MEDIUM"
  }'

TEST CASES:
1. Create issue (should work)
2. Create issue with missing title (should fail with 400)
3. Create issue with invalid issueType (should fail with 400)
4. Create issue without auth header (should fail with 401)
5. Create issue for non-existent project (should fail with 404)

✓ When all tests pass, move to Step 4
`);

// ============================================================================
// STEP 4: Test Move Issue (Drag & Drop) - The Critical Endpoint (1.5 hours)
// ============================================================================

console.log(`
STEP 4: Test Move Issue Endpoint (Core Drag-Drop)

POSTMAN REQUEST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PUT http://localhost:5000/api/issues/ISSUE_ID/move

Headers:
  Content-Type: application/json
  Authorization: Bearer YOUR_JWT_TOKEN

Body (JSON):
{
  "status": "TODO"
}

EXPECTED RESPONSE:
{
  "success": true,
  "issue": {
    "id": "...",
    "key": "PROJ-1",
    "title": "...",
    "status": "TODO",
    "startDate": null,
    "statusChangedAt": "2024-01-15T11:00:00Z"
  }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WORKFLOW VALIDATION TEST:
Issue starts in: BACKLOG
Allowed next statuses: TODO, BLOCKED

Try moving to each:
1. BACKLOG → TODO (should succeed)
2. BACKLOG → DONE (should FAIL - not allowed)
3. BACKLOG → IN_PROGRESS (should FAIL - not allowed)

EXPECTED ERROR:
{
  "success": false,
  "code": "INVALID_TRANSITION",
  "message": "Cannot move from BACKLOG to DONE",
  "currentStatus": "BACKLOG",
  "requestedStatus": "DONE",
  "allowedTransitions": ["TODO", "BLOCKED"]
}

FULL WORKFLOW TEST SEQUENCE:
BACKLOG → TODO → IN_PROGRESS → IN_REVIEW → DONE ✓

✓ When validation works correctly, move to Step 5
`);

// ============================================================================
// STEP 5: Update Task Component to Use API (1 hour)
// ============================================================================

console.log(`
STEP 5: Update TaskBoard to Call API on Drag-Drop

Current Code (frontend/src/components/TaskBoard.jsx):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Look for handleDragEnd function:

const handleDragEnd = async (result) => {
  const { source, destination, draggableId } = result;
  
  if (!destination) return;
  if (source.droppableId === destination.droppableId) return;
  
  const sourceStatus = source.droppableId;
  const destStatus = destination.droppableId;
  const issueId = draggableId;
  
  try {
    // Optimistic UI update
    setIssues(prevIssues => {
      // Move issue in state
      ...
    });
    
    // Call API
    const response = await axios.put(
      \`/api/issues/\${issueId}/move\`,
      { status: destStatus },
      { headers: { Authorization: \`Bearer \${localStorage.getItem('token')}\` } }
    );
    
    if (!response.data.success) {
      // Rollback UI
      loadIssues(); // Reload from server
      message.error(response.data.message);
    }
  } catch (error) {
    console.error('Error moving issue:', error);
    loadIssues(); // Reload on error
    message.error('Failed to move issue');
  }
};

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Test drag & drop in the UI - should call API and show success/error
`);

// ============================================================================
// DONE - Phase 1 Complete!
// ============================================================================

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ PHASE 1 COMPLETE (4 hours)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT YOU NOW HAVE:
1. ✓ Issue CRUD (create, read, update, move)
2. ✓ Workflow validation (BACKLOG → TODO → ... → DONE)
3. ✓ Auto-generated issue keys (PROJ-1, PROJ-2, etc.)
4. ✓ Drag-drop endpoint that validates transitions
5. ✓ API error handling

WHAT'S NEXT (Phase 2 - Days 3-4):
1. Implement Sprint endpoints (create, list, start, close)
2. Implement Sprint board view
3. Implement sprint metrics

FILES YOU HAVE:
- /backend/services/issueWorkflow.js (Workflow logic)
- /backend/services/sprintLogic.js (Sprint logic)
- /backend/controllers/issueController.js (Phase 1 endpoints)
- /backend/docs/API_ARCHITECTURE.js (Full API spec)
- /backend/docs/IMPLEMENTATION_ROADMAP.js (7-10 day plan)

NEXT ACTION:
→ Move this message and checklist to a shared document
→ Distribute to your team
→ Start Phase 1 implementation
→ Each completed task = ✓ mark and move on
→ After 4 hours, ask for Phase 2 controller code

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
