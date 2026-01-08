# Issue Panel - Complete Code Examples

## Example 1: Updating a Field (Optimistic Update)

### Step-by-Step Flow

```javascript
// User selects new status from dropdown
<Select
    value={currentIssue.status}
    onChange={v => handleUpdate('status', v)}
    options={[...]}
/>

// handleUpdate is called with:
// field = 'status'
// value = 'in_progress'

const handleUpdate = async (field, value) => {
    // STEP 1: Validate workflow rules
    if (field === 'status') {
        if (!isValidStatusTransition(currentIssue.status, value)) {
            message.warning(`Cannot transition from ${currentIssue.status} to ${value}`);
            return; // Don't proceed
        }
    }

    // STEP 2: Save original value for rollback
    const originalValue = currentIssue[field];
    
    // STEP 3: Update UI immediately (optimistic)
    setCurrentIssue(prev => ({
        ...prev,
        [field]: value,
        updatedAt: new Date().toISOString() // Mark as just updated
    }));

    // STEP 4: Show loading spinner on this field
    setLoadingField(field);

    try {
        // STEP 5: Call API in background (non-blocking)
        const updated = await taskService.updateTask(currentIssue._id, { 
            [field]: value 
        });
        
        // STEP 6: Sync with server response (verify it matches)
        setCurrentIssue(updated);
        message.success(`${field} updated`);
    } catch (error) {
        // STEP 7: Error? Revert the optimistic update
        setCurrentIssue(prev => ({
            ...prev,
            [field]: originalValue,
            updatedAt: originalIssueRef.current.updatedAt
        }));
        message.error(`Failed to update ${field}`);
        console.error('Update error:', error);
    } finally {
        // STEP 8: Hide loading spinner
        setLoadingField(null);
    }
};
```

### User Experience Timeline

```
Time    UI State              What Happened
────────────────────────────────────────────────
T+0ms   status: "todo"        User clicks dropdown
T+10ms  status: "in_progress" UI updates immediately (optimistic)
        [spinner visible]
T+50ms  [API request sent]    PATCH /api/tasks/:id
T+200ms [waiting...]          Server processing
T+250ms status: "in_progress" API confirms ✓
        [spinner hidden]
        message: "status updated"
```

---

## Example 2: Comment Submission

### User Posts Comment

```jsx
// UI Component
<div style={{ display: 'flex', gap: 12 }}>
    <Avatar>{user?.fullName?.[0]}</Avatar>
    <div style={{ flex: 1 }}>
        <TextArea
            placeholder="Add a comment..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            disabled={sending}
        />
        {comment && (
            <div style={{ marginTop: 8 }}>
                <Button 
                    type="primary" 
                    onClick={handleAddComment} 
                    loading={sending}
                >
                    {sending ? 'Posting...' : 'Post'}
                </Button>
            </div>
        )}
    </div>
</div>
```

### Handler Function

```javascript
const handleAddComment = async () => {
    // Validate
    if (!comment.trim()) return;
    
    setSending(true);
    
    try {
        // API call
        const updated = await taskService.addComment(currentIssue._id, {
            text: comment.trim(),
            user: user._id
        });

        // Update UI optimistically
        setCurrentIssue(prev => ({
            ...prev,
            comments: updated.comments || [
                ...prev.comments || [],
                {
                    _id: Date.now(),                    // Temp ID
                    text: comment,
                    user: user,
                    timestamp: new Date().toISOString() // Now
                }
            ],
            updatedAt: new Date().toISOString() // Mark issue as updated
        }));

        // Clear input
        setComment('');
        
        // Show success
        message.success('Comment added');
    } catch (error) {
        console.error('Failed to add comment:', error);
        message.error('Failed to add comment');
    } finally {
        setSending(false);
    }
};
```

### Display Comments with Relative Time

