import { Card, Typography, Row, Col, Empty, Spin, Statistic, Tag, Space, Tooltip, Button } from 'antd';
import { BarChartOutlined, PieChartOutlined, TeamOutlined, CheckCircleOutlined, ClockCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title as ChartTitle, Tooltip as ChartTooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { useState, useEffect, useRef } from 'react';
import { useProject } from '../../context/ProjectContext';
import sprintService from '../../services/sprintService';
import taskService from '../../services/taskService';
import io from 'socket.io-client';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, ChartTooltip, Legend, ArcElement);

const { Title, Text } = Typography;

const ReportDashboard = () => {
    const { currentProject } = useProject();
    const [loading, setLoading] = useState(false);
    const [sprints, setSprints] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [velocityData, setVelocityData] = useState(null);
    const [statusData, setStatusData] = useState(null);
    const [metrics, setMetrics] = useState({
        totalTasks: 0,
        completedTasks: 0,
        completionRate: 0,
        avgVelocity: 0,
        teamMembers: new Set()
    });
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (currentProject) {
            fetchReportData();

            // Initialize Socket.io for real-time updates
            if (!socketRef.current) {
                const socket = io('http://localhost:5000', {
                    transports: ['websocket', 'polling'],
                    reconnection: true,
                    reconnectionDelay: 1000,
                    reconnectionDelayMax: 5000,
                    reconnectionAttempts: 5
                });

                socket.on('connect', () => {
                    console.log('Reports Dashboard connected to socket');
                    setIsConnected(true);
                    // Join project-specific room for real-time updates
                    socket.emit('join_room', `project:${currentProject._id}`);
                });

                socket.on('task:updated', (updatedTask) => {
                    console.log('Task updated event received:', updatedTask);
                    // Refresh data when any task is updated
                    fetchReportData();
                });

                socket.on('task:created', (newTask) => {
                    console.log('Task created event received:', newTask);
                    // Refresh data when new task is created
                    fetchReportData();
                });

                socket.on('task:deleted', (deletedTaskId) => {
                    console.log('Task deleted event received:', deletedTaskId);
                    // Refresh data when task is deleted
                    fetchReportData();
                });

                socket.on('disconnect', () => {
                    console.log('Reports Dashboard disconnected from socket');
                    setIsConnected(false);
                });

                socketRef.current = socket;
            }

            // Cleanup on unmount
            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                    socketRef.current = null;
                }
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentProject]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            console.log('Fetching report data for project:', currentProject._id);
            
            const [sprintRes, taskRes] = await Promise.all([
                sprintService.getSprintsByProject(currentProject._id),
                taskService.getTasks({ projectId: currentProject._id })
            ]);

            console.log('Sprints Response:', sprintRes);
            console.log('Tasks Response:', taskRes);

            const sprintArray = Array.isArray(sprintRes) ? sprintRes : (sprintRes?.data ? sprintRes.data : []);
            const taskArray = Array.isArray(taskRes) ? taskRes : (taskRes?.data ? taskRes.data : []);

            console.log('Processed Sprints Array:', sprintArray);
            console.log('Processed Tasks Array:', taskArray);

            setSprints(sprintArray);
            setTasks(taskArray);

            processVelocity(sprintArray);
            processStatusDistribution(taskArray);
            calculateMetrics(sprintArray, taskArray);
        } catch (error) {
            console.error("Failed to fetch report data:", error);
            if (error.response) {
                console.error("Response Status:", error.response.status);
                console.error("Response Data:", error.response.data);
            }
        } finally {
            setLoading(false);
        }
    };

    const calculateMetrics = (sprintList, taskList) => {
        // Ensure arrays
        const sprints = Array.isArray(sprintList) ? sprintList : [];
        const tasks = Array.isArray(taskList) ? taskList : [];

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t && t.status === 'done').length;
        const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

        // Calculate team members from assigned tasks
        const teamMembers = new Set();
        tasks.forEach(task => {
            if (task && task.assignedTo) {
                const assignees = Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo];
                assignees.forEach(member => {
                    if (member && member._id) {
                        teamMembers.add(member._id);
                    } else if (typeof member === 'string') {
                        teamMembers.add(member);
                    }
                });
            }
        });

        // Calculate average velocity from completed sprints
        const completedSprints = sprints.filter(s => s && s.status === 'completed');
        const avgVelocity = completedSprints.length > 0
            ? Math.round(completedSprints.reduce((sum, s) => sum + (s.completedPoints || 0), 0) / completedSprints.length)
            : 0;

        setMetrics({
            totalTasks,
            completedTasks,
            completionRate,
            avgVelocity,
            teamMembers
        });
    };

    const processVelocity = (sprintList) => {
        // Filter only completed sprints
        const completed = (Array.isArray(sprintList) ? sprintList : [])
            .filter(s => s && s.status === 'completed')
            .sort((a, b) => new Date(a.endDate || 0) - new Date(b.endDate || 0))
            .slice(-5);

        if (completed.length === 0) {
            setVelocityData(null);
            return;
        }

        const data = {
            labels: completed.map(s => s.name || 'Untitled'),
            datasets: [
                {
                    label: 'Committed',
                    data: completed.map(s => s.committedPoints || 0),
                    backgroundColor: '#BDC3C7',
                },
                {
                    label: 'Completed',
                    data: completed.map(s => s.completedPoints || 0),
                    backgroundColor: '#0052CC',
                },
            ],
        };
        setVelocityData(data);
    };

    const processStatusDistribution = (taskList) => {
        const counts = {
            todo: 0,
            in_progress: 0,
            review: 0,
            done: 0
        };

        (Array.isArray(taskList) ? taskList : []).forEach(t => {
            const status = t && t.status ? t.status : 'todo';
            if (counts[status] !== undefined) counts[status]++;
        });

        const total = counts.todo + counts.in_progress + counts.review + counts.done;
        if (total === 0) {
            setStatusData(null);
            return;
        }

        const data = {
            labels: ['To Do', 'In Progress', 'In Review', 'Done'],
            datasets: [
                {
                    data: [counts.todo, counts.in_progress, counts.review, counts.done],
                    backgroundColor: ['#dfe1e6', '#0052cc', '#6554C0', '#00875a'],
                    borderWidth: 0,
                },
            ],
        };
        setStatusData(data);
    };

    const velocityOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Velocity (Last 5 Completed Sprints)' }
        },
        scales: {
            y: {
                beginAtZero: true,
            }
        }
    };

    const statusOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right' }
        }
    };

    if (loading) return <div style={{ padding: 24, paddingLeft: 70 }}><Spin size="large" /></div>;

    if (!currentProject) {
        return <Empty description="Please select a project first" style={{ marginTop: 50 }} />;
    }

    return (
        <div style={{ padding: '24px', maxWidth: 1600 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Analytics & Reports</Title>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ 
                        fontSize: 12, 
                        color: isConnected ? '#52c41a' : '#ff4d4f',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                    }}>
                        <span style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: isConnected ? '#52c41a' : '#ff4d4f',
                            display: 'inline-block'
                        }}></span>
                        {isConnected ? 'Live' : 'Offline'}
                    </span>
                    <Button 
                        type="text" 
                        icon={<ReloadOutlined />}
                        onClick={fetchReportData}
                        loading={loading}
                        title="Refresh data"
                    />
                </div>
            </div>

            {/* Key Metrics */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Tasks"
                            value={metrics.totalTasks}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#0052cc' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Completed"
                            value={metrics.completedTasks}
                            suffix={`/ ${metrics.totalTasks}`}
                            valueStyle={{ color: '#00875a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Completion Rate"
                            value={metrics.completionRate}
                            suffix="%"
                            valueStyle={{ color: metrics.completionRate >= 50 ? '#00875a' : '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Avg Velocity"
                            value={metrics.avgVelocity}
                            suffix="pts"
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#0052cc' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={14}>
                    <Card title={<><BarChartOutlined /> Velocity Trend</>} variant="borderless">
                        {velocityData && velocityData.labels && velocityData.labels.length > 0 ? (
                            <div style={{ height: 300 }}>
                                <Bar options={velocityOptions} data={velocityData} />
                            </div>
                        ) : (
                            <Empty 
                                description="No completed sprints yet" 
                                style={{ paddingTop: 50, paddingBottom: 50 }}
                            />
                        )}
                    </Card>
                </Col>
                <Col xs={24} lg={10}>
                    <Card title={<><PieChartOutlined /> Task Distribution</>} variant="borderless">
                        {statusData && statusData.datasets && statusData.datasets[0] && statusData.datasets[0].data ? (
                            <div style={{ height: 300 }}>
                                <Pie data={statusData} options={statusOptions} />
                            </div>
                        ) : (
                            <Empty 
                                description="No tasks found" 
                                style={{ paddingTop: 50, paddingBottom: 50 }}
                            />
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Team Performance */}
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col span={24}>
                    <Card title={<><TeamOutlined /> Team Overview</>} variant="borderless">
                        <Space direction="vertical" style={{ width: '100%' }} size="large">
                            <div>
                                <Text strong>Team Members: </Text>
                                <Tag color="blue">{metrics.teamMembers.size} members</Tag>
                            </div>
                            <div>
                                <Text strong>Project Status: </Text>
                                <Tooltip title={`${metrics.completedTasks} of ${metrics.totalTasks} tasks completed`}>
                                    <Tag color={metrics.completionRate >= 50 ? 'green' : 'orange'}>
                                        {metrics.completionRate}% Complete
                                    </Tag>
                                </Tooltip>
                            </div>
                            <div>
                                <Text strong>Total Active Sprints: </Text>
                                <Tag color="cyan">{sprints.filter(s => s && s.status !== 'completed').length} sprints</Tag>
                            </div>
                            {tasks.length === 0 && sprints.length === 0 && (
                                <Empty 
                                    description="No tasks or sprints in this project yet. Create a sprint and add tasks to see analytics." 
                                    style={{ paddingTop: 20, paddingBottom: 20 }}
                                />
                            )}
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ReportDashboard;
