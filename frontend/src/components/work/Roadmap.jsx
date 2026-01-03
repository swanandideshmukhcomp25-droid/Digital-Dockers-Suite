import { useState, useEffect } from 'react';
import { Card, Typography, Select, Button, Tooltip, Space, Spin, Empty, message } from 'antd';
import { CaretRightOutlined, PlusOutlined, FilterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useProject } from '../../context/ProjectContext';
import epicService from '../../services/epicService';

dayjs.extend(isBetween);

const { Title, Text } = Typography;
const { Option } = Select;

const Roadmap = () => {
    const { currentProject } = useProject();
    const [viewMode, setViewMode] = useState('months');
    const [epics, setEpics] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentProject) {
            fetchEpics();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentProject]);

    const fetchEpics = async () => {
        setLoading(true);
        try {
            const data = await epicService.getEpicsByProject(currentProject._id);
            setEpics(data);
        } catch (error) {
            console.error('Failed to fetch epics', error);
            message.error('Failed to load roadmap data');
        } finally {
            setLoading(false);
        }
    };

    // Generate Timeline Headers
    const months = [];
    for (let i = 0; i < 6; i++) {
        months.push(dayjs().add(i, 'month'));
    }

    const calculateStyle = (epic) => {
        const start = dayjs(epic.startDate);
        const end = dayjs(epic.dueDate);
        const timelineStart = dayjs().startOf('month');

        // Handle epics without dates
        if (!epic.startDate || !epic.dueDate) {
            return { display: 'none' };
        }

        // Simple percent calculation relative to the 6 month window
        const totalDays = 6 * 30; // approx
        const startDiff = start.diff(timelineStart, 'day');
        const duration = end.diff(start, 'day');

        const left = Math.max(0, (startDiff / totalDays) * 100);
        const width = Math.min(100 - left, Math.max(5, (duration / totalDays) * 100)); // Min 5% width

        return {
            left: `${left}%`,
            width: `${width}%`,
            backgroundColor: epic.color || '#8777D9',
        };
    };

    if (loading) {
        return <div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>;
    }

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>Roadmap</Title>
                <Space>
                    <Select defaultValue="all" style={{ width: 120 }}>
                        <Option value="all">All Projects</Option>
                    </Select>
                    <Button icon={<FilterOutlined />}>Filters</Button>
                    <Select value={viewMode} onChange={setViewMode} style={{ width: 100 }}>
                        <Option value="weeks">Weeks</Option>
                        <Option value="months">Months</Option>
                        <Option value="quarters">Quarters</Option>
                    </Select>
                    <Button type="primary" icon={<PlusOutlined />}>Create Epic</Button>
                </Space>
            </div>

            <Card bodyStyle={{ padding: 0, height: 600, overflow: 'hidden' }}>
                <div style={{ display: 'flex', height: '100%' }}>
                    {/* Left Pane: Epic List */}
                    <div style={{ width: 250, borderRight: '1px solid #dfe1e6', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: 12, borderBottom: '1px solid #dfe1e6', background: '#f4f5f7', fontWeight: 600 }}>
                            Epics
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {epics.map(epic => (
                                <div key={epic.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f4f5f7', height: 48, display: 'flex', alignItems: 'center' }}>
                                    <Space>
                                        <CaretRightOutlined style={{ fontSize: 10 }} />
                                        <Text ellipsis style={{ width: 180 }}>{epic.name}</Text>
                                    </Space>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Pane: Timeline */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'auto' }}>
                        {/* Headers */}
                        <div style={{ display: 'flex', borderBottom: '1px solid #dfe1e6', background: '#f4f5f7', height: 41 }}>
                            {months.map((month, index) => (
                                <div key={index} style={{ flex: 1, borderRight: '1px solid #dfe1e6', padding: 8, textAlign: 'center', minWidth: 100 }}>
                                    <Text strong>{month.format('MMM YYYY')}</Text>
                                </div>
                            ))}
                        </div>

                        {/* Bars Area */}
                        <div style={{ flex: 1, position: 'relative' }}>
                            {/* Background Grid Lines */}
                            <div style={{ display: 'flex', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                                {months.map((_, index) => (
                                    <div key={index} style={{ flex: 1, borderRight: '1px solid #f4f5f7', minWidth: 100 }} />
                                ))}
                            </div>

                            {/* Epic Bars */}
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                {epics.map((epic) => {
                                    const style = calculateStyle(epic);
                                    return (
                                        <div key={epic.id} style={{ height: 48, position: 'relative', borderBottom: '1px solid transparent' }}>
                                            <Tooltip title={`${epic.name}: ${Math.round(epic.progress)}% Complete`}>
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: 12,
                                                        height: 24,
                                                        borderRadius: 4,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        padding: '0 8px',
                                                        color: 'white',
                                                        fontSize: 12,
                                                        fontWeight: 500,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        ...style
                                                    }}
                                                >
                                                    {epic.name}
                                                </div>
                                            </Tooltip>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Roadmap;
