"use client";

import React, { useEffect, useContext, useState } from "react";
import { Table, Typography, Tag, Button, Space, Tooltip, message, Drawer, Divider } from "antd";
import { 
    SendOutlined, 
    CheckCircleOutlined, 
    CloseCircleOutlined, 
    PlusOutlined,
    EyeOutlined,
    DeleteOutlined,
    MessageOutlined
} from "@ant-design/icons";
import { useStyles } from "../style";

// Providers
import { ProposalProvider, ProposalStateContext, ProposalActionContext } from "@/app/providers/proposalProvider";
import { IProposal } from "@/app/providers/proposalProvider/context";
import { OpportunityProvider } from "@/app/providers/opportunitiesProvider";
import { NoteProvider } from "@/app/providers/noteProvider";
import { EntityType } from "@/app/providers/noteProvider/context";

// Components
import CreateProposalModal from "../../components/modals/createProposal";
import { AIChatComponent, ChatButton } from "../../components/ai";
import { Can } from "../../components/auth/can";
import { withAuth } from "../../hoc/withAuth";
import { useAIChat } from "@/app/hooks/useAIChat";
import { useAIProposalsContext } from "@/app/providers/proposalProvider/useAIContext";
import { NoteSection } from "@/app/components/notes/notes";

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
    const { isChatOpen, openChat, closeChat } = useAIChat({
        pageTitle: 'Proposals',
    });
    const aiContext = useAIProposalsContext();

    // --- State to control the Modal ---
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState<IProposal | null>(null);

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

    const handleRowClick = (record: IProposal) => {
        setSelectedProposal(record);
        setIsDrawerOpen(true);
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
            render: (val: number, record: IProposal) => (
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
            title: "NOTES",
            key: "notes",
            align: 'center' as const,
            render: () => <MessageOutlined style={{ color: '#595959' }} />
        },
        {
            title: "ACTIONS",
            key: "actions",
            render: (_: unknown, record: IProposal) => (
                <Space size="middle" onClick={(e) => e.stopPropagation()}>
                    

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
                                            actions!.deleteProposal(record.id);
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
                <div style={{ display: 'flex', gap: 12 }}>
                    <ChatButton
                        onClick={() => openChat(aiContext)}
                        title="Ask AI about proposals"
                    />
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
            </div>

            <Table 
                columns={columns} 
                dataSource={proposals} 
                loading={isPending}
                rowKey="id"
                className={styles.customTable}
                onRow={(record) => ({
                    onClick: () => handleRowClick(record),
                })}
                pagination={{
                    total: totalCount,
                    current: filters.pageNumber,
                    pageSize: filters.pageSize,
                    onChange: (page) => actions?.updateFilters({ pageNumber: page })
                }}
            />

            <Drawer
                title={
                    <div>
                        <Text type="secondary" style={{ fontSize: '10px', display: 'block' }}>PROPOSAL DETAILS</Text>
                        <Title level={4} style={{ margin: 0, color: '#fff' }}>{selectedProposal?.title}</Title>
                    </div>
                }
                placement="right"
                width={500}
                onClose={() => {
                    setIsDrawerOpen(false);
                    setSelectedProposal(null);
                }}
                open={isDrawerOpen}
                styles={{
                    body: { background: '#141414', padding: '24px' },
                    header: { background: '#141414', borderBottom: '1px solid #303030' }
                }}
            >
                {selectedProposal && (
                    <>
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <Text type="secondary">Status: </Text>
                                    <Tag color={STATUS_CONFIG[selectedProposal.status]?.color}>
                                        {STATUS_CONFIG[selectedProposal.status]?.label}
                                    </Tag>
                                </div>
                                <Text style={{ color: '#8c8c8c' }}>
                                    Valid until: {new Date(selectedProposal.validUntil).toLocaleDateString()}
                                </Text>
                            </div>
                            <Divider style={{ borderColor: '#303030' }} />
                        </div>

                        <Title level={5} style={{ color: '#d9d9d9', marginBottom: 16 }}>Activity Notes</Title>
                        <NoteSection
                            type={EntityType.Task}
                            id={selectedProposal.id}
                        />
                    </>
                )}
            </Drawer>

            {/* Modal Component */}
            <Can perform="CREATE_PROPOSAL">
                <CreateProposalModal 
                    open={isCreateModalOpen} 
                    onCancel={() => setIsCreateModalOpen(false)} 
                />
            </Can>

            <AIChatComponent
                open={isChatOpen}
                onClose={closeChat}
                context={aiContext}
                title="Proposals AI Assistant"
                pageTitle="Proposals"
            />
        </div>
    );
}

export default withAuth(function ProposalsPage() {
    return (
        <OpportunityProvider>
            <ProposalProvider>
                <NoteProvider>
                    <ProposalsContent />
                </NoteProvider>
            </ProposalProvider>
        </OpportunityProvider>
    );
});