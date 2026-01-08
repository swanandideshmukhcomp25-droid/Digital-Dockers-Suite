# Issue Panel - Quick Reference for Developers

## 🎯 What Changed

The IssueDetailDrawer component now has:
1. **Optimistic UI updates** - Changes reflect immediately
2. **Workflow validation** - Status transitions are restricted
3. **Simple comments** - Add comments, see relative timestamps
4. **Activity tracking** - "Updated just now" vs "2 hours ago"
5. **AI hooks** - Buttons for Summarize, Suggest Action, Detect Risk

---

## 🚀 Key Functions

### Updating a Field
```javascript
// Status (with workflow validation)
handleUpdate('status', 'in_progress')

// Priority
handleUpdate('priority', 'high')

// Assignees (array)
handleUpdate('assignedTo', ['user_id_1', 'user_id_2'])

// Story Points (number)
handleUpdate('storyPoints', 8)
```

**What happens:**
1. Local state updates immediately (user sees change right away)
2. Spinner appears on the field
3. API call sent in background (non-blocking)
4. If success: keep change, hide spinner
5. If error: revert change, show error toast

---

### Adding a Comment
```javascript
handleAddComment()
```

**Flow:**
1. User types in textarea
2. Click "Post" button
3. Comment appends optimistically to list
4. API sends in background
5. "Posted..." becomes relative time once confirmed

---

### AI Actions (Mock Demo)
```javascript
// Each calls setAiInsights({ ... })
handleAISummarize()       // → AI summary panel
handleAISuggestAction()   // → suggested next step
handleAIDetectRisk()      // → potential risks
```

---

## 📋 Workflow Rules (Status Transitions)

```
todo ──→ in_progress ──┐
  ↑                   ↓
  └─── in_progress ← review ──→ done
       │              ↑
       └──────────────┘
```

**What's allowed:**
- ✅ todo → in_progress
- ✅ in_progress → review
- ✅ review → done
- ✅ review → in_progress (go back)
- ✅ done → in_progress (reopen)
- ✅ in_progress → todo (unstart)

**What's blocked:**
- ❌ todo → review (skip In Progress)
- ❌ todo → done (skip both)
- ❌ review → review (same)

---

## 🔧 State Structure

```javascript
currentIssue = {
    _id: "...",
    key: "PROJ-98",
    title: "Fix login bug",
    description: "...",
    status: "in_progress",      // todo, in_progress, review, done
    priority: "high",            // low, medium, high, critical
    issueType: "bug",            // task, bug, feature, story
    assignedTo: [
        { _id: "u1", fullName: "John Doe" }
    ],
    reporter: { _id: "u2", fullName: "Jane Smith" },
    sprint: { _id: "s1", name: "Sprint 5" },
    storyPoints: 5,
    dueDate: "2026-01-14T00:00:00Z",
    comments: [
        {
            _id: "c1",
            text: "Great work!",
            user: { fullName: "John" },
            timestamp: "2026-01-07T12:30:00Z"
        }
    ],
    history: [
        {
            field: "status",
            oldValue: "todo",
            newValue: "in_progress",
            updatedBy: { fullName: "John" },
            timestamp: "2026-01-07T12:00:00Z"
        }
    ],
    createdAt: "2026-01-06T10:00:00Z",
    updatedAt: "2026-01-07T12:30:00Z"
}
```

---

## 🔌 API Calls Made

### When user updates a field:
```
PATCH /api/tasks/:id
{
    "status": "in_progress"
    // or any field from currentIssue
}
```

Response includes full updated issue object.

### When user posts comment:
```
POST /api/tasks/:id/comments
{
    "text": "Comment text",
    "user": "user_id"
}
```

Response includes updated `comments` array.

---

## 🎨 UI Components Used

- **Drawer** - Right-side panel
- **Select** - Status, Priority, Assignee
- **Input** - Story Points (number)
- **TextArea** - Comment composition
- **List** - Comments display
- **Timeline** - Activity history
- **Card** - AI Assistant panel
- **Button** - Actions (Summarize, Suggest, Detect Risk)
- **Avatar** - User pictures
- **Tag** - Status/Priority badges
- **Space** - Layout spacing

---

## 🐛 Common Issues & Fixes

### "I changed status but it reverted"
→ API call failed, check Network tab for error response

### "Comment added but disappeared"
→ API didn't confirm, check console for error

### "Can't transition to this status"
→ Blocked by workflow rules, check WORKFLOW_RULES object

### "Spinner keeps spinning"
→ API hanging, check backend logs, might need timeout

### "AI buttons do nothing"
→ Expected - they're mocked for demo. Replace in Phase 2.

---

## 📝 To Add a New Editable Field

1. **Add to PATCH handler:**
```javascript
const handleUpdate = async (field, value) => {
    // ... existing validation ...
    
    // Add field-specific validation here if needed
    if (field === 'myNewField') {
        if (!isValidMyField(value)) return;
    }
    
    // ... rest of function handles it automatically
};
```

2. **Add to Descriptions items array:**
```javascript
const items = [
    // ... existing items ...
    {
        label: 'My New Field',
        children: (
            <Input
                value={currentIssue.myNewField}
                onChange={e => handleUpdate('myNewField', e.target.value)}
                disabled={loadingField === 'myNewField'}
            />
        )
    }
];
```

3. **That's it!** The rest is automatic:
   - Optimistic update
   - Loading spinner
   - Rollback on error
   - Updated timestamp

---

## 🚀 To Implement Real AI Endpoints

Replace mock code in `handleAISummarize`, `handleAISuggestAction`, `handleAIDetectRisk`:

```javascript
// Old (mock):
const mockSummary = `${title} is a...`;
setAiInsights({ summary: mockSummary });

// New (real API):
const response = await fetch('/api/ai/summarize-issue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        title: currentIssue.title,
        description: currentIssue.description,
        comments: currentIssue.comments,
        status: currentIssue.status
    })
});
const { summary } = await response.json();
setAiInsights({ summary });
```

---

## 📊 Performance Optimization Ideas

1. **Lazy load comments** - Load first 10, then paginate
2. **Lazy load history** - Load first 20 changes, then paginate
3. **Debounce story points** - Only send API after 1 sec delay
4. **Cache users list** - Don't refetch on every open
5. **Memoize workflow check** - Cache WORKFLOW_RULES lookup

---

## ✅ Testing Checklist

- [ ] Open issue drawer
- [ ] Change status (with valid transition)
- [ ] Try invalid status change (should warn)
- [ ] Change priority (should update)
- [ ] Add assignee (watch spinner)
- [ ] Change story points
- [ ] Post comment
- [ ] Close/reopen drawer (verify persistence)
- [ ] Check Network tab (verify PATCH/POST calls)
- [ ] Check browser console (no errors)
- [ ] Click AI buttons (see mock responses)
- [ ] Network offline → try edit → see rollback

---

## 🎁 Extra Features Implemented

1. **Relative timestamps** - "2 minutes ago" not "2026-01-07T12:30:00Z"
2. **Loading spinners** - Shows which field is updating
3. **Rollback on error** - Reverts optimistic update if API fails
4. **Activity history** - Read-only timeline of all changes
5. **Workflow visualization** - Checkmarks on valid transitions
6. **User info** - Reporter, assignees with avatars
7. **Comment formatting** - Preserves line breaks, handles long text

---

## 📞 Support

Issues or questions?

1. Check ISSUE_PANEL_IMPLEMENTATION.md for detailed docs
2. Search for TODO comments in IssueDetailDrawer.jsx
3. Look at API contracts in docs
4. Test with browser DevTools Network tab

---

Happy coding! 🎉