```jsx
<List
    dataSource={currentIssue.comments || []}
    locale={{ emptyText: 'No comments yet. Start the conversation!' }}
    renderItem={(item) => (
        <List.Item>
            <List.Item.Meta
                avatar={
                    <Avatar size="small" style={{ backgroundColor: '#5E6C84' }}>
                        {item.user?.fullName?.[0] || 'U'}
                    </Avatar>
                }
                title={
                    <Space size="small">
                        <Text strong>{item.user?.fullName || 'Unknown'}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                            {formatRelativeTime(item.timestamp)}
                            {/* Outputs: "just now", "2 minutes ago", "1 hour ago" */}
                        </Text>
                    </Space>
                }
                description={
                    <div style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>
                        {item.text}
                    </div>
                }
            />
        </List.Item>
    )}
/>
```

---

## Example 3: Workflow Validation

### Validation Rules

```javascript
// Define allowed transitions
const WORKFLOW_RULES = {
    'todo': ['in_progress'],                    // from todo, can go to...
    'in_progress': ['review', 'todo'],          // from in_progress, can go to...
    'review': ['in_progress', 'done'],          // from review, can go to...
    'done': ['in_progress']                     // from done, can go to...
};

// Check if a transition is valid
const isValidStatusTransition = (currentStatus, newStatus) => {
    if (currentStatus === newStatus) return true; // No change is always valid
    return WORKFLOW_RULES[currentStatus]?.includes(newStatus) || false;
};
```

### Usage in Status Dropdown

```jsx
<Select
    value={currentIssue.status}
    onChange={v => handleUpdate('status', v)}
    options={[
        { value: 'todo', label: 'To Do' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'review', label: 'In Review' },
        { value: 'done', label: 'Done' }
    ]}
    disabled={loadingField === 'status'}
    optionLabelRender={(option) => {
        // Show checkmark only for VALID transitions
        const isValid = isValidStatusTransition(
            currentIssue.status, 
            option.data.value
        );
        return (
            <Space>
                {option.data.label}
                {isValid && <CheckOutlined style={{ color: '#52c41a' }} />}
            </Space>
        );
    }}
/>
```

### What Happens When Invalid

```javascript
// In handleUpdate:
if (field === 'status') {
    if (!isValidStatusTransition(currentIssue.status, value)) {
        // Show warning, don't send API call
        message.warning(
            `Cannot transition from ${currentIssue.status} to ${value}`
        );
        return;
    }
}

// Example invalid transitions:
// todo → review (skipped in_progress)
// todo → done (skipped both)
// review → todo (moving backward)

// These will all show warning and not send API call
```

---

## Example 4: AI Hooks Implementation

### Summarize Issue

```javascript
const handleAISummarize = async () => {
    setAiLoading(true);
    try {
        // TODO: Replace with real API call to OpenAI
        // const response = await fetch('/api/ai/summarize-issue', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         title: currentIssue.title,
        //         description: currentIssue.description,
        //         comments: currentIssue.comments?.map(c => c.text),
        //         status: currentIssue.status,
        //         priority: currentIssue.priority
        //     })
        // });
        // const data = await response.json();
        // setAiInsights({ summary: data.summary, ... });

        // DEMO: Mock response
        const mockSummary = 
            `${currentIssue.title} is a ${currentIssue.issueType} ` +
            `with ${currentIssue.priority} priority. ` +
            `Currently ${currentIssue.status}. ` +
            `Assigned to ${
                currentIssue.assignedTo?.map(a => a.fullName).join(', ') 
                || 'nobody'
            }.`;

        setAiInsights({
            summary: mockSummary,
            timestamp: new Date().toISOString()
        });
        
        message.success('AI summary generated');
    } catch (error) {
        console.error('AI error:', error);
        message.error('Failed to generate AI summary');
    } finally {
        setAiLoading(false);
    }
};
```

### Suggest Next Action

