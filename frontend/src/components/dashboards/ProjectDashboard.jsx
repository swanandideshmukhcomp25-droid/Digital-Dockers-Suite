import { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, List, Avatar, Progress, Tag, Spin, Empty, message } from 'antd';
import { RiseOutlined, FireOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { useProject } from '../../context/ProjectContext';
import projectStatsService from '../../services/projectStatsService';
import activityService from '../../services/activityService';
import searchService from '../../services/searchService';
import { formatDistanceToNow } from 'date-fns';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const { Title, Text } = Typography;

const ProjectDashboard = () => {
    const { currentProject } = useProject();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [burndownData, setBurndownData] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [assignedToMe, setAssignedToMe] = useState([]);

    useEffect(() => {
        if (currentProject?._id) {
            loadDashboardData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentProject]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Load all data in parallel
            const [statsData, activityData, assignedData] = await Promise.all([
                projectStatsService.getProjectStats(currentProject._id),
                activityService.getProjectActivity(currentProject._id, 5),
                searchService.getAssignedToMe(5)
            ]);

            setStats(statsData);
            setRecentActivity(activityData);
            setAssignedToMe(assignedData);

            // Load burndown if there's an active sprint
            if (statsData.activeSprint?._id) {
                const burndown = await projectStatsService.getBurndownData(statsData.activeSprint._id);
                setBurndownData(burndown);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            message.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // Chart data configuration
    const statusChartData = stats ? {
        labels: ['To Do', 'In Progress', 'Review', 'Done'],
        datasets: [{
            data: [
                stats.statusBreakdown?.todo || 0,
                stats.statusBreakdown?.in_progress || 0,
                stats.statusBreakdown?.review || 0,
                stats.statusBreakdown?.done || 0
            ],
            backgroundColor: ['#dfe1e6', '#0052cc', '#ff5630', '#00875a'],
            borderWidth: 0,
        }]
    } : null;

    const burndownChartData = burndownData ? {
        labels: burndownData.labels || [],
        datasets: [
            {
                label: 'Ideal Burndown',
                data: burndownData.ideal || [],
                borderColor: '#97a0af',
                borderDash: [5, 5],
                tension: 0.1,
                fill: false
            },
            {
                label: 'Actual Remaining',
                data: burndownData.actual || [],
                borderColor: '#ff5630',
                tension: 0.1,
                fill: false
            }
        ]
    } : null;

    const formatTimeAgo = (date) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch {
            return 'recently';
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={3}>Project Overview: {currentProject?.name || 'No Project Selected'}</Title>
                <Text type="secondary">
                    Lead: {currentProject?.lead?.fullName || 'N/A'} • Key: {currentProject?.key} • Type: {currentProject?.projectType || 'Scrum'}
                </Text>
            </div>

            <Row gutter={[24, 24]}>
                {/* Top Metrics */}
                <Col span={24}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} lg={6}>
                            <Card bordered={false} hoverable bodyStyle={{ padding: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <FireOutlined style={{ fontSize: 24, color: '#ff5630' }} />
                                    <div>
                                        <Text type="secondary">Sprint Progress</Text>
                                        <Title level={4} style={{ margin: 0 }}>{stats?.sprintProgress || 0}% Done</Title>
                                    </div>
                                </div>
                                <Progress
                                    percent={stats?.sprintProgress || 0}
                                    showInfo={false}
                                    strokeColor="#ff5630"
                                    size="small"
                                    style={{ marginTop: 8 }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card bordered={false} hoverable bodyStyle={{ padding: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <CheckCircleOutlined style={{ fontSize: 24, color: '#00875a' }} />
                                    <div>
                                        <Text type="secondary">Issues Done</Text>
                                        <Title level={4} style={{ margin: 0 }}>{stats?.issuesDone || 0}</Title>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card bordered={false} hoverable bodyStyle={{ padding: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <ClockCircleOutlined style={{ fontSize: 24, color: '#FFAB00' }} />
                                    <div>
                                        <Text type="secondary">Days Remaining</Text>
                                        <Title level={4} style={{ margin: 0 }}>{stats?.daysRemaining || 0} Days</Title>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card bordered={false} hoverable bodyStyle={{ padding: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <RiseOutlined style={{ fontSize: 24, color: '#0052cc' }} />
                                    <div>
                                        <Text type="secondary">Velocity</Text>
                                        <Title level={4} style={{ margin: 0 }}>{stats?.velocity || 0} Pts</Title>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Col>

                {/* Main Content: Charts & Activity */}
                <Col xs={24} lg={16}>
                    <Card title="Sprint Burndown" bordered={false} style={{ marginBottom: 24 }}>
                        <div style={{ height: 300 }}>
                            {burndownChartData ? (
                                <Line data={burndownChartData} options={{ maintainAspectRatio: false }} />
                            ) : (
                                <Empty description="No active sprint" />
                            )}
                        </div>
                    </Card>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={12}>
                            <Card title="Issue Status" bordered={false}>
                                <div style={{ height: 200, display: 'flex', justifyContent: 'center' }}>
                                    {statusChartData ? (
                                        <Doughnut data={statusChartData} options={{ maintainAspectRatio: false }} />
                                    ) : (
                                        <Empty description="No data" />
                                    )}
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} md={12}>
                            <Card title="Workload" bordered={false}>
                                <div style={{ height: 200, overflow: 'auto' }}>
                                    {stats?.workload?.length > 0 ? (
                                        <List
                                            size="small"
                                            dataSource={stats.workload}
                                            renderItem={(item) => (
                                                <List.Item>
                                                    <List.Item.Meta
                                                        avatar={<Avatar style={{ backgroundColor: '#0052cc' }}>{item.name?.[0]}</Avatar>}
                                                        title={item.name}
                                                        description={`${item.points} points`}
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    ) : (
                                        <Empty description="No workload data" />
                                    )}
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Recent Activity" bordered={false} style={{ marginBottom: 24 }}>
                        {recentActivity.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={recentActivity}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={<Avatar style={{ backgroundColor: '#0052cc' }}>{item.actor?.fullName?.[0] || '?'}</Avatar>}
                                            title={<Text strong>{item.message}</Text>}
                                            description={formatTimeAgo(item.createdAt)}
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="No recent activity" />
                        )}
                    </Card>
                    <Card title="Assigned to Me" bordered={false}>
                        {assignedToMe.length > 0 ? (
                            <List
                                dataSource={assignedToMe}
                                renderItem={(item) => (
                                    <List.Item style={{ cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Tag color="blue">{item.key || 'TASK'}</Tag>
                                            <Text ellipsis style={{ maxWidth: 180 }}>{item.title}</Text>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="No tasks assigned" />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProjectDashboard;
