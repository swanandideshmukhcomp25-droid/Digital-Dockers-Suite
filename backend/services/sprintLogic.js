/**
 * ============================================================================
 * SPRINT LOGIC & METRICS CALCULATIONS
 * ============================================================================
 * 
 * This module handles:
 * 1. Sprint state transitions
 * 2. Metrics calculations (burndown, velocity, completion rate)
 * 3. Backlog management
 * 4. Active sprint rules
 * 
 * @module sprintLogic
 */

const Sprint = require('../models/Sprint');
const Task = require('../models/Task');
const Project = require('../models/Project');

// ============================================================================
// 1. SPRINT STATE RULES
// ============================================================================

/**
 * Rule: Only ONE active sprint per project
 * 
 * When starting a sprint:
 * 1. Check if another sprint is already ACTIVE
 * 2. If yes, close it first (or return error)
 * 3. Update sprint status to ACTIVE
 * 4. Initialize burndown tracking
 * 
 * @param {string} projectId
 * @param {string} sprintId
 * @returns {Promise<Object>} Updated sprint
 */
async function startSprint(projectId, sprintId) {
    try {
        // Step 1: Check for existing active sprint
        const activeSprint = await Sprint.findOne({
            projectId,
            status: 'active',
        });

        if (activeSprint && activeSprint._id.toString() !== sprintId) {
            throw new Error(
                `Project already has active sprint: ${activeSprint.name}. Close it first.`
            );
        }

        // Step 2: Update sprint to ACTIVE
        const sprint = await Sprint.findByIdAndUpdate(
            sprintId,
            {
                status: 'active',
                actualStartDate: new Date(),
            },
            { new: true }
        );

        // Step 3: Initialize burndown metrics
        // Fetch all issues in this sprint
        const issues = await Task.find({
            sprint: sprintId,
            status: { $in: ['todo', 'in_progress', 'review'] },
        });

        const totalStoryPoints = issues.reduce((sum, issue) => {
            return sum + (issue.storyPoints || 0);
        }, 0);

        sprint.committedPoints = totalStoryPoints;
        await sprint.save();

        // Step 4: Create initial burndown record
        // (In real Jira, this is stored separately for charting)
        if (!sprint.burndownHistory) {
            sprint.burndownHistory = [];
        }

        sprint.burndownHistory.push({
            date: new Date(),
            storyPoints: totalStoryPoints,
            issuesRemaining: issues.length,
        });

        await sprint.save();

        return sprint;
    } catch (error) {
        throw error;
    }
}

/**
 * Rule: When closing a sprint
 * 1. Calculate final metrics (velocity, completion rate)
 * 2. Move unfinished issues back to BACKLOG
 * 3. Lock sprint (no further edits)
 * 4. Calculate burndown chart
 * 
 * @param {string} projectId
 * @param {string} sprintId
 * @param {boolean} moveUnfinishedToBacklog - Default true
 * @returns {Promise<Object>} Updated sprint with metrics
 */
async function closeSprint(projectId, sprintId, moveUnfinishedToBacklog = true) {
    try {
        const sprint = await Sprint.findById(sprintId);

        if (!sprint || sprint.status !== 'active') {
            throw new Error('Sprint is not active');
        }

        // Step 1: Get all issues in this sprint
        const issues = await Task.find({
            sprint: sprintId,
        });

        // Step 2: Separate completed vs unfinished
        const completedIssues = issues.filter((i) => i.status === 'done');
        const unfinishedIssues = issues.filter((i) => i.status !== 'done');

        // Step 3: Calculate metrics
        const totalStoryPoints = issues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
        const completedStoryPoints = completedIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);

        sprint.completedPoints = completedStoryPoints;
        sprint.velocity = completedStoryPoints; // Velocity = story points completed
        sprint.completionRate = totalStoryPoints > 0
            ? Math.round((completedIssues.length / issues.length) * 100)
            : 0;

        // Step 4: Move unfinished issues back to BACKLOG
        if (moveUnfinishedToBacklog) {
            await Task.updateMany(
                { _id: { $in: unfinishedIssues.map((i) => i._id) } },
                {
                    sprint: null,
                    status: 'backlog',
                }
            );
        }

        // Step 5: Close sprint
        sprint.status = 'closed';
        sprint.actualEndDate = new Date();
        await sprint.save();

        return {
            sprint,
            metrics: {
                totalIssues: issues.length,
                completedIssues: completedIssues.length,
                unfinishedIssues: unfinishedIssues.length,
                totalStoryPoints,
                completedStoryPoints,
                remainingStoryPoints: totalStoryPoints - completedStoryPoints,
                velocity: sprint.velocity,
                completionRate: sprint.completionRate,
            },
        };
    } catch (error) {
        throw error;
    }
}

