import { Card, List, Tag, Typography, Row, Col, Button, Empty } from 'antd';
import { ClockCircleOutlined, EyeOutlined, FireOutlined } from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';

const { Text, Title } = Typography;

const ForYouSection = ({ assignedIssues, recentlyViewed, recentlyUpdated }) => {
    const getStatusColor = (status) => {
        const statusColors = {
            'todo': '#f3f4f6',
            'in_progress': '#dbeafe',
            'review': '#fed7aa',
            'done': '#d1fae5'
        };
        return statusColors[status] || '#f3f4f6';
    };

    const getStatusTextColor = (status) => {
        const textColors = {
            'todo': '#4b5563',
            'in_progress': '#0052cc',
            'review': '#d97706',
            'done': '#00875a'
        };
        return textColors[status] || '#4b5563';
    };

    const formatTime = (date) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch {
            return 'recently';
        }
    };

    const IssueItem = ({ item, showTime = false, timeField = 'viewedAt' }) => (
        <div style={{
            padding: '12px 0',
            borderBottom: '1px solid #eaeef2',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            borderRadius: '6px',
            paddingLeft: '8px',
            paddingRight: '8px',
            marginLeft: '-8px',
            marginRight: '-8px'
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
                    {item.key || 'TASK'}
                </Tag>
                <Text ellipsis style={{ maxWidth: 150, fontSize: '13px', fontWeight: '500' }}>
                    {item.title}
                </Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
                <div style={{
                    background: getStatusColor(item.status),
                    color: getStatusTextColor(item.status),
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600'
                }}>
                    {item.status?.replace('_', ' ').toUpperCase() || 'TODO'}
                </div>
                {showTime && (
                    <Text type="secondary" style={{ fontSize: 11 }}>
                        {formatTime(item[timeField] || new Date())}
                    </Text>
                )}
            </div>
        </div>
    );

    return (
        <Row gutter={[24, 24]}>
            {/* Assigned to You */}
            <Col xs={24} lg={8}>
                <Card
                    className="for-you-card"
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FireOutlined style={{ color: '#ff5630', fontSize: 16 }} />
                            <span style={{ fontSize: 14, fontWeight: '600' }}>Assigned to You</span>
                        </div>
                    }
                    hoverable
                >
                    {assignedIssues && assignedIssues.length > 0 ? (
                        <div>
                            {assignedIssues.map((item, idx) => (
                                <IssueItem key={idx} item={item} />
                            ))}
                        </div>
                    ) : (
                        <Empty description="No tasks assigned" size="small" style={{ padding: '20px 0' }} />
                    )}
                </Card>
            </Col>

            {/* Recently Viewed */}
            <Col xs={24} lg={8}>
                <Card
                    className="for-you-card"
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <EyeOutlined style={{ color: '#0052cc', fontSize: 16 }} />
                            <span style={{ fontSize: 14, fontWeight: '600' }}>Recently Viewed</span>
                        </div>
                    }
                    hoverable
                >
                    {recentlyViewed && recentlyViewed.length > 0 ? (
                        <div>
                            {recentlyViewed.map((item, idx) => (
                                <IssueItem key={idx} item={item} showTime timeField="viewedAt" />
                            ))}
                        </div>
                    ) : (
                        <Empty description="No recent views" size="small" style={{ padding: '20px 0' }} />
                    )}
                </Card>
            </Col>

            {/* Recently Updated */}
            <Col xs={24} lg={8}>
                <Card
                    className="for-you-card"
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <ClockCircleOutlined style={{ color: '#ffab00', fontSize: 16 }} />
                            <span style={{ fontSize: 14, fontWeight: '600' }}>Recently Updated</span>
                        </div>
                    }
                    hoverable
                >
                    {recentlyUpdated && recentlyUpdated.length > 0 ? (
                        <div>
                            {recentlyUpdated.map((item, idx) => (
                                <IssueItem key={idx} item={item} showTime timeField="updatedAt" />
                            ))}
                        </div>
                    ) : (
                        <Empty description="No recent updates" size="small" style={{ padding: '20px 0' }} />
                    )}
                </Card>
            </Col>
        </Row>
    );
};

export default ForYouSection;
