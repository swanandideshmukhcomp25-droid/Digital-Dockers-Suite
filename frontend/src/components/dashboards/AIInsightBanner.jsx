import { Alert, Row, Col, Tag, Typography, Button } from 'antd';
import { BulbOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const AIInsightBanner = ({ stats, assignedTasks, upcomingTasks }) => {
    const generateInsights = () => {
        const insights = [];
        let severity = 'info';

        // Check for overdue tasks
        const overdueTasks = upcomingTasks?.filter(t => {
            const now = new Date();
            const dueDate = new Date(t.dueDate);
            return dueDate < now;
        }) || [];

        if (overdueTasks.length > 0) {
            insights.push(`⚠️ ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`);
            severity = 'warning';
        }

        // Check for high WIP
        const inProgressCount = stats?.statusBreakdown?.in_progress || 0;
        if (inProgressCount > 6) {
            insights.push(`🔄 ${inProgressCount} tasks in progress (consider completing before starting new)`);
            severity = 'warning';
        }

        // Check for review bottleneck
        const reviewCount = stats?.statusBreakdown?.review || 0;
        if (reviewCount > 2) {
            insights.push(`👀 ${reviewCount} tasks waiting for review`);
        }

        // Check for unscheduled work
        const unscheduledTasks = assignedTasks?.filter(t => !t.dueDate) || [];
        if (unscheduledTasks.length > 0) {
            insights.push(`📋 ${unscheduledTasks.length} task${unscheduledTasks.length > 1 ? 's' : ''} need scheduling`);
        }

        // Sprint progress insights
        const sprintProgress = stats?.sprintProgress || 0;
        const daysRemaining = stats?.daysRemaining || 0;

        if (sprintProgress < 50 && daysRemaining <= 3) {
            insights.push(`🚀 Sprint at ${sprintProgress}% with ${daysRemaining} days left - accelerate!`);
            severity = 'error';
        } else if (sprintProgress > 80) {
            insights.push(`✨ Sprint on track at ${sprintProgress}% completion`);
            severity = 'success';
        }

        return { insights, severity };
    };

    const { insights, severity } = generateInsights();

    if (insights.length === 0) {
        return (
            <Alert
                message="All systems go! 🎉"
                description="Sprint is progressing smoothly. Keep up the momentum!"
                type="success"
                icon={<BulbOutlined />}
                showIcon
                style={{ marginBottom: 24 }}
            />
        );
    }

    const messageText = insights.length === 1
        ? insights[0]
        : `${insights.length} insights: ${insights.slice(0, 2).join(', ')}${insights.length > 2 ? '...' : ''}`;

    return (
        <Alert
            message={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BulbOutlined />
                    <span>AI Insights</span>
                </div>
            }
            description={messageText}
            type={severity}
            icon={<BulbOutlined />}
            showIcon
            style={{ marginBottom: 24 }}
            action={
                <Button type="text" size="small" onClick={() => {
                    console.log('View detailed insights');
                }}>
                    View Details
                </Button>
            }
        />
    );
};

export default AIInsightBanner;
