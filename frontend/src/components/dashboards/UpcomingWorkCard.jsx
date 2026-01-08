import { Card, List, Tag, Typography, Empty, Tabs, Alert } from 'antd';
import { CalendarOutlined, WarningOutlined } from '@ant-design/icons';
import { formatDistanceToNow, differenceInDays, parseISO } from 'date-fns';

const { Text, Title } = Typography;

const UpcomingWorkCard = ({ upcomingTasks, unscheduledTasks }) => {
    const formatTime = (date) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch {
            return 'soon';
        }
    };

    const getDaysUntilDue = (dueDate) => {
        try {
            return differenceInDays(parseISO(dueDate), new Date());
        } catch {
            return null;
        }
    };

    const getUrgencyColor = (daysUntil) => {
        if (daysUntil <= 0) return { bg: '#fee', color: '#ff5630', text: 'OVERDUE' };
        if (daysUntil <= 1) return { bg: '#fee', color: '#ff5630', text: `${daysUntil}d` };
        if (daysUntil <= 3) return { bg: '#fef3c7', color: '#d97706', text: `${daysUntil}d` };
        if (daysUntil <= 7) return { bg: '#fef3c7', color: '#d97706', text: `${daysUntil}d` };
        return { bg: '#dbeafe', color: '#0052cc', text: `${daysUntil}d` };
    };

    const tabItems = [
        {
            key: 'due_soon',
            label: `📅 Due Soon (${upcomingTasks?.length || 0})`,
            children: (
                <div style={{ marginTop: 12 }}>
                    {upcomingTasks && upcomingTasks.length > 0 ? (
                        <div>
                            {upcomingTasks.map((task, idx) => {
                                const daysUntil = getDaysUntilDue(task.dueDate);
                                const urgency = getUrgencyColor(daysUntil);
                                return (
                                    <div
                                        key={idx}
                                        className="upcoming-item"
                                        style={{
                                            padding: '12px 0',
                                            borderBottom: idx < upcomingTasks.length - 1 ? '1px solid #eaeef2' : 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            borderRadius: '6px',
                                            marginLeft: '-8px',
                                            marginRight: '-8px',
                                            paddingLeft: '8px',
                                            paddingRight: '8px'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f6f8fa'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                            <Tag style={{
                                                margin: 0,
                                                background: '#dbeafe',
                                                color: '#0052cc',
                                                border: 'none',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                padding: '2px 8px'
                                            }}>
                                                {task.key || 'TASK'}
                                            </Tag>
                                            <Text ellipsis style={{ maxWidth: 150, fontSize: '13px', fontWeight: '500' }}>
                                                {task.title}
                                            </Text>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                            <div style={{
                                                background: urgency.bg,
                                                color: urgency.color,
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                fontWeight: '600'
                                            }}>
                                                {urgency.text}
                                            </div>
                                            <Text type="secondary" style={{ fontSize: 11 }}>
                                                {formatTime(task.dueDate)}
                                            </Text>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <Empty description="No upcoming tasks" size="small" style={{ padding: '20px 0' }} />
                    )}
                </div>
            )
        },
        {
            key: 'unscheduled',
            label: `⚠️ No Due Date (${unscheduledTasks?.length || 0})`,
            children: (
                <div style={{ marginTop: 12 }}>
                    {unscheduledTasks && unscheduledTasks.length > 0 ? (
                        <>
                            <Alert
                                message="Tasks without due dates need scheduling"
                                type="warning"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />
                            <div>
                                {unscheduledTasks.map((task, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            padding: '12px 0',
                                            borderBottom: idx < unscheduledTasks.length - 1 ? '1px solid #eaeef2' : 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            borderRadius: '6px',
                                            marginLeft: '-8px',
                                            marginRight: '-8px',
                                            paddingLeft: '8px',
                                            paddingRight: '8px'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f6f8fa'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                            <Tag style={{
                                                margin: 0,
                                                background: '#dbeafe',
                                                color: '#0052cc',
                                                border: 'none',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                padding: '2px 8px'
                                            }}>
                                                {task.key || 'TASK'}
                                            </Tag>
                                            <Text ellipsis style={{ maxWidth: 150, fontSize: '13px', fontWeight: '500' }}>
                                                {task.title}
                                            </Text>
                                        </div>
                                        <Tag style={{
                                            background: '#f3f4f6',
                                            color: '#4b5563',
                                            border: 'none',
                                            fontSize: '11px',
                                            fontWeight: '600'
                                        }}>
                                            {task.status?.replace('_', ' ').toUpperCase() || 'TODO'}
                                        </Tag>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <Empty description="All tasks scheduled" size="small" style={{ padding: '20px 0' }} />
                    )}
                </div>
            )
        }
    ];

    return (
        <Card
            className="upcoming-card"
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CalendarOutlined style={{ color: '#0052cc', fontSize: 16 }} />
                    <span style={{ fontSize: 14, fontWeight: '600' }}>Upcoming & Unscheduled Work</span>
                </div>
            }
            hoverable
        >
            <Tabs items={tabItems} size="small" />
        </Card>
    );
};

export default UpcomingWorkCard;
