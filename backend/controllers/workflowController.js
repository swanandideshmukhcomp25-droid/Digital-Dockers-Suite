// Simple configuration for now. Can be moved to DB later.
const WORKFLOWS = {
    default: {
        transitions: {
            'todo': ['in_progress', 'blocked'],
            'in_progress': ['review', 'done', 'blocked', 'todo'],
            'review': ['done', 'in_progress'],
            'blocked': ['todo', 'in_progress'],
            'done': ['in_progress', 'review'] // Re-open
        }
    }
};

exports.canTransition = (currentStatus, newStatus, workflow = 'default') => {
    // If no change, allow
    if (currentStatus === newStatus) return true;

    const rules = WORKFLOWS[workflow];
    if (!rules) return true; // Default to allow if no rules found

    const allowed = rules.transitions[currentStatus];
    if (!allowed) return true; // Loose validation if status not in map

    return allowed.includes(newStatus);
};

exports.getTransitions = (currentStatus, workflow = 'default') => {
    return WORKFLOWS[workflow]?.transitions[currentStatus] || [];
};
