import { useEffect } from 'react';
import { Row, Col, Card, Typography, Button, Empty, Spin, Tag, Avatar, Space } from 'antd';
import { PlusOutlined, TeamOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';

const { Title, Text, Paragraph } = Typography;

const ProjectsListPage = () => {
    const navigate = useNavigate();
    const { projects, isLoading, switchProject } = useProject();

    const handleProjectClick = (project) => {
        switchProject(project._id);
        navigate('/dashboard');
    };

    const getProjectTypeColor = (type) => {
        switch (type) {
            case 'scrum': return 'blue';
            case 'kanban': return 'green';
            default: return 'default';
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>Projects</Title>
                    <Text type="secondary">View and manage all your projects</Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/dashboard')} // Navigate to dashboard where Create modal can be opened
                >
                    Create Project
                </Button>
            </div>

            {projects.length === 0 ? (
                <Card>
                    <Empty
                        description={
                            <span>
                                No projects yet. <br />
                                Create your first project to get started!
                            </span>
                        }
                    >
                        <Button type="primary" icon={<PlusOutlined />}>
                            Create Project
                        </Button>
                    </Empty>
                </Card>
            ) : (
                <Row gutter={[24, 24]}>
                    {projects.map((project) => (
                        <Col xs={24} sm={12} lg={8} key={project._id}>
                            <Card
                                hoverable
                                onClick={() => handleProjectClick(project)}
                                style={{ height: '100%' }}
                                actions={[
                                    <Space key="members">
                                        <TeamOutlined />
                                        <span>{project.members?.length || 0}</span>
                                    </Space>,
                                    <SettingOutlined key="settings" onClick={(e) => {
                                        e.stopPropagation();
                                        switchProject(project._id);
                                        navigate('/dashboard/settings');
                                    }} />
                                ]}
                            >
                                <Card.Meta
                                    avatar={
                                        <Avatar
                                            style={{
                                                backgroundColor: '#0052CC',
                                                fontSize: 18,
                                                width: 48,
                                                height: 48,
                                                lineHeight: '48px'
                                            }}
                                        >
                                            {project.key?.[0] || project.name?.[0]}
                                        </Avatar>
                                    }
                                    title={
                                        <Space>
                                            <span>{project.name}</span>
                                            <Tag color={getProjectTypeColor(project.projectType)}>
                                                {project.projectType || 'scrum'}
                                            </Tag>
                                        </Space>
                                    }
                                    description={
                                        <>
                                            <Text type="secondary" strong>{project.key}</Text>
                                            <Paragraph
                                                type="secondary"
                                                ellipsis={{ rows: 2 }}
                                                style={{ marginTop: 8, marginBottom: 0 }}
                                            >
                                                {project.description || 'No description'}
                                            </Paragraph>
                                        </>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default ProjectsListPage;