// ============================================================================
// 2. BACKLOG RULES
// ============================================================================

/**
 * Backlog consists of:
 * - All issues with NO sprint (sprint: null)
 * - Issues in FUTURE sprints
 * - Prioritized in order
 * 
 * NOT included:
 * - Issues in ACTIVE sprint
 * - Issues in CLOSED sprints (archived)
 */

/**
 * Get backlog view
 * Returns unstarted issues grouped by sprint
 * 
 * @param {string} projectId
 * @returns {Promise<Object>}
 */
async function getBacklog(projectId) {
    try {
        // Get all unscheduled issues (no sprint)
        const backlogIssues = await Task.find({
            project: projectId,
            sprint: null,
            status: { $ne: 'done' },
        }).populate('assignedTo', 'name email');

        // Get all future sprints with their issues
        const futureSprints = await Sprint.find({
            projectId,
            status: 'future',
        });

        const sprintsWithIssues = await Promise.all(
            futureSprints.map(async (sprint) => {
                const issues = await Task.find({
                    sprint: sprint._id,
                    status: { $ne: 'done' },
                }).populate('assignedTo', 'name email');

                return {
                    sprint,
                    issues,
                };
            })
        );

        return {
            backlogIssues,
            futureSprints: sprintsWithIssues,
        };
    } catch (error) {
        throw error;
    }
}

/**
 * When creating a new issue:
 * - If project has active sprint, DON'T auto-assign to it
 * - Instead, create in BACKLOG
 * - Team pulls into sprint during planning
 */

async function createIssueInBacklog(projectId, issueData) {
    try {
        const project = await Project.findById(projectId);

        // Auto-generate issue key
        const nextNumber = project.nextIssueNumber || 1;
        const key = `${project.key}-${nextNumber}`;

        const issue = new Task({
            ...issueData,
            project: projectId,
            key,
            sprint: null, // Always start in backlog
            status: 'backlog',
        });

        await issue.save();

        // Increment counter
        project.nextIssueNumber = nextNumber + 1;
        await project.save();

        return issue;
    } catch (error) {
        throw error;
    }
}

// ============================================================================
// 3. METRICS CALCULATIONS
// ============================================================================

/**
 * Calculate sprint metrics for display
 * 
 * Metrics:
 * - Total issues
 * - Issues by status
 * - Total story points
 * - Completed story points
 * - Completion %
 * - Remaining days in sprint
 * 
 * @param {string} sprintId
 * @returns {Promise<Object>}
 */
