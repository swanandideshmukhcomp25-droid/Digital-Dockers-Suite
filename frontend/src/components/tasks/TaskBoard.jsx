import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, Typography, Tag, Avatar, Space, Button, Empty, message, Select, Segmented, Grid, Tooltip } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useProject } from '../../context/ProjectContext';
import taskService from '../../services/taskService';
import IssueDetailDrawer from '../work/IssueDetailDrawer';

const { Text, Title } = Typography;

const COLUMNS = {
    'todo': { title: 'To Do', status: 'todo' },
    'in_progress': { title: 'In Progress', status: 'in_progress' },
    'review': { title: 'In Review', status: 'review' },
    'done': { title: 'Done', status: 'done' }
};

const TaskBoard = () => {
    const { currentProject, activeSprint } = useProject();
    // eslint-disable-next-line no-unused-vars
    const [issues, setIssues] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [boardData, setBoardData] = useState({});

    // Mobile View State
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;
    const [mobileStatusFilter, setMobileStatusFilter] = useState('todo');

    useEffect(() => {
        if (currentProject && activeSprint) {
            loadSprintIssues();
        } else {
            setIssues([]);
            setBoardData({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentProject, activeSprint]);

    const loadSprintIssues = async () => {
        setLoading(true);
        try {
            const data = await taskService.getTasks({
                projectId: currentProject._id,
                sprintId: activeSprint._id
            });
            setIssues(data);
            groupIssuesByStatus(data);
        } catch (error) {
            console.error("Failed to load board issues", error);
        } finally {
            setLoading(false);
        }
    };

    const groupIssuesByStatus = (taskList) => {
        const grouped = {
            'todo': [],
            'in_progress': [],
            'review': [],
            'done': []
        };

        taskList.forEach(task => {
            const status = task.status || 'todo';
            if (grouped[status]) {
                grouped[status].push(task);
            } else {
                // Fallback for unknown status
                grouped['todo'].push(task);
            }
        });
        setBoardData(grouped);
    };

    const handleDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) return;

        const startStatus = source.droppableId;
        const finishStatus = destination.droppableId; // This is the status key (e.g., 'in_progress')

        // Optimistic UI Update
        const newBoardData = { ...boardData };

        // Remove from source
        const [movedIssue] = newBoardData[startStatus].splice(source.index, 1);
        // Add to destination
        newBoardData[finishStatus].splice(destination.index, 0, movedIssue);

        setBoardData(newBoardData);

        // API Call
        try {
            await taskService.updateTask(draggableId, { status: finishStatus });
            message.success(`moved to ${COLUMNS[finishStatus].title}`);
        } catch {
            message.error('Failed to update status');
            loadSprintIssues(); // Revert
        }
    };

    if (!currentProject) return <Empty description="Select a Project" />;
    if (!activeSprint) return <Empty description="No Active Sprint" />;

    return (
        <div style={{ padding: isMobile ? '16px' : '0 24px', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
                <div>
                    <Title level={isMobile ? 4 : 3}>{activeSprint.name}</Title>
                    <Text type="secondary">{currentProject.name} Board</Text>
                </div>
                {!isMobile && (
                    <Space>
                        <Select defaultValue="all" style={{ width: 120 }} options={[{ value: 'all', label: 'All Issues' }]} />
                        <Button>Validations</Button>
                    </Space>
                )}
            </div>

            {isMobile ? (
                // MOBILE VIEW: Segmented Control + List
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Segmented
                        block
                        options={Object.keys(COLUMNS).map(key => ({
                            label: COLUMNS[key].title,
                            value: key
                        }))}
                        value={mobileStatusFilter}
                        onChange={setMobileStatusFilter}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {(boardData[mobileStatusFilter] || []).map(issue => (
                            <Card
                                key={issue._id}
                                onClick={() => setSelectedIssue(issue)}
                                bodyStyle={{ padding: 12 }}
                                bordered={true}
                            >
                                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Text strong>{issue.title}</Text>
                                        <Tag color="blue">{issue.key}</Tag>
                                    </div>
                                    <Space>
                                        {/* Safe Access to priority */}
                                        <Tag color={issue.priority === 'high' ? 'red' : 'orange'}>{issue.priority || 'Medium'}</Tag>
                                        {issue.dueDate && (
                                            <Tooltip title={`Due: ${new Date(issue.dueDate).toLocaleDateString()}`}>
                                                <Tag
                                                    icon={<ClockCircleOutlined />}
                                                    color={new Date(issue.dueDate) < new Date() ? 'error' : 'default'}
                                                >
                                                    {new Date(issue.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </Tag>
                                            </Tooltip>
                                        )}
                                        <Avatar size="small" style={{ backgroundColor: '#0052CC' }}>{issue.assignedTo?.[0]?.fullName?.[0] || 'U'}</Avatar>
                                    </Space>
                                </Space>
                            </Card>
                        ))}
                        {(boardData[mobileStatusFilter] || []).length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No issues" />}
                    </div>
                </div>
            ) : (
                // DESKTOP VIEW: Drag & Drop Columns
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div style={{ display: 'flex', gap: 24, overflowX: 'auto', height: 'calc(100vh - 200px)' }}>
                        {Object.keys(COLUMNS).map(columnId => (
                            <div key={columnId} style={{ minWidth: 280, width: 300, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ padding: '8px 4px', textTransform: 'uppercase', fontWeight: 600, color: '#5E6C84', fontSize: 12 }}>
                                    {COLUMNS[columnId].title} {(boardData[columnId] || []).length}
                                </div>
                                <Droppable droppableId={columnId}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            style={{
                                                background: snapshot.isDraggingOver ? '#e3f2fd' : '#f4f5f7',
                                                padding: 8,
                                                flexGrow: 1,
                                                borderRadius: 4,
                                                overflowY: 'auto'
                                            }}
                                        >
                                            {(boardData[columnId] || []).map((issue, index) => (
                                                <Draggable key={issue._id} draggableId={issue._id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            onClick={() => setSelectedIssue(issue)}
                                                            style={{
                                                                userSelect: 'none',
                                                                padding: 16,
                                                                marginBottom: 8,
                                                                background: 'white',
                                                                borderRadius: 2,
                                                                boxShadow: snapshot.isDragging ? '0 5px 10px rgba(0,0,0,0.15)' : '0 1px 2px rgba(0,0,0,0.1)',
                                                                ...provided.draggableProps.style
                                                            }}
                                                        >
                                                            <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                                                <Text>{issue.title}</Text>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <Space>
                                                                        <Tag color="blue">{issue.issueType.substring(0, 1).toUpperCase()}</Tag>
                                                                        <Text type="secondary" style={{ fontSize: 12 }}>{issue.key}</Text>
                                                                    </Space>
                                                                    <Space>
                                                                        {issue.priority === 'high' && <Tag color="red">High</Tag>}
                                                                        {issue.dueDate && (
                                                                            <Tooltip title={`Due: ${new Date(issue.dueDate).toLocaleString()}`}>
                                                                                <Tag
                                                                                    icon={<ClockCircleOutlined />}
                                                                                    color={new Date(issue.dueDate) < new Date() ? 'error' : new Date(issue.dueDate).toDateString() === new Date().toDateString() ? 'warning' : 'default'}
                                                                                    style={{ fontSize: 11 }}
                                                                                >
                                                                                    {new Date(issue.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                                </Tag>
                                                                            </Tooltip>
                                                                        )}
                                                                        <Avatar size="small" style={{ fontSize: 10, backgroundColor: '#87d068' }}>
                                                                            {issue.assignedTo?.[0]?.fullName?.[0] || 'U'}
                                                                        </Avatar>
                                                                    </Space>
                                                                </div>
                                                            </Space>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </DragDropContext>
            )}

            <IssueDetailDrawer
                open={!!selectedIssue}
                issue={selectedIssue}
                onClose={() => {
                    setSelectedIssue(null);
                    loadSprintIssues(); // Refresh to catch any edit details
                }}
            />
        </div>
    );
};

export default TaskBoard;
