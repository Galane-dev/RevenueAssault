"use client";

import React, { useEffect, useContext, useState } from "react";
import { Table, Typography, Tag, Button, Space, Tooltip, message } from "antd";
import { 
    SendOutlined, 
    CheckCircleOutlined, 
    CloseCircleOutlined, 
    PlusOutlined,
    EyeOutlined,
    DeleteOutlined
} from "@ant-design/icons";
import { useStyles } from "../style";

// Providers
import { ProposalProvider, ProposalStateContext, ProposalActionContext } from "@/app/providers/proposalProvider";
import { OpportunityProvider } from "@/app/providers/opportunitiesProvider";

// Components
import CreateProposalModal from "../../components/modals/createProposal";
import { Can } from "../../components/auth/can";
import { withAuth } from "../../hoc/withAuth";

const { Title, Text } = Typography;

const STATUS_CONFIG: Record<number, { label: string, color: string }> = {
    1: { label: "DRAFT", color: "default" },
    2: { label: "SUBMITTED", color: "processing" },
    3: { label: "REJECTED", color: "error" },
    4: { label: "APPROVED", color: "success" },
};

function ProposalsContent() {
    const { styles } = useStyles();
    const { proposals, filters, totalCount, isPending } = useContext(ProposalStateContext);
    const actions = useContext(ProposalActionContext);

    // --- State to control the Modal ---
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        actions?.getProposals(filters);
    }, [filters, actions]);

    const handleAction = async (id: string, actionFn: (id: string) => Promise<void>, label: string) => {
        try {
            await actionFn(id);
            message.success(`Proposal ${label} successfully`);
        } catch (e) {
            message.error(`Failed to ${label} proposal`);
        }
    };

    const columns = [
        {
            title: "PROPOSAL TITLE",
            dataIndex: "title",
            key: "title",
            render: (text: string) => <Text strong style={{ color: '#fff' }}>{text}</Text>
        },
        {
            title: "STATUS",
            dataIndex: "status",
            key: "status",
            render: (status: number) => (
                <Tag color={STATUS_CONFIG[status]?.color} style={{ borderRadius: '2px' }}>
                    {STATUS_CONFIG[status]?.label}
                </Tag>
            )
        },
        {
            title: "TOTAL VALUE",
            dataIndex: "totalAmount",
            key: "totalAmount",
            render: (val: number, record: any) => (
                <Text style={{ color: '#fff' }}>{record.currency} {val?.toLocaleString() || "0.00"}</Text>
            )
        },
        {
            title: "VALID UNTIL",
            dataIndex: "validUntil",
            key: "validUntil",
            render: (date: string) => <Text style={{ color: '#595959' }}>{new Date(date).toLocaleDateString()}</Text>
        },
        {
            title: "ACTIONS",
            key: "actions",
            render: (record: any) => (
                <Space size="middle">
                    <Tooltip title="View Details">
                        <Button type="text" icon={<EyeOutlined />} style={{ color: '#8c8c8c' }} />
                    </Tooltip>

                    {record.status === 1 && (
                        <Tooltip title="Submit for Approval">
                            <Button 
                                type="text" 
                                icon={<SendOutlined />} 
                                onClick={() => handleAction(record.id, actions!.submitProposal, "submitted")}
                                style={{ color: '#1677ff' }} 
                            />
                        </Tooltip>
                    )}

                    {record.status === 2 && (
                        <>
                            <Can perform="APPROVE_PROPOSAL">
                                <Tooltip title="Approve">
                                    <Button 
                                        type="text" 
                                        icon={<CheckCircleOutlined />} 
                                        onClick={() => handleAction(record.id, actions!.approveProposal, "approved")}
                                        style={{ color: '#52c41a' }} 
                                    />
                                </Tooltip>
                            </Can>
                            <Can perform="REJECT_PROPOSAL">
                                <Tooltip title="Reject">
                                    <Button 
                                        type="text" 
                                        icon={<CloseCircleOutlined />} 
                                        onClick={() => handleAction(record.id, actions!.rejectProposal, "rejected")}
                                        style={{ color: '#ff4d4f' }} 
                                    />
                                </Tooltip>
                            </Can>
                        </>
                    )}

                    {record.status === 1 && (
                        <Can perform="DELETE_PROPOSAL">
                            <Tooltip title="Delete">
                                <Button 
                                    type="text" 
                                    danger
                                    icon={<DeleteOutlined />} 
                                    onClick={() => {
                                        if (window.confirm("Are you sure you want to delete this proposal?")) {
                                            //handleAction(record.id, actions!.deleteProposal, "deleted");
                                        }
                                    }}
                                    style={{ color: '#ff4d4f' }} 
                                />
                            </Tooltip>
                        </Can>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '0 24px' }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
                <header>
                    <Text style={{ color: '#595959', letterSpacing: '2px', fontSize: '10px', fontWeight: 700 }}>
                        FINANCIAL DOCUMENTS
                    </Text>
                    <Title level={2} className={styles.pageTitle} style={{ margin: 0, marginTop: 4 }}>
                        PROPOSALS & QUOTES
                    </Title>
                </header>
                <Can perform="CREATE_PROPOSAL">
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        className={styles.primaryButton} 
                        size="large"
                        onClick={() => setIsCreateModalOpen(true)} // Hooked up the click
                    >
                        CREATE PROPOSAL
                    </Button>
                </Can>
            </div>

            <Table 
                columns={columns} 
                dataSource={proposals} 
                loading={isPending}
                rowKey="id"
                className={styles.customTable}
                pagination={{
                    total: totalCount,
                    current: filters.pageNumber,
                    pageSize: filters.pageSize,
                    onChange: (page) => actions?.updateFilters({ pageNumber: page })
                }}
            />

            {/* Modal Component */}
            <Can perform="CREATE_PROPOSAL">
                <CreateProposalModal 
                    open={isCreateModalOpen} 
                    onCancel={() => setIsCreateModalOpen(false)} 
                />
            </Can>
        </div>
    );
}

export default withAuth(function ProposalsPage() {
    return (
        <OpportunityProvider>
            <ProposalProvider>
                <ProposalsContent />
            </ProposalProvider>
        </OpportunityProvider>
    );
});