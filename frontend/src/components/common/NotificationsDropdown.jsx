import { useState, useEffect } from 'react';
import { Dropdown, Badge, List, Avatar, Typography, Button, Empty, Spin } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import activityService from '../../services/activityService';
import { formatDistanceToNow } from 'date-fns';

const { Text } = Typography;

const NotificationsDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        loadUnreadCount();
         
    }, []);

    const loadUnreadCount = async () => {
        try {
            const data = await activityService.getUnreadCount();
            setUnreadCount(data.count);
        } catch (error) {
            console.error('Failed to load unread count:', error);
        }
    };

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const data = await activityService.getActivity({ limit: 10 });
            setNotifications(data.activities);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
        if (newOpen) {
            loadNotifications();
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await activityService.markAllAsRead();
            setUnreadCount(0);
            loadNotifications();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const formatTimeAgo = (date) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch {
            return 'recently';
        }
    };

    const dropdownContent = (
        <div style={{
            width: 360,
            maxHeight: 400,
            overflow: 'auto',
            backgroundColor: '#fff',
            borderRadius: 8,
            boxShadow: '0 6px 16px rgba(0,0,0,0.12)'
        }}>
            <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Text strong>Notifications</Text>
                {unreadCount > 0 && (
                    <Button
                        type="text"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={handleMarkAllRead}
                    >
                        Mark all read
                    </Button>
                )}
            </div>

            {loading ? (
                <div style={{ padding: 40, textAlign: 'center' }}>
                    <Spin />
                </div>
            ) : notifications.length > 0 ? (
                <List
                    dataSource={notifications}
                    renderItem={(item) => (
                        <List.Item
                            style={{
                                padding: '12px 16px',
                                backgroundColor: item.isRead ? '#fff' : '#f6f8fa',
                                cursor: 'pointer'
                            }}
                        >
                            <List.Item.Meta
                                avatar={
                                    <Avatar style={{ backgroundColor: '#0052cc' }}>
                                        {item.actor?.fullName?.[0] || '?'}
                                    </Avatar>
                                }
                                title={<Text style={{ fontSize: 13 }}>{item.message}</Text>}
                                description={
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {formatTimeAgo(item.createdAt)}
                                    </Text>
                                }
                            />
                        </List.Item>
                    )}
                />
            ) : (
                <Empty
                    description="No notifications"
                    style={{ padding: 40 }}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            )}
        </div>
    );

    return (
        <Dropdown
            dropdownRender={() => dropdownContent}
            trigger={['click']}
            open={open}
            onOpenChange={handleOpenChange}
            placement="bottomRight"
        >
            <Badge count={unreadCount} size="small">
                <BellOutlined style={{ fontSize: 20, cursor: 'pointer', color: '#6B778C' }} />
            </Badge>
        </Dropdown>
    );
};

export default NotificationsDropdown;
