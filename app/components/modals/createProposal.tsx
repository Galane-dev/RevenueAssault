"use client";

import React, { useContext, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Button, DatePicker, Select, Space, Divider, message } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { ProposalActionContext, ProposalStateContext } from "@/app/providers/proposalProvider";
import { OpportunityStateContext, OpportunityActionContext } from "@/app/providers/opportunitiesProvider";
import { useStyles } from '../../dashboard/style';

interface Props {
    open: boolean;
    onCancel: () => void;
}

export default function CreateProposalModal({ open, onCancel }: Props) {
    const { styles } = useStyles();
    const [form] = Form.useForm();

    const { isPending } = useContext(ProposalStateContext);
    const proposalActions = useContext(ProposalActionContext);
    const { opportunities } = useContext(OpportunityStateContext);
    const oppActions = useContext(OpportunityActionContext);

    useEffect(() => {
        if (open && (!opportunities || opportunities.length === 0)) {
            oppActions?.getOpportunities({ pageNumber: 1, pageSize: 50 });
        }
    }, [open, opportunities, oppActions]);

   const onFinish = async (values: any) => {
    try {
        const selectedOpp = opportunities?.find(o => o.id === values.opportunityId);
        
        // Pass raw values + the clientId. 
        // Let the Provider handle the Date and Number conversions.
        await proposalActions?.createProposal({
            ...values,
            clientId: selectedOpp?.clientId
        });

        message.success("Proposal created as Draft");
        form.resetFields();
        onCancel();
    } catch (error) {
        console.error("Submission failed:", error);
    }
};

    return (
        <Modal
            title={<span style={{ color: '#fff', letterSpacing: '1px' }}>CREATE FORMAL PROPOSAL</span>}
            open={open}
            onCancel={onCancel}
            width={800}
            footer={null}
            
        >
            <Form 
                form={form} 
                layout="vertical" 
                onFinish={onFinish} 
                // Set defaults so the payload isn't empty on first submit
                initialValues={{ 
                    currency: 'ZAR', 
                    lineItems: [{ description: '', quantity: 1, unitPrice: 0, taxRate: 15 }] 
                }}
            >
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item name="opportunityId" label="LINK TO OPPORTUNITY" rules={[{ required: true, message: 'Please link to a deal' }]} style={{ flex: 2 }}>
                        <Select  placeholder="Select a deal" popupClassName={styles.drawerSelectPopup}>
                            {opportunities?.map(opp => (
                                <Select.Option key={opp.id} value={opp.id}>{opp.title}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="currency" label="CURRENCY" style={{ flex: 1 }}>
                        <Input  readOnly />
                    </Form.Item>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item name="title" label="PROPOSAL TITLE" rules={[{ required: true, message: 'Title is required' }]} style={{ flex: 2 }}>
                        <Input  placeholder="e.g. Software License Implementation" />
                    </Form.Item>
                    <Form.Item name="validUntil" label="VALID UNTIL" rules={[{ required: true, message: 'Expiry date is required' }]} style={{ flex: 1 }}>
                        <DatePicker  style={{ width: '100%' }} />
                    </Form.Item>
                </div>

                <Divider style={{ borderColor: '#1a1a1a', margin: '24px 0' }} />
                <span style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 600 }}>LINE ITEMS</span>

                <Form.List name="lineItems">
                    {(fields, { add, remove }) => (
                        <div style={{ marginTop: 16 }}>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                    <Form.Item {...restField} name={[name, 'description']} rules={[{ required: true, message: 'Required' }]}>
                                        <Input  placeholder="Description" style={{ width: 250 }} />
                                    </Form.Item>
                                    <Form.Item {...restField} name={[name, 'quantity']} rules={[{ required: true }]}>
                                        <InputNumber  placeholder="Qty" min={1} />
                                    </Form.Item>
                                    <Form.Item {...restField} name={[name, 'unitPrice']} rules={[{ required: true }]}>
                                        <InputNumber  placeholder="Price" min={0} />
                                    </Form.Item>
                                    <Form.Item {...restField} name={[name, 'taxRate']}>
                                        <InputNumber  placeholder="Tax %" min={0} />
                                    </Form.Item>
                                    {fields.length > 1 && (
                                        <DeleteOutlined style={{ color: '#ff4d4f' }} onClick={() => remove(name)} />
                                    )}
                                </Space>
                            ))}
                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ color: '#8c8c8c', borderColor: '#303030', marginTop: 8 }}>
                                Add Item
                            </Button>
                        </div>
                    )}
                </Form.List>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '40px' }}>
                    <Button onClick={onCancel} style={{ background: 'transparent', color: '#fff', border: '1px solid #333' }}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={isPending} className={styles.primaryButton}>
                        Save Proposal
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}