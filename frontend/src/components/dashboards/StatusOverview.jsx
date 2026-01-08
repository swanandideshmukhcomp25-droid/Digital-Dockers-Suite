import { Card, Row, Col, Typography, Empty } from 'antd';
import { Doughnut } from 'react-chartjs-2';

const { Text, Title } = Typography;

const StatusOverview = ({ stats }) => {
    if (!stats) {
        return (
            <Card title="Status Overview" variant="borderless">
                <Empty description="No status data available" />
            </Card>
        );
    }

    const backlogCount = stats.statusBreakdown?.todo || 0;
    const selectedCount = stats.statusBreakdown?.selected || 0;
    const inProgressCount = stats.statusBreakdown?.in_progress || 0;
    const reviewCount = stats.statusBreakdown?.review || 0;
    const doneCount = stats.statusBreakdown?.done || 0;
    const totalCount = backlogCount + selectedCount + inProgressCount + reviewCount + doneCount;

    const chartData = {
        labels: ['Backlog', 'Selected', 'In Progress', 'Review', 'Done'],
        datasets: [{
            data: [backlogCount, selectedCount, inProgressCount, reviewCount, doneCount],
            backgroundColor: ['#dfe1e6', '#626f86', '#0052cc', '#ff5630', '#00875a'],
            borderWidth: 2,
            borderColor: '#fff',
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 16,
                    font: { size: 12 }
                }
            }
        }
    };

    return (
        <Card title="Status Overview" variant="borderless">
            <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                    <div style={{ height: 250, display: 'flex', justifyContent: 'center' }}>
                        <Doughnut
                            data={chartData}
                            options={{
                                ...chartOptions,
                                plugins: {
                                    ...chartOptions.plugins,
                                    tooltip: {
                                        callbacks: {
                                            label: (context) => {
                                                const label = context.label || '';
                                                const value = context.parsed;
                                                const percent = totalCount > 0 ? ((value / totalCount) * 100).toFixed(1) : 0;
                                                return `${label}: ${value} (${percent}%)`;
                                            }
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </Col>
                <Col xs={24} md={12}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center', height: '100%' }}>
                        <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>Total Issues</Text>
                            <Title level={3} style={{ margin: '4px 0 0 0' }}>
                                {totalCount}
                            </Title>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div style={{ padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
                                <Text type="secondary" style={{ fontSize: 11 }}>Backlog</Text>
                                <div style={{ fontSize: 18, fontWeight: 'bold', marginTop: 4, color: '#dfe1e6' }}>
                                    {backlogCount}
                                </div>
                            </div>
                            <div style={{ padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
                                <Text type="secondary" style={{ fontSize: 11 }}>Selected</Text>
                                <div style={{ fontSize: 18, fontWeight: 'bold', marginTop: 4, color: '#626f86' }}>
                                    {selectedCount}
                                </div>
                            </div>
                            <div style={{ padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
                                <Text type="secondary" style={{ fontSize: 11 }}>In Progress</Text>
                                <div style={{ fontSize: 18, fontWeight: 'bold', marginTop: 4, color: '#0052cc' }}>
                                    {inProgressCount}
                                </div>
                            </div>
                            <div style={{ padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
                                <Text type="secondary" style={{ fontSize: 11 }}>Review</Text>
                                <div style={{ fontSize: 18, fontWeight: 'bold', marginTop: 4, color: '#ff5630' }}>
                                    {reviewCount}
                                </div>
                            </div>
                            <div style={{ padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6, gridColumn: '1 / -1' }}>
                                <Text type="secondary" style={{ fontSize: 11 }}>Done</Text>
                                <div style={{ fontSize: 18, fontWeight: 'bold', marginTop: 4, color: '#00875a' }}>
                                    {doneCount}
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

export default StatusOverview;