```javascript
const handleAISuggestAction = async () => {
    setAiLoading(true);
    try {
        // TODO: Real API call
        // const response = await fetch('/api/ai/suggest-action', {
        //     method: 'POST',
        //     body: JSON.stringify({
        //         currentStatus: currentIssue.status,
        //         priority: currentIssue.priority,
        //         assignedTo: currentIssue.assignedTo,
        //         daysInStatus: calculateDaysSinceLastStatusChange(),
        //         hasUnresolvedComments: detectBlockingComments()
        //     })
        // });
        // const { suggestion } = await response.json();

        // DEMO: Smart mock based on status
        let mockAction;
        switch (currentIssue.status) {
            case 'in_progress':
                mockAction = 'Move to "In Review" for team validation';
                break;
            case 'todo':
                mockAction = 'Assign to team member and move to "In Progress"';
                break;
            case 'review':
                mockAction = 'Address feedback and move to "Done"';
                break;
            case 'done':
                mockAction = 'Create follow-up task if needed';
                break;
            default:
                mockAction = 'Define next steps';
        }

        setAiInsights(prev => ({
            ...prev,
            nextAction: mockAction,
            timestamp: new Date().toISOString()
        }));
        
        message.success('AI suggestion generated');
    } catch (error) {
        console.error('AI error:', error);
        message.error('Failed to generate suggestion');
    } finally {
        setAiLoading(false);
    }
};
```

### Detect Risk

```javascript
const handleAIDetectRisk = async () => {
    setAiLoading(true);
    try {
        // TODO: Real API call with ML risk detection
        // const response = await fetch('/api/ai/detect-risk', {
        //     method: 'POST',
        //     body: JSON.stringify({
        //         issue: currentIssue,
        //         teamContext: { /* ... */ },
        //         historicalData: { /* ... */ }
        //     })
        // });
        // const { risks } = await response.json();

        // DEMO: Heuristic-based risk detection
        const risks = [];

        // Check critical priority without assignee
        if (currentIssue.priority === 'critical' && 
            !currentIssue.assignedTo?.length) {
            risks.push('🚨 Critical priority but unassigned');
        }

        // Check story points too high
        if (currentIssue.storyPoints > 13) {
            risks.push('⚠️ Story points too high - consider breaking down into smaller tasks');
        }

        // Check overdue
        if (currentIssue.dueDate) {
            const dueDate = new Date(currentIssue.dueDate);
            if (dueDate < new Date()) {
                risks.push('⏰ Past due date - needs immediate attention');
            }
        }

        // Check missing description
        if (!currentIssue.description || currentIssue.description.trim() === '') {
            risks.push('📝 Missing detailed description');
        }

        // Check for blocked status (no comments = might be blocker)
        if (currentIssue.status === 'in_progress' && 
            (!currentIssue.comments || currentIssue.comments.length < 2)) {
            risks.push('💬 Minimal communication on high-priority task');
        }

        setAiInsights(prev => ({
            ...prev,
            risks: risks.length > 0 ? risks : ['✅ No risks detected'],
            timestamp: new Date().toISOString()
        }));
        
        message.success('AI risk analysis complete');
    } catch (error) {
        console.error('AI error:', error);
        message.error('Failed to analyze risks');
    } finally {
        setAiLoading(false);
    }
};
```

### Display AI Insights

```jsx
{aiInsights && (
    <div style={{ 
        marginTop: 12, 
        padding: '12px', 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: 4, 
        color: 'white' 
    }}>
        {aiInsights.summary && (
            <div style={{ marginBottom: 8 }}>
                <Text strong style={{ color: 'white' }}>Summary:</Text>
                <div style={{ marginTop: 4, color: 'rgba(255,255,255,0.9)' }}>
                    {aiInsights.summary}
                </div>
            </div>
        )}
        
        {aiInsights.nextAction && (
            <div style={{ marginBottom: 8 }}>
                <Text strong style={{ color: 'white' }}>Suggested Action:</Text>
                <div style={{ marginTop: 4, color: 'rgba(255,255,255,0.9)' }}>
                    {aiInsights.nextAction}
                </div>
            </div>
        )}
        
        {aiInsights.risks && (
            <div>
                <Text strong style={{ color: 'white' }}>Risk Assessment:</Text>
                <div style={{ marginTop: 4 }}>
                    {aiInsights.risks.map((risk, idx) => (
                        <div key={idx} style={{ 
                            color: 'rgba(255,255,255,0.9)', 
                            marginBottom: 4 
                        }}>
                            {risk}
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
)}
```

