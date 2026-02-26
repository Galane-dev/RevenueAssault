"use client";

import React, { useContext, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, DatePicker, Button, message } from "antd";
import { OpportunityActionContext, OpportunityStateContext } from "../../providers/opportunitiesProvider/context";
import { ClientStateContext, ClientActionContext } from "@/app/providers/clientProvider/context";
import { useStyles } from "../../dashboard/style";
import dayjs from "dayjs";

interface Props {
    open: boolean;
    onCancel: () => void;
}

export default function CreateOpportunityModal({ open, onCancel }: Props) {
    const { styles } = useStyles();
    const [form] = Form.useForm();
    
    // Opportunity Context
    const { isPending } = useContext(OpportunityStateContext);
    const oppActions = useContext(OpportunityActionContext);
    
    // Client Context
    const { clients } = useContext(ClientStateContext);
    const clientActions = useContext(ClientActionContext);

    // Fetch clients if list is empty when modal opens
    useEffect(() => {
        if (open && (!clients || clients.length === 0)) {
            clientActions?.getClients({ pageNumber: 1, pageSize: 100 });
        }
    }, [open, clients, clientActions]);

    const onFinish = async (values: any) => {
        try {
            const payload = {
                ...values,
                // Ensure these numbers are actually numbers
                estimatedValue: Number(values.estimatedValue) || 0,
                probability: Number(values.probability) || 0,
                // v2.0 API uses currency
                currency: values.currency || "ZAR", 
                expectedCloseDate: values.expectedCloseDate.format("YYYY-MM-DD"),
                stage: 1, // Discovery
            };
            await oppActions?.createOpportunity(payload);
            message.success("Deal added to pipeline");
            form.resetFields();
            onCancel();
        } catch (error) {
            message.error("Failed to create opportunity");
        }
    };

    return (
        <Modal
            title={<span style={{ color: '#fff' }}>NEW SALES OPPORTUNITY</span>}
            open={open}
            onCancel={onCancel}
            footer={null}
            styles={{ 
                body: { background: '#0a0a0a', padding: '24px' },
                header: { background: '#0a0a0a', borderBottom: '1px solid #1a1a1a' }
            }}
        >
            <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 24 }}>
                <Form.Item name="title" label={<Text color="#8c8c8c">DEAL TITLE</Text>} rules={[{ required: true }]}>
                    <Input className={styles.searchInput} placeholder="e.g. Q3 Software Licensing" />
                </Form.Item>

                <Form.Item name="clientId" label={<Text color="#8c8c8c">CLIENT / COMPANY</Text>} rules={[{ required: true }]}>
                    <Select 
                        className={styles.searchInput} 
                        showSearch
                        optionFilterProp="children"
                        popupClassName={styles.drawerSelectPopup}
                    >
                        {clients?.map(c => (
                            <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item name="estimatedValue" label={<Text color="#8c8c8c">EST. VALUE</Text>}>
                    <InputNumber 
                        className={styles.searchInput} 
                        style={{ width: '100%' }} 
                        // Remove formatter for the raw value sent to API
                        placeholder="50000"
                    />
                        </Form.Item>

                        {/* HIDDEN OR READONLY CURRENCY - MUST BE IN FORM TO BE IN ONFINISH */}
                        <Form.Item name="currency" hidden initialValue="ZAR">
                            <Input />
                    </Form.Item>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item name="probability" label={<Text color="#8c8c8c">PROBABILITY (%)</Text>} style={{ flex: 1 }}>
                        <InputNumber className={styles.searchInput} style={{ width: '100%' }} min={0} max={100} />
                    </Form.Item>
                    <Form.Item name="expectedCloseDate" label={<Text color="#8c8c8c">CLOSE DATE</Text>} style={{ flex: 1 }}>
                        <DatePicker className={styles.searchInput} style={{ width: '100%' }} />
                    </Form.Item>
                </div>

                <Form.Item style={{ textAlign: 'right', marginTop: 32, marginBottom: 0 }}>
                    <Button onClick={onCancel} style={{ marginRight: 8 }} ghost>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={isPending} className={styles.primaryButton}>
                        Create Deal
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
}

const Text = ({ children, color }: any) => <span style={{ color, fontSize: '11px', fontWeight: 700 }}>{children}</span>;