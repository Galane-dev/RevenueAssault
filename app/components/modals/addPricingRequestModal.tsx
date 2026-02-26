"use client";

import React, { useContext, useEffect } from "react";
import { Modal, Form, Input, Select, Button, message, Typography, DatePicker } from "antd";
import { PricingActionContext, PricingStateContext } from "@/app/providers/pricingProvider";
import { ClientStateContext, ClientActionContext } from "@/app/providers/clientProvider";
import { OpportunityStateContext, OpportunityActionContext } from "../../providers/opportunitiesProvider"; 
// Importing Auth context to get the real User ID
import { AuthStateContext } from "../../providers/authProvider/context"; 
import { useStyles } from "../../dashboard/style";
import dayjs from "dayjs";

const { Text } = Typography;
const { TextArea } = Input;

interface Props {
    open: boolean;
    onCancel: () => void;
}

export default function AddPricingRequestModal({ open, onCancel }: Props) {
    const { styles } = useStyles();
    const [form] = Form.useForm();
    
    // Auth Context
    const { user } = useContext(AuthStateContext);
    
    // Pricing Context
    const { isPending } = useContext(PricingStateContext);
    const pricingActions = useContext(PricingActionContext);
    
    // Dependencies
    const { clients } = useContext(ClientStateContext);
    const clientActions = useContext(ClientActionContext);
    const { opportunities } = useContext(OpportunityStateContext);
    const opportunityActions = useContext(OpportunityActionContext);

    useEffect(() => {
        if (open) {
            if (!clients?.length) clientActions?.getClients({ pageNumber: 1, pageSize: 100 });
            if (!opportunities?.length) opportunityActions?.getOpportunities({ pageNumber: 1, pageSize: 100 });
        }
    }, [open, clients, opportunities, clientActions, opportunityActions]);

    const onFinish = async (values: any) => {
        if (!user?.userId) {
            message.error("User session not found. Please log in again.");
            return;
        }

        try {
            const payload = {
                ...values,
                requiredByDate: values.requiredByDate.format("YYYY-MM-DD"),
                requestedById: user.userId // Using real user ID from AuthProvider
            };

            await pricingActions?.createRequest(payload);
            message.success("Pricing request submitted successfully");
            form.resetFields();
            onCancel();
        } catch (error) {
            message.error("Failed to submit pricing request");
        }
    };

    return (
        <Modal
            title={<span style={{ color: '#fff', letterSpacing: '1px' }}>NEW PRICING REQUEST</span>}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={600}
            
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item 
                    name="title" 
                    label={<Text style={{ color: '#8c8c8c', fontSize: '11px' }}>REQUEST TITLE</Text>} 
                    rules={[{ required: true, message: 'Please enter a title' }]}
                >
                    <Input  placeholder="e.g., Custom Discount Analysis - Acme Corp" />
                </Form.Item>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item 
                        name="clientId" 
                        label={<Text style={{ color: '#8c8c8c', fontSize: '11px' }}>CLIENT / ACCOUNT</Text>}
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <Select 
                             
                            placeholder="Select Client"
                            showSearch
                            optionFilterProp="children"
                            popupClassName={styles.drawerSelectPopup}
                        >
                            {clients?.map(c => (
                                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item 
                        name="opportunityId" 
                        label={<Text style={{ color: '#8c8c8c', fontSize: '11px' }}>LINKED OPPORTUNITY</Text>}
                        style={{ flex: 1 }}
                    >
                        <Select 
                             
                            placeholder="Select Opportunity (Optional)"
                            allowClear
                            showSearch
                            optionFilterProp="children"
                            popupClassName={styles.drawerSelectPopup}
                        >
                            {opportunities?.map(o => (
                                <Select.Option key={o.id} value={o.id}>{o.title}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item 
                        name="priority" 
                        label={<Text style={{ color: '#8c8c8c', fontSize: '11px' }}>PRIORITY LEVEL</Text>}
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <Select  placeholder="Select Priority" popupClassName={styles.drawerSelectPopup}>
                            <Select.Option value={1}>Low</Select.Option>
                            <Select.Option value={2}>Medium</Select.Option>
                            <Select.Option value={3}>High</Select.Option>
                            <Select.Option value={4}>Urgent</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item 
                        name="requiredByDate" 
                        label={<Text style={{ color: '#8c8c8c', fontSize: '11px' }}>REQUIRED BY DATE</Text>}
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <DatePicker 
                             
                            style={{ width: '100%' }} 
                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                        />
                    </Form.Item>
                </div>

                <Form.Item 
                    name="description" 
                    label={<Text style={{ color: '#8c8c8c', fontSize: '11px' }}>DESCRIPTION & REQUIREMENTS</Text>}
                >
                    <TextArea 
                         
                        placeholder="Provide details on volume discounts, custom terms, etc." 
                        rows={4} 
                    />
                </Form.Item>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                    <Button onClick={onCancel} ghost>Cancel</Button>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={isPending} 
                        className={styles.primaryButton}
                    >
                        Submit Request
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}