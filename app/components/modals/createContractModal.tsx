"use client";

import React, { useContext, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Button, DatePicker, Select, message } from "antd";
import { ContractActionContext, ContractStateContext } from "@/app/providers/contractProvider";
import { ClientStateContext, ClientActionContext } from "@/app/providers/clientProvider";
import { OpportunityActionContext, OpportunityStateContext } from "@/app/providers/opportunitiesProvider";
import { ProposalActionContext, ProposalStateContext } from "@/app/providers/proposalProvider";
import { AuthStateContext } from "@/app/providers/authProvider/context";
import { useStyles } from '../../dashboard/style';

interface Props {
    open: boolean;
    onCancel: () => void;
}

const Text = ({ children, color }: any) => <span style={{ color, fontSize: '12px', fontWeight: 600 }}>{children}</span>;

export default function CreateContractModal({ open, onCancel }: Props) {
    const { styles } = useStyles();
    const [form] = Form.useForm();

    const { isPending } = useContext(ContractStateContext);
    const contractActions = useContext(ContractActionContext);
    const { clients } = useContext(ClientStateContext);
    const clientActions = useContext(ClientActionContext);
    const { opportunities } = useContext(OpportunityStateContext);
    const opportunityActions = useContext(OpportunityActionContext);
    const { proposals } = useContext(ProposalStateContext);
    const proposalActions = useContext(ProposalActionContext);
    const { user } = useContext(AuthStateContext);

    useEffect(() => {
        if (open) {
            if (!clients || clients.length === 0) {
                clientActions?.getClients({ pageNumber: 1, pageSize: 100 });
            }
            if (!opportunities || opportunities.length === 0) {
                opportunityActions?.getOpportunities({ pageNumber: 1, pageSize: 100 });
            }
            if (!proposals || proposals.length === 0) {
                proposalActions?.getProposals({ pageNumber: 1, pageSize: 100 });
            }
        }
    }, [open, clients, clientActions, opportunities, opportunityActions, proposals, proposalActions]);

    const onFinish = async (values: any) => {
        try {
            // Format dates and values for API with correct field names
            const formattedValues = {
                clientId: values.clientId,
                title: values.title,
                contractValue: Number(values.contractValue),
                currency: values.currency,
                startDate: values.startDate ? new Date(values.startDate).toISOString().split('T')[0] : null,
                endDate: values.endDate ? new Date(values.endDate).toISOString().split('T')[0] : null,
                ownerId: user?.userId,
                terms: values.terms || "",
                renewalNoticePeriod: values.renewalNoticePeriod || 90,
                autoRenew: values.autoRenew || false,
                // Optional fields
                ...(values.opportunityId && { opportunityId: values.opportunityId }),
                ...(values.proposalId && { proposalId: values.proposalId }),
            };

            await contractActions?.createContract(formattedValues);
            message.success("Contract created successfully");
            form.resetFields();
            onCancel();
        } catch (error) {
            message.error("Failed to create contract");
        }
    };

    return (
        <Modal
            title={<span style={{ color: '#fff', letterSpacing: '1px' }}>CREATE NEW CONTRACT</span>}
            open={open}
            onCancel={onCancel}
            width={700}
            footer={null}
            styles={{ 
                mask: { backdropFilter: 'blur(4px)' }
            }}
            modalRender={(modal) => (
                <div style={{ border: '1px solid #1a1a1a', borderRadius: '8px', overflow: 'hidden' }}>
                    {modal}
                </div>
            )}
        >
            <Form 
                form={form} 
                layout="vertical" 
                onFinish={onFinish}
                initialValues={{ 
                    currency: 'ZAR',
                    status: 1
                }}
            >
                {/* Client Selection */}
                <Form.Item 
                    name="clientId" 
                    label={<Text color="#8c8c8c">CLIENT</Text>}
                    rules={[{ required: true, message: 'Please select a client' }]}
                >
                    <Select 
                         
                        placeholder="Select a client" 
                        popupClassName={styles.drawerSelectPopup}
                    >
                        {clients?.map(client => (
                            <Select.Option key={client.id} value={client.id}>
                                {client.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* Contract Title */}
                <Form.Item 
                    name="title" 
                    label={<Text color="#8c8c8c">CONTRACT TITLE</Text>}
                    rules={[{ required: true, message: 'Title is required' }]}
                >
                    <Input 
                         
                        placeholder="e.g. Annual Software License Agreement" 
                    />
                </Form.Item>

                {/* Dates */}
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item 
                        name="startDate" 
                        label={<Text color="#8c8c8c">START DATE</Text>}
                        rules={[{ required: true, message: 'Start date is required' }]}
                        style={{ flex: 1 }}
                    >
                        <DatePicker  style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item 
                        name="endDate" 
                        label={<Text color="#8c8c8c">END DATE</Text>}
                        rules={[{ required: true, message: 'End date is required' }]}
                        style={{ flex: 1 }}
                    >
                        <DatePicker  style={{ width: '100%' }} />
                    </Form.Item>
                </div>

                {/* Contract Value */}
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item 
                        name="contractValue" 
                        label={<Text color="#8c8c8c">CONTRACT VALUE</Text>}
                        rules={[{ required: true, message: 'Value is required' }]}
                        style={{ flex: 2 }}
                    >
                        <InputNumber 
                            
                            placeholder="0.00"
                            min={0}
                            precision={2}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item 
                        name="currency" 
                        label={<Text color="#8c8c8c">CURRENCY</Text>}
                        style={{ flex: 1 }}
                    >
                        <Input  readOnly />
                    </Form.Item>
                </div>

                {/* Opportunity and Proposal Selection */}
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item 
                        name="opportunityId" 
                        label={<Text color="#8c8c8c">OPPORTUNITY</Text>}
                        rules={[{ required: true, message: 'Please select an opportunity' }]}
                        style={{ flex: 1 }}
                    >
                        <Select 
                             
                            placeholder="Select an opportunity" 
                            popupClassName={styles.drawerSelectPopup}
                        >
                            {opportunities?.map((opp: any) => (
                                <Select.Option key={opp.id} value={opp.id}>
                                    {opp.title}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item 
                        name="proposalId" 
                        label={<Text color="#8c8c8c">PROPOSAL</Text>}
                        rules={[{ required: true, message: 'Please select a proposal' }]}
                        style={{ flex: 1 }}
                    >
                        <Select 
                             
                            placeholder="Select a proposal" 
                            popupClassName={styles.drawerSelectPopup}
                        >
                            {proposals?.map((proposal: any) => (
                                <Select.Option key={proposal.id} value={proposal.id}>
                                    {proposal.title}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>

                {/* Renewal Settings */}
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item 
                        name="renewalNoticePeriod" 
                        label={<Text color="#8c8c8c">RENEWAL NOTICE PERIOD (DAYS)</Text>}
                        style={{ flex: 1 }}
                        initialValue={90}
                    >
                        <InputNumber 
                            
                            min={0}
                            precision={0}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item 
                        name="autoRenew" 
                        label={<Text color="#8c8c8c">AUTO-RENEW</Text>}
                        style={{ flex: 1 }}
                        valuePropName="checked"
                    >
                        <input type="checkbox" style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                    </Form.Item>
                </div>

                {/* Terms & Conditions */}
                <Form.Item 
                    name="terms" 
                    label={<Text color="#8c8c8c">TERMS & CONDITIONS</Text>}
                >
                    <Input.TextArea 
                        
                        placeholder="Enter key terms, conditions, or special clauses..."
                        rows={4}
                        style={{ resize: 'none' }}
                    />
                </Form.Item>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '40px' }}>
                    <Button 
                        onClick={onCancel} 
                        style={{ background: 'transparent', color: '#fff', border: '1px solid #333' }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={isPending} 
                        className={styles.primaryButton}
                    >
                        Create Contract
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}
