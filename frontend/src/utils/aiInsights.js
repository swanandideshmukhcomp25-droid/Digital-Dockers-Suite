/**
 * AI Sprint Insights Generator
 * Analyzes sprint data and generates actionable insights with risk detection
 */

export const generateSprintInsights = (stats, sprint) => {
    if (!stats || !sprint) {
        return {
            risks: [],
            insights: [],
            recommendations: [],
            overallRisk: 'low'
        };
    }

    const insights = [];
    const recommendations = [];
    const risks = [];
    let riskScore = 0;

    // Extract relevant data
    const daysRemaining = calculateDaysRemaining(sprint.endDate);
    const totalTasks = stats.totalTasks || 0;
    const completedTasks = stats.statusBreakdown?.done || 0;
    const inProgressTasks = stats.statusBreakdown?.in_progress || 0;
    const inReviewTasks = stats.statusBreakdown?.review || 0;
    const todoTasks = stats.statusBreakdown?.todo || 0;
    
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const remainingWork = totalTasks - completedTasks;
    const workRemainPercent = totalTasks > 0 ? Math.round((remainingWork / totalTasks) * 100) : 0;

    const committedPoints = sprint.committedPoints || 0;
    const completedPoints = sprint.completedPoints || 0;
    const velocityPercent = committedPoints > 0 ? Math.round((completedPoints / committedPoints) * 100) : 0;

    // ===== RISK DETECTION =====

    // Risk 1: Behind Schedule
    if (daysRemaining <= 1 && workRemainPercent > 20) {
        risks.push({
            level: 'critical',
            title: 'Sprint at Critical Risk',
            description: `${workRemainPercent}% work remaining with only ${daysRemaining} day(s) left`,
            icon: '🚨'
        });
        riskScore += 40;
    } else if (daysRemaining <= 3 && workRemainPercent > 30) {
        risks.push({
            level: 'high',
            title: 'Sprint Behind Schedule',
            description: `${workRemainPercent}% work remaining with ${daysRemaining} days left`,
            icon: '⚠️'
        });
        riskScore += 25;
    }

    // Risk 2: Tasks Stuck in Review
    if (inReviewTasks > 2) {
        risks.push({
            level: 'high',
            title: 'Bottleneck in Code Review',
            description: `${inReviewTasks} tasks stuck in Review stage. Consider allocating reviewers.`,
            icon: '🔴'
        });
        riskScore += 15;
    } else if (inReviewTasks > 0) {
        risks.push({
            level: 'medium',
            title: `${inReviewTasks} task(s) in Review`,
            description: 'Monitor review progress to unblock team.',
            icon: '🟡'
        });
        riskScore += 5;
    }

    // Risk 3: Too Many In Progress (suggests blocked work or unclear priorities)
    if (inProgressTasks > 6) {
        risks.push({
            level: 'medium',
            title: 'High Work in Progress',
            description: `${inProgressTasks} tasks in progress. Consider focusing on completion.`,
            icon: '⚡'
        });
        riskScore += 10;
    }

    // Risk 4: Velocity tracking
    if (completionRate < 50 && daysRemaining > 3 && completionRate > 0) {
        const projectedCompletion = Math.round((completionRate / daysRemaining) * 100);
        if (projectedCompletion < 70) {
            risks.push({
                level: 'medium',
                title: 'Velocity Trending Low',
                description: `Current pace projects ${projectedCompletion}% completion by sprint end.`,
                icon: '📉'
            });
            riskScore += 12;
        }
    }

    // ===== POSITIVE INSIGHTS =====

    if (completionRate >= 80) {
        insights.push({
            type: 'positive',
            emoji: '✅',
            text: `Excellent progress! ${completionRate}% of tasks are complete.`
        });
    } else if (completionRate >= 50) {
        insights.push({
            type: 'positive',
            emoji: '👍',
            text: `Good progress: ${completionRate}% complete. Keep the momentum.`
        });
    }

    if (inProgressTasks > 0 && inProgressTasks <= 4) {
        insights.push({
            type: 'positive',
            emoji: '⚙️',
            text: `${inProgressTasks} task(s) actively being worked on. Focus is clear.`
        });
    }

    // ===== RECOMMENDATIONS =====

    if (daysRemaining <= 1 && remainingWork > 3) {
        recommendations.push({
            priority: 'critical',
            action: '🎯 Scope reduction',
            detail: 'Consider deferring lower-priority items to next sprint'
        });
        recommendations.push({
            priority: 'critical',
            action: '⚡ Prioritize review',
            detail: 'Focus on completing In Progress and Review items first'
        });
    }

    if (inReviewTasks > 2) {
        recommendations.push({
            priority: 'high',
            action: '👀 Code review',
            detail: 'Allocate dedicated reviewers to unblock queue'
        });
    }

    if (inProgressTasks > 6) {
        recommendations.push({
            priority: 'medium',
            action: '🎯 Reduce WIP',
            detail: 'Shift focus to completing In Progress tasks before starting new ones'
        });
    }

    if (remainingWork > todoTasks && inProgressTasks > 0) {
        recommendations.push({
            priority: 'medium',
            action: '📊 Track blockers',
            detail: 'Identify and resolve blockers preventing task progression'
        });
    }

    if (!recommendations.length && risks.length === 0) {
        recommendations.push({
            priority: 'low',
            action: '✨ Maintain pace',
            detail: 'Sprint is on track. Continue current cadence.'
        });
    }

    // Determine overall risk level
    let overallRisk = 'low';
    if (riskScore >= 40) {
        overallRisk = 'critical';
    } else if (riskScore >= 25) {
        overallRisk = 'high';
    } else if (riskScore >= 10) {
        overallRisk = 'medium';
    }

    return {
        risks: risks.slice(0, 3), // Top 3 risks
        insights,
        recommendations: recommendations.slice(0, 3), // Top 3 recommendations
        overallRisk,
        metrics: {
            completionRate,
            workRemainPercent,
            daysRemaining,
            velocityPercent,
            inProgressTasks,
            inReviewTasks
        }
    };
};

// Helper: Calculate days remaining in sprint
const calculateDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
};

// Helper: Get risk color
export const getRiskColor = (riskLevel) => {
    const colors = {
        critical: '#ff5630',
        high: '#ff9500',
        medium: '#ffab00',
        low: '#00875a'
    };
    return colors[riskLevel] || '#626f86';
};

// Helper: Get risk background
export const getRiskBackground = (riskLevel) => {
    const colors = {
        critical: '#fff0eb',
        high: '#fff7d6',
        medium: '#fffde7',
        low: '#f1f9f3'
    };
    return colors[riskLevel] || '#f5f5f5';
};