---

## Example 5: Relative Timestamps

### Helper Function

```javascript
const formatRelativeTime = (date) => {
    if (!date) return 'unknown';
    
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return then.toLocaleDateString();
};
```

### Usage

```javascript
// In comments display
<Text type="secondary" style={{ fontSize: 11 }}>
    {formatRelativeTime(item.timestamp)}
</Text>

// In history
<Text type="secondary" style={{ fontSize: 12 }}>
    {formatRelativeTime(h.timestamp)}
</Text>

// In updated timestamp
<Text type="secondary">
    Updated {formatRelativeTime(currentIssue.updatedAt)}
</Text>

// Output examples:
// 500ms old: "just now"
// 30sec old: "just now"
// 5min old: "5 minutes ago"
// 2hr old: "2 hours ago"
// 3days old: "3 days ago"
// 2months old: "1/5/2026"
```

---

## Example 6: State Rollback on Error

### Before (Error, No Rollback)

```javascript
// ❌ BAD - UI shows change but API failed
const handleUpdate = async (field, value) => {
    setCurrentIssue(prev => ({ ...prev, [field]: value }));
    
    try {
        await taskService.updateTask(currentIssue._id, { [field]: value });
    } catch (error) {
        message.error('Failed to update');
        // UI still shows changed value! 😱
    }
};
```

### After (With Rollback)

```javascript
// ✅ GOOD - UI reverts on error
const handleUpdate = async (field, value) => {
    // 1. Save original
    const originalValue = currentIssue[field];
    
    // 2. Update UI optimistically
    setCurrentIssue(prev => ({ ...prev, [field]: value }));
    
    try {
        // 3. Confirm with API
        const updated = await taskService.updateTask(
            currentIssue._id, 
            { [field]: value }
        );
        setCurrentIssue(updated);
    } catch (error) {
        // 4. REVERT on error
        setCurrentIssue(prev => ({ 
            ...prev, 
            [field]: originalValue // Back to original
        }));
        message.error('Failed to update');
    }
};
```

**User Experience:**
```
Scenario: User changes status to invalid, API rejects

1. User clicks "review" status
2. UI shows "review" immediately
3. API responds with 400 error
4. UI reverts to "in_progress"
5. Error toast: "Cannot transition from in_progress to review"

User sees: A brief flash to the new value, then back to correct value
            + clear error message
```

---

## Complete Working Example

### Full Inline Edit Flow

```jsx
// User initiates
<Select
    value={currentIssue.status}
    onChange={v => handleUpdate('status', v)}  // ← This starts it
    options={[
        { value: 'todo', label: 'To Do' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'review', label: 'In Review' },
        { value: 'done', label: 'Done' }
    ]}
    disabled={loadingField === 'status'}  // ← Spinner during update
/>

// Handler
const handleUpdate = async (field, value) => {
    // Validate
    if (field === 'status' && 
        !isValidStatusTransition(currentIssue.status, value)) {
        message.warning(`Invalid transition`);
        return;
    }

    // Save original
    const originalValue = currentIssue[field];
    
    // Optimistic update
    setCurrentIssue(prev => ({
        ...prev,
        [field]: value,
        updatedAt: new Date().toISOString()
    }));

    // Show loading
    setLoadingField(field);

    try {
        // API call
        const updated = await taskService.updateTask(
            currentIssue._id, 
            { [field]: value }
        );
        
        // Sync
        setCurrentIssue(updated);
        message.success(`${field} updated`);
    } catch (error) {
        // Rollback
        setCurrentIssue(prev => ({
            ...prev,
            [field]: originalValue,
            updatedAt: originalIssueRef.current.updatedAt
        }));
        message.error(`Failed to update ${field}`);
    } finally {
        // Hide loading
        setLoadingField(null);
    }
};
```

---

That's the complete implementation! 🚀
