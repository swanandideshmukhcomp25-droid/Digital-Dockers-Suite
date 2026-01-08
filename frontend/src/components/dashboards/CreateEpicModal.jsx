import { Modal, Form, Input, Select, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

const CreateEpicModal = ({ open, onClose, onSubmit }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const statusOptions = [
        { label: 'Planned', value: 'PLANNED' },
        { label: 'In Progress', value: 'IN_PROGRESS' },
        { label: 'Done', value: 'DONE' }
    ];

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const epicData = {
                name: values.name,
                description: values.description,
                status: values.status || 'PLANNED',
                start_date: values.start_date.format('YYYY-MM'),
                end_date: values.end_date.format('YYYY-MM'),
                owner: values.owner
            };

            // Validate dates
            if (values.start_date.isAfter(values.end_date)) {
                message.error('Start date must be before end date');
                setLoading(false);
                return;
            }

            await onSubmit(epicData);
            form.resetFields();
        } catch (error) {
            console.error('Error creating epic:', error);
            message.error('Failed to create epic');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title="Create Epic"
            open={open}
            onOk={form.submit}
            onCancel={handleCancel}
            width={500}
            confirmLoading={loading}
            okText="Create"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
            >
                <Form.Item
                    label="Epic Name"
                    name="name"
                    rules={[
                        { required: true, message: 'Please enter epic name' },
                        { min: 3, message: 'Epic name must be at least 3 characters' }
                    ]}
                >
                    <Input placeholder="e.g., Q1 - Core Infrastructure" />
                </Form.Item>

                <Form.Item
                    label="Description"
                    name="description"
                    rules={[{ required: false }]}
                >
                    <Input.TextArea
                        placeholder="Optional: Brief description of the epic"
                        rows={3}
                    />
                </Form.Item>

                <Form.Item
                    label="Start Month"
                    name="start_date"
                    rules={[{ required: true, message: 'Please select start month' }]}
                >
                    <DatePicker
                        picker="month"
                        format="YYYY-MM"
                        style={{ width: '100%' }}
                        disabledDate={(current) => current && current.isBefore(dayjs().startOf('day'))}
                    />
                </Form.Item>

                <Form.Item
                    label="End Month"
                    name="end_date"
                    rules={[{ required: true, message: 'Please select end month' }]}
                >
                    <DatePicker
                        picker="month"
                        format="YYYY-MM"
                        style={{ width: '100%' }}
                        disabledDate={(current) => current && current.isBefore(dayjs().startOf('day'))}
                    />
                </Form.Item>

                <Form.Item
                    label="Status"
                    name="status"
                    initialValue="PLANNED"
                >
                    <Select options={statusOptions} />
                </Form.Item>

                <Form.Item
                    label="Owner (Optional)"
                    name="owner"
                    rules={[{ required: false }]}
                >
                    <Input placeholder="Team or person responsible" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateEpicModal;
