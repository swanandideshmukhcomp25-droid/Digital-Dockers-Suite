import { useState } from 'react';
import { Modal, Form, Input, Select, Button, message, Space } from 'antd';
import { useProject } from '../../context/ProjectContext';
import taskService from '../../services/taskService';

const { TextArea } = Input;

/**
 * CreateIssueModal
 * 
 * Minimal Create Issue form for Kanban board
 * Opens as modal, submits to /api/tasks
 * Handles optimistic UI updates
 */
const CreateIssueModal = ({ open, onClose, onIssueCreated }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { currentProject, sprints, activeSprint } = useProject();

    const handleSubmit = async (values) => {
        if (!currentProject?._id) {
            message.error('Please select a project first');
            return;
        }

        setLoading(true);
        try {
            // Call API to create task/issue
            const response = await taskService.createTask({
                title: values.title,
                description: values.description || '',
                projectId: currentProject._id,
                priority: values.priority || 'medium',
                issueType: values.issueType || 'task',
                sprintId: values.sprintId || activeSprint?._id || null, // Null = backlog
                storyPoints: values.storyPoints || 0,
                assignedTo: values.assignedTo ? [values.assignedTo] : []
            });

            // Success
            const createdIssue = response.data || response;
            message.success(`Created ${createdIssue.key || 'issue'}`);
            
            // Reset form
            form.resetFields();
            
            // Callback to refresh board
            if (onIssueCreated) {
                onIssueCreated(createdIssue);
            }
            
            // Close modal
            onClose();
        } catch (error) {
            console.error('Error creating issue:', error);
            message.error(
                error.response?.data?.message || 
                'Failed to create issue'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Create Issue"
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button 
                    key="submit" 
                    type="primary" 
                    loading={loading}
                    onClick={() => form.submit()}
                >
                    Create
                </Button>
            ]}
            width={500}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
            >
                {/* Title - Required */}
                <Form.Item
                    label="Title"
                    name="title"
                    rules={[
                        { required: true, message: 'Title is required' },
                        { min: 3, message: 'Title must be at least 3 characters' }
                    ]}
                >
                    <Input 
                        placeholder="e.g., Fix login button" 
                        maxLength={100}
                    />
                </Form.Item>

                {/* Description - Optional */}
                <Form.Item
                    label="Description"
                    name="description"
                >
                    <TextArea 
                        placeholder="Describe the issue..." 
                        rows={3}
                        maxLength={500}
                    />
                </Form.Item>

                {/* Issue Type */}
                <Form.Item
                    label="Issue Type"
                    name="issueType"
                    initialValue="task"
                >
                    <Select>
                        <Select.Option value="task">Task</Select.Option>
                        <Select.Option value="bug">Bug</Select.Option>
                        <Select.Option value="feature">Feature</Select.Option>
                        <Select.Option value="epic">Epic</Select.Option>
                    </Select>
                </Form.Item>

                {/* Priority */}
                <Form.Item
                    label="Priority"
                    name="priority"
                    initialValue="medium"
                >
                    <Select>
                        <Select.Option value="lowest">Lowest</Select.Option>
                        <Select.Option value="low">Low</Select.Option>
                        <Select.Option value="medium">Medium</Select.Option>
                        <Select.Option value="high">High</Select.Option>
                        <Select.Option value="highest">Highest</Select.Option>
                    </Select>
                </Form.Item>

                {/* Sprint - Optional */}
                <Form.Item
                    label="Sprint"
                    name="sprintId"
                    initialValue={activeSprint?._id}
                >
                    <Select
                        placeholder="Select sprint (leave empty for backlog)"
                        allowClear
                    >
                        {sprints?.map(sprint => (
                            <Select.Option key={sprint._id} value={sprint._id}>
                                {sprint.name} ({sprint.status})
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* Story Points - Optional */}
                <Form.Item
                    label="Story Points"
                    name="storyPoints"
                >
                    <Select placeholder="Select or leave empty">
                        <Select.Option value={0}>0</Select.Option>
                        <Select.Option value={1}>1</Select.Option>
                        <Select.Option value={2}>2</Select.Option>
                        <Select.Option value={3}>3</Select.Option>
                        <Select.Option value={5}>5</Select.Option>
                        <Select.Option value={8}>8</Select.Option>
                        <Select.Option value={13}>13</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateIssueModal;
