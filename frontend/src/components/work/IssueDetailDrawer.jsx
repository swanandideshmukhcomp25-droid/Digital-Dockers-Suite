import { Drawer, Typography, Descriptions, Tag, Space, Avatar, Divider, Tabs, Button, Input, List, message, Select, Grid, Card, Timeline, Tooltip, Empty, Popconfirm } from 'antd';
import {
    CloseOutlined,
    LinkOutlined,
    PaperClipOutlined,
    ShareAltOutlined,
    MoreOutlined,
    ClockCircleOutlined,
    BulbOutlined,
    CalendarOutlined,
    BranchesOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import taskService from '../../services/taskService';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

const IssueDetailDrawer = ({ open, onClose, issue }) => {
    const { user } = useAuth();
    const [currentIssue, setCurrentIssue] = useState(issue);
    const [comment, setComment] = useState('');
    const [sending, setSending] = useState(false);
    const [users, setUsers] = useState([]);
    const screens = useBreakpoint();
    const isMobile = !screens.sm; // < 576px

    useEffect(() => {
        setCurrentIssue(issue);
    }, [issue]);

    useEffect(() => {
        if (open) {
            fetchUsers();
        }
    }, [open]);

    const fetchUsers = async () => {
        try {
            const data = await userService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    if (!currentIssue) return null;

    const handleUpdate = async (field, value) => {
        try {
            const updated = await taskService.updateTask(currentIssue._id, { [field]: value });
            setCurrentIssue(updated);
            message.success('Updated');
        } catch {
            message.error('Update failed');
        }
    };

    const handleAddComment = async () => {
        if (!comment.trim()) return;
        setSending(true);
        try {
            const newComments = await taskService.addComment(currentIssue._id, comment);
            setCurrentIssue(prev => ({ ...prev, comments: newComments }));
            setComment('');
            message.success('Comment added');
        } catch {
            message.error('Failed to add comment');
        } finally {
            setSending(false);
        }
    };

    // Delete handler - only for creator or admin
    const canDelete = user?.role === 'admin' ||
        currentIssue.assignedBy?._id === user?._id ||
        currentIssue.assignedBy === user?._id;

    const handleDelete = async () => {
        try {
            await taskService.deleteTask(currentIssue._id);
            message.success('Task deleted');
            onClose();
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to delete task');
        }
    };

    // AI Suggestions Component
    const AISuggestionsSection = () => {
        const aiData = currentIssue.aiSuggestions;
        if (!aiData || (!aiData.timeBreakdown?.length && !aiData.dependencies?.length)) {
            return (
                <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="AI analysis not available for this task"
                        style={{ margin: '12px 0' }}
                    />
                </Card>
            );
        }

        return (
            <Card
                size="small"
                title={<Space><BulbOutlined style={{ color: '#faad14' }} /> AI Analysis</Space>}
                style={{ marginBottom: 16, background: 'linear-gradient(135deg, #fff9e6 0%, #fff 100%)' }}
            >
                {aiData.timeBreakdown && aiData.timeBreakdown.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>
                            <ClockCircleOutlined /> Estimated Time Breakdown
                        </Text>
                        <Timeline
                            items={aiData.timeBreakdown.map((item, idx) => ({
                                key: idx,
                                color: 'blue',
                                children: (
                                    <Space direction="vertical" size={0}>
                                        <Text strong>{item.phase || item.task || `Phase ${idx + 1}`}</Text>
                                        <Text type="secondary">{item.duration || item.time || 'TBD'}</Text>
                                    </Space>
                                )
                            }))}
                        />
                    </div>
                )}

                {aiData.dependencies && aiData.dependencies.length > 0 && (
                    <div>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>
                            <BranchesOutlined /> Dependencies
                        </Text>
                        <Space wrap>
                            {aiData.dependencies.map((dep, idx) => (
                                <Tag key={idx} color="purple">{dep}</Tag>
                            ))}
                        </Space>
                    </div>
                )}
            </Card>
        );
    };

    // Calendar Link Component
    const CalendarLink = () => {
        if (!currentIssue.calendarEventId) return null;

        return (
            <Card size="small" style={{ marginBottom: 16, background: '#f0f7ff' }}>
                <Space>
                    <CalendarOutlined style={{ color: '#1890ff' }} />
                    <Text>This task is synced with Google Calendar</Text>
                    <Tooltip title="View in Calendar">
                        <Button
                            type="link"
                            size="small"
                            onClick={() => window.open(`https://calendar.google.com/calendar/r/eventedit/${currentIssue.calendarEventId}`, '_blank')}
                        >
                            Open
                        </Button>
                    </Tooltip>
                </Space>
            </Card>
        );
    };

    const items = [
        {
            label: 'Status',
            children: (
                <Select
                    value={currentIssue.status}
                    onChange={v => handleUpdate('status', v)}
                    options={[
                        { value: 'todo', label: 'To Do' },
                        { value: 'in_progress', label: 'In Progress' },
                        { value: 'review', label: 'Review' },
                        { value: 'done', label: 'Done' }
                    ]}
                    size="small"
                    style={{ width: 120 }}
                />
            )
        },
        {
            label: 'Priority',
            children: (
                <Select
                    value={currentIssue.priority}
                    onChange={v => handleUpdate('priority', v)}
                    options={[
                        { value: 'low', label: '🟢 Low' },
                        { value: 'medium', label: '🟡 Medium' },
                        { value: 'high', label: '🟠 High' },
                        { value: 'critical', label: '🔴 Critical' }
                    ]}
                    size="small"
                    style={{ width: 120 }}
                />
            )
        },
        {
            label: 'Assignee',
            children: (
                <Select
                    mode="multiple"
                    value={currentIssue.assignedTo?.map(u => u._id || u)}
                    onChange={v => handleUpdate('assignedTo', v)}
                    style={{ width: '100%', minWidth: 150 }}
                    size="small"
                    placeholder="Unassigned"
                    optionFilterProp="label"
                >
                    {users.map(u => (
                        <Select.Option key={u._id} value={u._id} label={u.fullName}>
                            <Space>
                                <Avatar size="small" style={{ backgroundColor: '#0052CC' }}>
                                    {u.fullName?.[0]}
                                </Avatar>
                                {u.fullName}
                            </Space>
                        </Select.Option>
                    ))}
                </Select>
            )
        },
        {
            label: 'Reporter',
            children: <Space>
                <Avatar size="small" style={{ backgroundColor: '#5E6C84' }}>{currentIssue.reporter?.fullName?.[0]}</Avatar>
                {currentIssue.reporter?.fullName || 'Unknown'}
            </Space>
        },
        {
            label: 'Sprint',
            children: currentIssue.sprint?.name || 'Backlog'
        },
        {
            label: 'Story Points',
            children: <Input
                style={{ width: 60 }}
                defaultValue={currentIssue.storyPoints}
                onBlur={e => {
                    if (e.target.value !== String(currentIssue.storyPoints)) {
                        handleUpdate('storyPoints', Number(e.target.value));
                    }
                }}
                size="small"
            />
        },
        {
            label: 'Due Date',
            children: currentIssue.dueDate
                ? new Date(currentIssue.dueDate).toLocaleDateString()
                : <Text type="secondary">Not set</Text>
        }
    ];

    const timelineItems = (currentIssue.history || []).map(h => ({
        label: new Date(h.timestamp).toLocaleString(),
        children: `${h.updatedBy?.fullName || 'User'} changed ${h.field} from "${h.oldValue}" to "${h.newValue}"`
    })).reverse();

    return (
        <Drawer
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Space>
                        <Tag color="blue">{currentIssue.issueType?.toUpperCase()}</Tag>
                        <Text type="secondary">{currentIssue.key}</Text>
                        <LinkOutlined />
                    </Space>
                    <Space>
                        <Button icon={<ShareAltOutlined />} size="small">Share</Button>
                        {canDelete && (
                            <Popconfirm
                                title="Delete this task?"
                                description="This action cannot be undone."
                                onConfirm={handleDelete}
                                okText="Delete"
                                okType="danger"
                                cancelText="Cancel"
                                icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                            >
                                <Button icon={<DeleteOutlined />} size="small" danger>Delete</Button>
                            </Popconfirm>
                        )}
                        <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
                    </Space>
                </div>
            }
            placement="right"
            width={isMobile ? '100%' : 640}
            onClose={onClose}
            open={open}
            closable={false}
            mask={false}
            headerStyle={{ padding: '12px 24px' }}
        >
            <div style={{ paddingBottom: 24 }}>
                <Title level={4} editable={{ onChange: v => handleUpdate('title', v) }} style={{ marginBottom: 16 }}>
                    {currentIssue.title}
                </Title>

                <Space style={{ marginBottom: 20 }} wrap>
                    <Button icon={<PaperClipOutlined />} size="small">Attach</Button>
                    <Button icon={<LinkOutlined />} size="small">Link Issue</Button>
                </Space>

                {/* Calendar Sync Notice */}
                <CalendarLink />

                {/* AI Suggestions Section */}
                <AISuggestionsSection />

                <div style={{ display: 'flex', gap: 24, flexDirection: 'column' }}>
                    <div>
                        <Title level={5}>Description</Title>
                        <Paragraph
                            editable={{ onChange: v => handleUpdate('description', v) }}
                            style={{ minHeight: 60, color: '#172b4d', whiteSpace: 'pre-wrap' }}
                        >
                            {currentIssue.description || 'Click to add description...'}
                        </Paragraph>

                        <Tabs defaultActiveKey="1" items={[
                            {
                                key: '1',
                                label: `Comments (${currentIssue.comments?.length || 0})`,
                                children: (
                                    <>
                                        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                                            <Avatar style={{ backgroundColor: '#0052CC' }}>{user?.fullName?.[0]}</Avatar>
                                            <div style={{ flex: 1 }}>
                                                <TextArea
                                                    placeholder="Add a comment..."
                                                    autoSize={{ minRows: 2, maxRows: 6 }}
                                                    value={comment}
                                                    onChange={e => setComment(e.target.value)}
                                                />
                                                {comment && (
                                                    <div style={{ marginTop: 8 }}>
                                                        <Button type="primary" size="small" onClick={handleAddComment} loading={sending} style={{ marginRight: 8 }}>Save</Button>
                                                        <Button size="small" type="text" onClick={() => setComment('')}>Cancel</Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <List
                                            itemLayout="horizontal"
                                            dataSource={currentIssue.comments || []}
                                            locale={{ emptyText: 'No comments yet' }}
                                            renderItem={(item) => (
                                                <List.Item>
                                                    <List.Item.Meta
                                                        avatar={<Avatar size="small" style={{ backgroundColor: '#5E6C84' }}>{item.user?.fullName?.[0]}</Avatar>}
                                                        title={<Space><Text strong>{item.user?.fullName}</Text><Text type="secondary" style={{ fontSize: 12 }}>{new Date(item.timestamp).toLocaleString()}</Text></Space>}
                                                        description={item.text}
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    </>
                                ),
                            },
                            {
                                key: '2',
                                label: 'History',
                                children: (
                                    (currentIssue.history && currentIssue.history.length > 0) ?
                                        <List
                                            size="small"
                                            dataSource={timelineItems}
                                            renderItem={item => (
                                                <List.Item>
                                                    <Text type="secondary" style={{ fontSize: 12 }}>{item.label}</Text> <br />
                                                    <Text>{item.children}</Text>
                                                </List.Item>
                                            )}
                                        /> :
                                        <div style={{ padding: 16, textAlign: 'center', color: '#999' }}>No history yet</div>
                                )
                            }
                        ]} />
                    </div>

                    <Divider />

                    <div>
                        <Descriptions column={1} layout="horizontal" items={items} size="small" />
                        <Divider />
                        <div style={{ fontSize: 12, color: '#6B778C' }}>
                            <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Created {new Date(currentIssue.createdAt).toLocaleDateString()}</Text>
                            <Text type="secondary">Updated {new Date(currentIssue.updatedAt).toLocaleDateString()}</Text>
                        </div>
                    </div>
                </div>
            </div>
        </Drawer>
    );
};

export default IssueDetailDrawer;