async function getSprintMetrics(sprintId) {
    try {
        const sprint = await Sprint.findById(sprintId);

        if (!sprint) {
            throw new Error('Sprint not found');
        }

        // Get all issues in sprint
        const issues = await Task.find({
            sprint: sprintId,
        });

        // Calculate by status
        const statusCounts = {
            todo: 0,
            in_progress: 0,
            in_review: 0,
            done: 0,
            blocked: 0,
        };

        let totalStoryPoints = 0;
        let completedStoryPoints = 0;

        issues.forEach((issue) => {
            const status = issue.status.toLowerCase();
            if (statusCounts.hasOwnProperty(status)) {
                statusCounts[status]++;
            }

            totalStoryPoints += issue.storyPoints || 0;
            if (status === 'done') {
                completedStoryPoints += issue.storyPoints || 0;
            }
        });

        // Calculate days remaining
        const now = new Date();
        const daysRemaining = Math.ceil(
            (new Date(sprint.endDate) - now) / (1000 * 60 * 60 * 24)
        );

        // Ideal burndown calculation
        // Assumes linear burn (not realistic but simple)
        const totalDays = Math.ceil(
            (new Date(sprint.endDate) - new Date(sprint.startDate)) / (1000 * 60 * 60 * 24)
        );
        const daysPassed = totalDays - daysRemaining;
        const idealburndown = (totalStoryPoints / totalDays) * daysPassed;

        return {
            sprintId,
            sprintName: sprint.name,
            sprintStatus: sprint.status,
            totalIssues: issues.length,
            statusCounts,
            totalStoryPoints,
            completedStoryPoints,
            remainingStoryPoints: totalStoryPoints - completedStoryPoints,
            completionPercentage: totalStoryPoints > 0
                ? Math.round((completedStoryPoints / totalStoryPoints) * 100)
                : 0,
            issueCompletionPercentage: issues.length > 0
                ? Math.round((statusCounts.done / issues.length) * 100)
                : 0,
            velocity: sprint.velocity || 0,
            committedPoints: sprint.committedPoints || totalStoryPoints,
            startDate: sprint.startDate,
            endDate: sprint.endDate,
            daysRemaining: Math.max(0, daysRemaining),
            burndownData: {
                ideal: idealburndown,
                actual: totalStoryPoints - completedStoryPoints,
            },
        };
    } catch (error) {
        throw error;
    }
}

/**
 * Calculate project velocity over last N sprints
 * Used to predict future sprint capacity
 * 
 * Velocity = average story points completed per sprint
 * 
 * @param {string} projectId
 * @param {number} lastNSprints - Default 3
 * @returns {Promise<Object>}
 */
async function getProjectVelocity(projectId, lastNSprints = 3) {
    try {
        // Get last N closed sprints
        const closedSprints = await Sprint.find({
            projectId,
            status: 'closed',
        })
            .sort({ actualEndDate: -1 })
            .limit(lastNSprints);

        const velocities = closedSprints.map((sprint) => sprint.velocity || 0);

        const averageVelocity =
            velocities.length > 0
                ? Math.round(velocities.reduce((a, b) => a + b) / velocities.length)
                : 0;

        return {
            projectId,
            velocitiesBySprin: velocities.reverse(),
            averageVelocity,
            trend: velocities.length >= 2
                ? velocities[velocities.length - 1] > velocities[0]
                    ? 'increasing'
                    : 'decreasing'
                : 'stable',
        };
    } catch (error) {
        throw error;
    }
}

/**
 * Get burndown data for a sprint
 * Used to plot burndown chart
 * 
 * Returns daily data points of remaining story points
 * 
 * @param {string} sprintId
 * @returns {Promise<Array>}
 */
async function getSprintBurndown(sprintId) {
    try {
        const sprint = await Sprint.findById(sprintId);

        if (!sprint) {
            throw new Error('Sprint not found');
        }

        // In production, you'd store daily snapshots
        // For now, we'll reconstruct from issue history
        // This is a simplified version

        const burndownData = [];

        // Get all issues with their history
        const issues = await Task.find({
            sprint: sprintId,
        });

        // For each day in sprint, calculate remaining points
        const startDate = new Date(sprint.startDate);
        const endDate = new Date(sprint.endDate);

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dayDate = new Date(d);

            // Get issues completed by this date
            const completedByDay = issues.filter((issue) => {
                // Simplified: just check if marked done
                // In production, check from history
                return issue.status === 'done';
            });

            const remainingPoints = issues.reduce((sum, issue) => {
                if (completedByDay.find((c) => c._id === issue._id)) {
                    return sum;
                }
                return sum + (issue.storyPoints || 0);
            }, 0);

            burndownData.push({
                date: new Date(dayDate),
                remainingPoints,
            });
        }

        return burndownData;
    } catch (error) {
        throw error;
    }
}

// ============================================================================
// 4. EXPORTS
// ============================================================================

module.exports = {
    startSprint,
    closeSprint,
    getBacklog,
    createIssueInBacklog,
    getSprintMetrics,
    getProjectVelocity,
    getSprintBurndown,
};
