"use client";

import React, { useContext, useEffect } from "react";
import { Modal, Form, Input, Select, Button, message, Typography, DatePicker, InputNumber, Row, Col } from "antd";
import { ActivityActionContext, ActivityStateContext } from "@/app/providers/activityProvider";
import { ActivityType, ActivityPriority } from "@/app/providers/activityProvider/context";
import { ClientStateContext, ClientActionContext } from "@/app/providers/clientProvider";
import { OpportunityStateContext, OpportunityActionContext } from "@/app/providers/opportunitiesProvider";
import { AuthStateContext } from "@/app/providers/authProvider/context";
import { useStyles } from "../../dashboard/style";
import dayjs from "dayjs";

const { Text } = Typography;
const { TextArea } = Input;

interface Props {
    open: boolean;
    onCancel: () => void;
    // Optional: Pre-link to a specific entity if opened from a Client or Opp page
    initialRelatedType?: number;
    initialRelatedId?: string;
}

export default function LogActivityModal({ open, onCancel, initialRelatedType, initialRelatedId }: Props) {
    const { styles } = useStyles();
    const [form] = Form.useForm();
    
    const { user } = useContext(AuthStateContext);
    const { isPending } = useContext(ActivityStateContext);
    const activityActions = useContext(ActivityActionContext);
    
    const { clients } = useContext(ClientStateContext);
    const clientActions = useContext(ClientActionContext);
    const { opportunities } = useContext(OpportunityStateContext);
    const opportunityActions = useContext(OpportunityActionContext);

    useEffect(() => {
        if (open) {
            if (!clients?.length) clientActions?.getClients({ pageNumber: 1, pageSize: 100 });
            if (!opportunities?.length) opportunityActions?.getOpportunities({ pageNumber: 1, pageSize: 100 });
            
            form.setFieldsValue({
                relatedToType: initialRelatedType || 1,
                relatedToId: initialRelatedId
            });
        }
    }, [open, clients, opportunities, clientActions, opportunityActions, initialRelatedId, initialRelatedType, form]);

    const onFinish = async (values: any) => {
        if (!user?.userId) {
            message.error("Session expired. Please log in.");
            return;
        }

        try {
            const payload = {
                ...values,
                dueDate: values.dueDate.toISOString(), // API expects ISO DateTime
                assignedToId: user.userId,
            };

            await activityActions?.createActivity(payload);
            message.success("Activity logged successfully");
            form.resetFields();
            onCancel();
        } catch (error) {
            message.error("Failed to log activity");
        }
    };

    return (
        <Modal
            title={<span style={{ color: '#fff', letterSpacing: '1px' }}>LOG NEW ACTIVITY</span>}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={650}
            styles={{ 
                header: { background: '#0a0a0a', borderBottom: '1px solid #1a1a1a', paddingBottom: '16px' },
                body: { background: '#0a0a0a', paddingTop: '24px' }
            }}
        >
            <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ priority: 2, type: 1 }}>
                <Row gutter={16}>
                    <Col span={16}>
                        <Form.Item name="subject" label={<Text style={{ color: '#8c8c8c', fontSize: '11px' }}>SUBJECT</Text>} rules={[{ required: true }]}>
                            <Input className={styles.searchInput} placeholder="e.g., Follow-up on proposal" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="type" label={<Text style={{ color: '#8c8c8c', fontSize: '11px' }}>ACTIVITY TYPE</Text>} rules={[{ required: true }]}>
                            <Select className={styles.searchInput} popupClassName={styles.drawerSelectPopup}>
                                <Select.Option value={ActivityType.Task}>Task</Select.Option>
                                <Select.Option value={ActivityType.Call}>Call</Select.Option>
                                <Select.Option value={ActivityType.Meeting}>Meeting</Select.Option>
                                <Select.Option value={ActivityType.Email}>Email</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="relatedToType" label={<Text style={{ color: '#8c8c8c', fontSize: '11px' }}>LINK TO ENTITY</Text>} rules={[{ required: true }]}>
                            <Select className={styles.searchInput} popupClassName={styles.drawerSelectPopup}>
                                <Select.Option value={1}>Client</Select.Option>
                                <Select.Option value={2}>Opportunity</Select.Option>
                                <Select.Option value={3}>Pricing Request</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item 
                            noStyle 
                            shouldUpdate={(prev, curr) => prev.relatedToType !== curr.relatedToType}
                        >
                            {({ getFieldValue }) => {
                                const type = getFieldValue('relatedToType');
                                return (
                                    <Form.Item name="relatedToId" label={<Text style={{ color: '#8c8c8c', fontSize: '11px' }}>SELECT {type === 1 ? 'CLIENT' : 'OPPORTUNITY'}</Text>} rules={[{ required: true }]}>
                                        <Select 
                                            showSearch 
                                            optionFilterProp="children"
                                            className={styles.searchInput} 
                                            popupClassName={styles.drawerSelectPopup}
                                        >
                                            {type === 1 
                                                ? clients?.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)
                                                : opportunities?.map(o => <Select.Option key={o.id} value={o.id}>{o.title}</Select.Option>)
                                            }
                                        </Select>
                                    </Form.Item>
                                );
                            }}
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="dueDate" label={<Text style={{ color: '#8c8c8c', fontSize: '11px' }}>DUE DATE & TIME</Text>} rules={[{ required: true }]}>
                            <DatePicker showTime className={styles.searchInput} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="priority" label={<Text style={{ color: '#8c8c8c', fontSize: '11px' }}>PRIORITY</Text>}>
                            <Select className={styles.searchInput} popupClassName={styles.drawerSelectPopup}>
                                <Select.Option value={ActivityPriority.Low}>Low</Select.Option>
                                <Select.Option value={ActivityPriority.Medium}>Medium</Select.Option>
                                <Select.Option value={ActivityPriority.High}>High</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="duration" label={<Text style={{ color: '#8c8c8c', fontSize: '11px' }}>DURATION (MIN)</Text>}>
                            <InputNumber className={styles.searchInput} style={{ width: '100%' }} min={0} step={15} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="location" label={<Text style={{ color: '#8c8c8c', fontSize: '11px' }}>LOCATION / LINK</Text>}>
                    <Input className={styles.searchInput} placeholder="Teams link or physical office" />
                </Form.Item>

                <Form.Item name="description" label={<Text style={{ color: '#8c8c8c', fontSize: '11px' }}>DESCRIPTION</Text>}>
                    <TextArea className={styles.searchInput} rows={3} placeholder="Notes about this activity..." />
                </Form.Item>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                    <Button onClick={onCancel} ghost>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={isPending} className={styles.primaryButton}>
                        Log Activity
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}