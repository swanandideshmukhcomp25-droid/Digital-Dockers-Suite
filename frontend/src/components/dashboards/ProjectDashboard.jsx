import { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, List, Avatar, Progress, Tag, Spin, Empty, message, Alert } from 'antd';
import { RiseOutlined, FireOutlined, CheckCircleOutlined, ClockCircleOutlined, BulbOutlined, WarningOutlined, CheckOutlined } from '@ant-design/icons';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { useProject } from '../../context/ProjectContext';
import projectStatsService from '../../services/projectStatsService';
import activityService from '../../services/activityService';
import searchService from '../../services/searchService';
import { formatDistanceToNow } from 'date-fns';
import { generateSprintInsights } from '../../utils/aiInsights';
import ForYouSection from './ForYouSection';
import RecentActivityPanel from './RecentActivityPanel';
import UpcomingWorkCard from './UpcomingWorkCard';
import StatusOverview from './StatusOverview';
import AIInsightBanner from './AIInsightBanner';
import { generateMockForYouData, generateMockActivityData, generateMockUpcomingTasks } from '../../utils/mockDashboardData';
import './dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const { Title, Text } = Typography;

const ProjectDashboard = () => {
    const { currentProject } = useProject();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [burndownData, setBurndownData] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [assignedToMe, setAssignedToMe] = useState([]);
    const [sprintInsights, setSprintInsights] = useState(null);
    // New state for Jira-style features
    const [forYouData, setForYouData] = useState(null);
    const [activityData, setActivityData] = useState([]);
    const [upcomingData, setUpcomingData] = useState(null);

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

            // Generate AI insights based on stats
            if (statsData && statsData.activeSprint) {
                const insights = generateSprintInsights(statsData, statsData.activeSprint);
                setSprintInsights(insights);
            }

            // Load mock data for Jira-style features
            const forYouMockData = generateMockForYouData();
            const activityMockData = generateMockActivityData();
            const upcomingMockData = generateMockUpcomingTasks();

            setForYouData(forYouMockData);
            setActivityData(activityMockData);
            setUpcomingData(upcomingMockData);

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
            <div className="dashboard-loading">
                <Spin size="large" tip="Loading dashboard..." />
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <Title level={2}>Project Overview: {currentProject?.name || 'No Project Selected'}</Title>
                <Typography.Text type="secondary">
                    <span>Lead: {currentProject?.lead?.fullName || 'N/A'}</span>
                    <span>•</span>
                    <span>Key: {currentProject?.key}</span>
                    <span>•</span>
                    <span>Type: {currentProject?.projectType || 'Scrum'}</span>
                </Typography.Text>
            </div>

            {/* AI Insight Banner */}
            {stats && <div className="dashboard-alert"><AIInsightBanner stats={stats} assignedTasks={assignedToMe} upcomingTasks={upcomingData?.upcomingTasks} /></div>}

            {/* For You Section */}
            {forYouData && (
                <div className="for-you-section">
                    <div className="for-you-title">👤 For You</div>
                    <ForYouSection
                        assignedIssues={forYouData.assignedIssues}
                        recentlyViewed={forYouData.recentlyViewed}
                        recentlyUpdated={forYouData.recentlyUpdated}
                    />
                </div>
            )}

            {/* KPI Metrics Section */}
            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                <Col xs={24} sm={12} lg={6}>
                    <div className="kpi-card">
                        <div className="kpi-icon" style={{ color: '#ff5630' }}>
                            <FireOutlined />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Sprint Progress</div>
                            <div className="kpi-value">{stats?.sprintProgress || 0}%</div>
                            <div className="kpi-progress">
                                <Progress
                                    percent={stats?.sprintProgress || 0}
                                    showInfo={false}
                                    strokeColor="#ff5630"
                                    size="small"
                                />
                            </div>
                        </div>
                    </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <div className="kpi-card">
                        <div className="kpi-icon" style={{ color: '#00875a' }}>
                            <CheckCircleOutlined />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Issues Done</div>
                            <div className="kpi-value">{stats?.issuesDone || 0}</div>
                            <div style={{ fontSize: 12, color: '#626f86', marginTop: 8 }}>
                                of {stats?.totalTasks || 0} total
                            </div>
                        </div>
                    </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <div className="kpi-card">
                        <div className="kpi-icon" style={{ color: '#ffab00' }}>
                            <ClockCircleOutlined />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Days Remaining</div>
                            <div className="kpi-value">{stats?.daysRemaining || 0}</div>
                            <div style={{ fontSize: 12, color: '#626f86', marginTop: 8 }}>
                                in sprint
                            </div>
                        </div>
                    </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <div className="kpi-card">
                        <div className="kpi-icon" style={{ color: '#0052cc' }}>
                            <RiseOutlined />
                        </div>
                        <div className="kpi-content">
                            <div className="kpi-label">Velocity</div>
                            <div className="kpi-value">{stats?.velocity || 0}</div>
                            <div style={{ fontSize: 12, color: '#626f86', marginTop: 8 }}>
                                points/day
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>

            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                {/* AI Sprint Insights Card */}
                {sprintInsights && (
                    <Col span={24}>
                        <Card
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <BulbOutlined style={{ color: '#FFAB00' }} />
                                    <span>AI Sprint Insights</span>
                                </div>
                            }
                            variant="borderless"
                        >
                            <Row gutter={[24, 24]}>
                                {/* Risks Section */}
                                {sprintInsights.risks?.length > 0 && (
                                    <Col xs={24} md={12}>
                                        <div style={{ marginBottom: 16 }}>
                                            <Title level={5}>⚠️ Detected Risks</Title>
                                            {sprintInsights.risks.map((risk, idx) => (
                                                <Alert
                                                    key={idx}
                                                    title={risk.title}
                                                    description={risk.description}
                                                    type={risk.level === 'critical' ? 'error' : risk.level === 'high' ? 'warning' : 'info'}
                                                    showIcon
                                                    style={{ marginBottom: 12 }}
                                                />
                                            ))}
                                        </div>
                                    </Col>
                                )}

                                {/* Recommendations Section */}
                                {sprintInsights.recommendations?.length > 0 && (
                                    <Col xs={24} md={12}>
                                        <div>
                                            <Title level={5}>💡 Recommendations</Title>
                                            {sprintInsights.recommendations.map((rec, idx) => (
                                                <div
                                                    key={idx}
                                                    style={{
                                                        padding: '12px 16px',
                                                        backgroundColor: rec.priority === 'high' ? '#fff7e6' : '#f6f8fb',
                                                        borderLeft: `4px solid ${rec.priority === 'high' ? '#ff7a45' : '#0052cc'}`,
                                                        marginBottom: 12,
                                                        borderRadius: 4
                                                    }}
                                                >
                                                    <Text strong>{rec.action}</Text>
                                                    <div style={{ fontSize: 12, color: '#626f86', marginTop: 4 }}>
                                                        {rec.detail}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Col>
                                )}

                                {/* Insights Section */}
                                {sprintInsights.insights?.length > 0 && (
                                    <Col span={24}>
                                        <div>
                                            <Title level={5}>✨ Key Insights</Title>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                                {sprintInsights.insights.map((insight, idx) => (
                                                    <div
                                                        key={idx}
                                                        style={{
                                                            padding: '12px 16px',
                                                            backgroundColor: '#f0f5ff',
                                                            border: '1px solid #b3d8ff',
                                                            borderRadius: 6,
                                                            flex: '1 1 calc(50% - 6px)',
                                                            minWidth: 200
                                                        }}
                                                    >
                                                        <CheckOutlined style={{ color: '#00875a', marginRight: 8 }} />
                                                        <Text>{insight.emoji} {insight.text}</Text>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </Card>
                    </Col>
                )}

                {/* Main Content: Charts & Activity */}
                <Col xs={24} lg={16}>
                    <div className="chart-card" style={{ marginBottom: 24 }}>
                        <div className="ant-card-head">
                            <Typography.Text strong>📈 Sprint Burndown</Typography.Text>
                        </div>
                        <div className="ant-card-body">
                            <div style={{ height: 320 }}>
                                {burndownChartData ? (
                                    <Line data={burndownChartData} options={{ maintainAspectRatio: false }} />
                                ) : (
                                    <Empty description="No active sprint" />
                                )}
                            </div>
                        </div>
                    </div>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={12}>
                            <div className="chart-card">
                                <div className="ant-card-head">
                                    <Typography.Text strong>🎯 Issue Status</Typography.Text>
                                </div>
                                <div className="ant-card-body">
                                    <div className="chart-container">
                                        {statusChartData ? (
                                            <Doughnut data={statusChartData} options={{ maintainAspectRatio: false }} />
                                        ) : (
                                            <Empty description="No data" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} md={12}>
                            <div className="chart-card">
                                <div className="ant-card-head">
                                    <Typography.Text strong>👥 Team Workload</Typography.Text>
                                </div>
                                <div className="ant-card-body">
                                    <div style={{ maxHeight: 250, overflowY: 'auto' }}>
                                        {stats?.workload?.length > 0 ? (
                                            <List
                                                size="small"
                                                dataSource={stats.workload}
                                                renderItem={(item) => (
                                                    <List.Item style={{ paddingBottom: 12 }}>
                                                        <List.Item.Meta
                                                            avatar={<Avatar style={{ backgroundColor: '#0052cc' }}>{item.name?.[0]}</Avatar>}
                                                            title={<Typography.Text strong>{item.name}</Typography.Text>}
                                                            description={
                                                                <div style={{ marginTop: 4 }}>
                                                                    <Tag color="blue">{item.points} points</Tag>
                                                                </div>
                                                            }
                                                        />
                                                    </List.Item>
                                                )}
                                            />
                                        ) : (
                                            <Empty description="No workload data" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Col>

                <Col xs={24} lg={8}>
                    {/* Status Overview */}
                    {stats && (
                        <div style={{ marginBottom: 24 }}>
                            <StatusOverview stats={stats} />
                        </div>
                    )}

                    {/* Upcoming & Unscheduled Work */}
                    {upcomingData && (
                        <div style={{ marginBottom: 24 }}>
                            <UpcomingWorkCard
                                upcomingTasks={upcomingData.upcomingTasks}
                                unscheduledTasks={upcomingData.unscheduledTasks}
                            />
                        </div>
                    )}

                    {/* Activity Feed */}
                    {activityData.length > 0 && (
                        <RecentActivityPanel activities={activityData} />
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default ProjectDashboard;
