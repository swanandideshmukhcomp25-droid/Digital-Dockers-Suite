import { Card, Typography, Row, Col, Empty, Spin } from 'antd';
import { BarChartOutlined, PieChartOutlined } from '@ant-design/icons';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title as ChartTitle, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import sprintService from '../../services/sprintService';
import taskService from '../../services/taskService';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend, ArcElement);

const { Title, Text } = Typography;

const ReportDashboard = () => {
    const { currentProject } = useProject();
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [sprints, setSprints] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [velocityData, setVelocityData] = useState(null);
    const [statusData, setStatusData] = useState(null);

    useEffect(() => {
        if (currentProject) {
            fetchReportData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentProject]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const [sprintRes, taskRes] = await Promise.all([
                sprintService.getSprintsByProject(currentProject._id),
                taskService.getTasks({ projectId: currentProject._id })
            ]);

            setSprints(sprintRes);
            setTasks(taskRes);

            processVelocity(sprintRes);
            processStatusDistribution(taskRes);
        } catch (error) {
            console.error("Failed to fetch report data", error);
        } finally {
            setLoading(false);
        }
    };

    const processVelocity = (sprintList) => {
        // Filter only completed sprints
        const completed = sprintList
            .filter(s => s.status === 'completed')
            .sort((a, b) => new Date(a.endDate) - new Date(b.endDate)) // Oldest first
            .slice(-5); // Last 5 sprints

        const data = {
            labels: completed.map(s => s.name),
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

        taskList.forEach(t => {
            const status = t.status || 'todo';
            if (counts[status] !== undefined) counts[status]++;
        });

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
            title: { display: true, text: 'Velocity (Last 5 Sprints)' }
        },
    };

    if (loading) return <div style={{ padding: 24, paddingLeft: 70 }}><Spin size="large" /></div>;

    return (
        <div style={{ padding: '24px 24px 24px 24px', maxWidth: 1600 }}>
            <Title level={3}>Analytics & Reports</Title>
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={14}>
                    <Card title={<><BarChartOutlined /> Velocity Chart</>}>
                        {velocityData && velocityData.labels.length > 0 ? (
                            <Bar options={velocityOptions} data={velocityData} />
                        ) : (
                            <Empty description="No completed sprints yet" />
                        )}
                    </Card>
                </Col>
                <Col xs={24} lg={10}>
                    <Card title={<><PieChartOutlined /> Issue Distribution</>}>
                        <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {statusData ? (
                                <Pie data={statusData} options={{ maintainAspectRatio: false }} />
                            ) : (
                                <Empty description="No issues found" />
                            )}
                        </div>
                    </Card>
                </Col>
                <Col span={24}>
                    <Card title="Team Performance Overview">
                        <div style={{ height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                            <Text type="secondary">Top Contributors (Based on Done Issues)</Text>
                            {/* Simple mock list based on logic for now or verified data if easy */}
                            {tasks.length > 0 ? (
                                <div style={{ marginTop: 16, display: 'flex', gap: 24 }}>
                                    {/* Aggregation logic could go here, keeping it simple for now */}
                                    <Text strong>Coming Soon: Detailed Breakdown by User</Text>
                                </div>
                            ) : <Text>No data available</Text>}
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ReportDashboard;
