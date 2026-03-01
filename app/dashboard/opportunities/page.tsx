"use client";

import React, { useEffect, useContext, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { 
    Table, Typography, Tag, Button, Input, Select, Space, Drawer, 
    Divider, Popconfirm, Grid, message, Modal, Form, Timeline, Spin, Card 
} from "antd";
import { 
    PlusOutlined, SearchOutlined, EditOutlined, MessageOutlined, 
    DeleteOutlined, AppstoreOutlined, UnorderedListOutlined, 
    DownloadOutlined, UserOutlined, HistoryOutlined 
} from "@ant-design/icons";
import { useStyles } from "../style";

// Providers
import { OpportunityProvider, OpportunityStateContext, OpportunityActionContext } from "../../providers/opportunitiesProvider";
import { ClientProvider } from "@/app/providers/clientProvider";
import { NoteProvider } from "@/app/providers/noteProvider";
import { EntityType } from "@/app/providers/noteProvider/context";
import { UserProvider } from "@/app/providers/userProvider";

// Components
import CreateOpportunityModal from "../../components/modals/addOpportunityModal";
import MoveStageModal from "../../components/modals/moveStageModal";
import { NoteSection } from "../../components/notes/notes"; 
import { AIChatComponent, ChatButton } from "../../components/ai";
import { IOpportunity } from "@/app/providers/opportunitiesProvider/context";
import { Can } from "../../components/auth/can";
import { withAuth } from "../../hoc/withAuth";
import { useAIChat } from "@/app/hooks/useAIChat";
import { useAIOpportunitiesContext } from "@/app/providers/opportunitiesProvider/useAIContext";
import { exportToCsv } from "@/app/utils/csvExport";
import {TeamMemberSelect} from "@/app/components/modals/teamMembersModal";

const { Title, Text } = Typography;

const STAGES: Record<number, { label: string, color: string }> = {
    1: { label: "LEAD", color: "default" },
    2: { label: "QUALIFICATION", color: "cyan" },
    3: { label: "PROPOSAL", color: "blue" },
    4: { label: "NEGOTIATION", color: "orange" },
    5: { label: "WON", color: "green" },
    6: { label: "LOST", color: "red" },
};

function OpportunitiesContent() {
    const { styles } = useStyles();
    const screens = Grid.useBreakpoint();
    const { opportunities, filters, totalCount, isPending } = useContext(OpportunityStateContext);
    const actions = useContext(OpportunityActionContext);

    const { isChatOpen, openChat, closeChat } = useAIChat({ 
        pageTitle: 'Opportunities' 
    });
    const aiContext = useAIOpportunitiesContext();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedOpp, setSelectedOpp] = useState<IOpportunity | null>(null);
    const [searchInput, setSearchInput] = useState("");
    const [viewType, setViewType] = useState<"list" | "kanban">("list");
    const [draggedOpp, setDraggedOpp] = useState<IOpportunity | null>(null);
    const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
    const [pendingMove, setPendingMove] = useState<{ oppId: string; stageNum: number; stageName: string } | null>(null);
    const [moveReason, setMoveReason] = useState("");
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    
    // Feature States
    const [isMyOnly, setIsMyOnly] = useState(false);
    const [stageHistory, setStageHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (isMyOnly) {
            actions?.getMyOpportunities();
        } else {
            actions?.getOpportunities(filters);
        }
    }, [filters, actions, isMyOnly]);

    const debouncedSearch = useDebouncedCallback((value: string) => {
        actions?.updateFilters({ searchTerm: value, pageNumber: 1 });
    }, 500);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchInput(value);
        debouncedSearch(value);
    };

    const handleMoveClick = (e: React.MouseEvent, record: IOpportunity) => {
        e.stopPropagation();
        setSelectedOpp(record);
        setIsMoveModalOpen(true);
    };

    const handleDeleteOpportunity = (id: string) => {
        // Implementation for delete
    };

    const handleRowClick = async (record: IOpportunity) => {
        setSelectedOpp(record);
        setIsDrawerOpen(true);
        setLoadingHistory(true);
        try {
            const history = await actions?.getStageHistory(record.id);
            setStageHistory(history || []);
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleDragDrop = (oppId: string, stageNum: number, stageName: string) => {
        setPendingMove({ oppId, stageNum, stageName });
        setMoveReason("");
        setIsReasonModalOpen(true);
    };

    const handleConfirmMove = async () => {
        if (!pendingMove) return;
        
        if (!moveReason.trim()) {
            message.warning("Please provide a reason for moving this opportunity");
            return;
        }

        try {
            await actions?.updateStage(pendingMove.oppId, pendingMove.stageNum, moveReason);
            message.success(`Moved to ${pendingMove.stageName}`);
            setIsReasonModalOpen(false);
            setPendingMove(null);
            setMoveReason("");
        } catch (error) {
            message.error("Failed to move opportunity");
        }
    };

    const handleCancelMove = () => {
        setIsReasonModalOpen(false);
        setPendingMove(null);
        setMoveReason("");
        setDraggedOpp(null);
    };

    const handleExportOpportunities = () => {
        if (!opportunities || opportunities.length === 0) {
            message.info("There are no opportunities to export.");
            return;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        exportToCsv({
            filename: `opportunities-${timestamp}.csv`,
            headers: [
                "ID", "Opportunity", "Client", "Estimated Value", "Currency", "Stage", "Probability", "Expected Close Date", "Owner ID",
            ],
            rows: opportunities.map((opp) => [
                opp.id, opp.title || "Untitled Deal", opp.clientName || opp.clientId,
                opp.estimatedValue || 0, opp.currency || "ZAR",
                STAGES[Number(opp.stage)]?.label || "UNKNOWN",
                `${opp.probability || 0}%`,
                opp.expectedCloseDate ? new Date(opp.expectedCloseDate).toLocaleString() : "",
                opp.ownerId,
            ]),
        });

        message.success("Opportunities exported successfully.");
    };

    const columns = [
        {
            title: "OPPORTUNITY",
            dataIndex: "title",
            key: "title",
            render: (text: string) => (
                <Text strong style={{ color: '#ffff' }}>
                    {text || "Untitled Deal"}
                </Text>
            )
        },
        {
            title: "EST. VALUE",
            dataIndex: "estimatedValue",
            key: "estimatedValue",
            render: (val: number, record: any) => (
                <Text style={{ color: '#52c41a' }}>
                    {record.currency || "ZAR"} {(val || 0).toLocaleString()}
                </Text>
            )
        },
        {
            title: "STAGE",
            dataIndex: "stage",
            key: "stage",
            render: (stage: number, record: IOpportunity) => {
                const stageKey = Number(stage);
                const stageInfo = STAGES[stageKey] || { label: "UNKNOWN", color: "default" };
                return (
                    <Space>
                        <Tag color={stageInfo.color} style={{ borderRadius: 2 }}>
                            {stageInfo.label}
                        </Tag>
                        <Button 
                            type="text" 
                            icon={<EditOutlined />} 
                            onClick={(e) => handleMoveClick(e, record)}
                            style={{ color: '#595959' }}
                        />
                    </Space>
                );
            }
        },
        {
            title: "NOTES",
            key: "notes",
            align: 'center' as const,
            render: () => <MessageOutlined style={{ color: '#595959' }} />
        },
        {
            title: "",
            key: "actions",
            render: (_: any, record: IOpportunity) => (
                <Space onClick={(e) => e.stopPropagation()}>
                    <Can perform="DELETE_OPPORTUNITY">
                        <Popconfirm
                            title="Delete Opportunity"
                            onConfirm={() => handleDeleteOpportunity(record.id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Can>
                </Space>
            )
        }
    ];

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
                <header>
                    <Text style={{ color: '#595959', letterSpacing: '2px', fontSize: '12px', fontWeight: 700 }}>SALES PIPELINE</Text>
                    <Title level={2} className={styles.pageTitle} style={{ margin: 0 }}>OPPORTUNITIES</Title>
                </header>
                
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <Button 
                        icon={<UserOutlined />} 
                        type={isMyOnly ? "primary" : "default"}
                        onClick={() => setIsMyOnly(!isMyOnly)}
                    >
                        {isMyOnly ? "ALL DEALS" : "MY DEALS"}
                    </Button>

                    {screens.lg && (
                        <Button.Group>
                            <Button icon={<UnorderedListOutlined />} type={viewType === "list" ? "primary" : "default"} onClick={() => setViewType("list")}>List</Button>
                            <Button icon={<AppstoreOutlined />} type={viewType === "kanban" ? "primary" : "default"} onClick={() => setViewType("kanban")}>Kanban</Button>
                        </Button.Group>
                    )}

                    <ChatButton onClick={() => openChat(aiContext)} title="Ask AI" />

                    <Button icon={<DownloadOutlined />} size="large" onClick={handleExportOpportunities}>EXPORT CSV</Button>

                    <Can perform="CREATE_OPPORTUNITY"> 
                        <Button type="primary" icon={<PlusOutlined />} className={styles.primaryButton} size="large" onClick={() => setIsCreateModalOpen(true)}>
                            NEW OPPORTUNITY
                        </Button>
                    </Can>
                </div>
            </div>

            <div className={styles.filterSection} style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
                <Input placeholder="Search deals..." style={{ width: 300 }} prefix={<SearchOutlined style={{ color: '#595959' }} />} value={searchInput} onChange={handleSearchChange} />
                <Select placeholder="Filter by Stage" style={{ width: 200 }} allowClear onChange={(val) => actions?.updateFilters({ stage: val, pageNumber: 1 })}>
                    {Object.entries(STAGES).map(([key, value]) => (
                        <Select.Option key={key} value={Number(key)}>{value.label}</Select.Option>
                    ))}
                </Select>
            </div>

            {viewType === "list" && (
                <Table columns={columns} dataSource={opportunities} loading={isPending} rowKey="id" className={styles.customTable} onRow={(record) => ({ onClick: () => handleRowClick(record) })} 
                    pagination={{
                        total: totalCount, current: filters.pageNumber, pageSize: filters.pageSize,
                        onChange: (page) => actions?.updateFilters({ pageNumber: page })
                    }} 
                />
            )}

            {viewType === "kanban" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                    {Object.entries(STAGES).map(([stagKey, stageInfo]) => {
                        const stageNum = Number(stagKey);
                        const oppsByStage = (opportunities || []).filter(opp => opp.stage === stageNum);
                        return (
                            <div key={stagKey} style={{ background: '#1f1f1f', border: '1px solid #303030', borderRadius: 8, padding: 16, minHeight: 400, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ marginBottom: 16 }}>
                                    <Tag color={stageInfo.color} style={{ borderRadius: 2 }}>{stageInfo.label}</Tag>
                                    <Text style={{ color: '#8c8c8c', marginLeft: 8 }}>{oppsByStage.length} deal{oppsByStage.length !== 1 ? 's' : ''}</Text>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        if (draggedOpp) { handleDragDrop(draggedOpp.id, stageNum, stageInfo.label); setDraggedOpp(null); }
                                    }}
                                >
                                    {oppsByStage.map((opp) => (
                                        <div key={opp.id} draggable onDragStart={(e) => { setDraggedOpp(opp); e.dataTransfer.effectAllowed = 'move'; }} onDragEnd={() => setDraggedOpp(null)} style={{ opacity: draggedOpp?.id === opp.id ? 0.5 : 1, cursor: 'grab' }}>
                                            <Card size="small" style={{ background: '#141414', border: draggedOpp?.id === opp.id ? '2px solid #52c41a' : '1px solid #303030' }} hoverable onClick={() => handleRowClick(opp)}>
                                                <Text strong style={{ color: '#fff', display: 'block' }}>{opp.title || "Untitled Deal"}</Text>
                                                <Text style={{ color: '#52c41a', fontSize: '12px' }}>{opp.currency || "ZAR"} {(opp.estimatedValue || 0).toLocaleString()}</Text>
                                                <Divider style={{ borderColor: '#303030', margin: '8px 0' }} />
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Button type="text" size="small" icon={<EditOutlined />} onClick={(e) => handleMoveClick(e, opp)} style={{ color: '#595959' }}>Move</Button>
                                                    <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>{opp.probability || 0}%</Text>
                                                </div>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Drawer
                title={
                    <div>
                        <Text type="secondary" style={{ fontSize: '10px', display: 'block' }}>OPPORTUNITY DETAILS</Text>
                        <Title level={4} style={{ margin: 0, color: '#fff' }}>{selectedOpp?.title}</Title>
                    </div>
                }
                placement="right" width={500} onClose={() => { setIsDrawerOpen(false); setSelectedOpp(null); }} open={isDrawerOpen}
                styles={{ body: { background: '#141414', padding: '24px' }, header: { background: '#141414', borderBottom: '1px solid #303030' } }}
            >
                {selectedOpp && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Tag color={STAGES[Number(selectedOpp.stage)]?.color}>{STAGES[Number(selectedOpp.stage)]?.label}</Tag>
                            <Can perform="ASSIGN_OPPORTUNITY">
                                <Button className={styles.primaryButton} icon={<UserOutlined />} ghost onClick={() => {
                                    setIsAssignModalOpen(true)}}>Assign Rep</Button>
                            </Can>
                        </div>
                        
                        <Divider style={{ borderColor: '#303030' }} />
                        
                        <Title level={5} style={{ color: '#8c8c8c' }}><HistoryOutlined /> STAGE HISTORY</Title>
                        {loadingHistory ? <Spin size="small" /> : (
                            <Timeline 
                                style={{ marginTop: 16 }}
                                items={stageHistory.map(h => ({
                                    color: STAGES[h.stage]?.color,
                                    children: (
                                        <>
                                            <Text strong style={{ color: '#fff' }}>{STAGES[h.stage]?.label}</Text>
                                            <div style={{ color: '#8c8c8c', fontSize: '12px' }}>{h.reason || "Moved"} • {new Date(h.createdAt).toLocaleDateString()}</div>
                                        </>
                                    )
                                }))}
                            />
                        )}
                        
                        <Divider style={{ borderColor: '#303030' }} />
                        <Title level={5} style={{ color: '#8c8c8c' }}><MessageOutlined /> ACTIVITY NOTES</Title>
                        <NoteSection type={EntityType.Opportunity} id={selectedOpp.id} />
                    </>
                )}
            </Drawer>

            <CreateOpportunityModal open={isCreateModalOpen} onCancel={() => setIsCreateModalOpen(false)} />
            <MoveStageModal opportunity={selectedOpp} open={isMoveModalOpen} onCancel={() => { setIsMoveModalOpen(false); setSelectedOpp(null); }} />

            <Modal title="Move Opportunity" open={isReasonModalOpen} onOk={handleConfirmMove} onCancel={handleCancelMove} okText="Confirm Move">
                <Form layout="vertical">
                    <Form.Item label="Reason for Move" required>
                        <Input.TextArea rows={4} value={moveReason} onChange={(e) => setMoveReason(e.target.value)} maxLength={500} />
                    </Form.Item>
                </Form>
            </Modal>

            <AIChatComponent open={isChatOpen} onClose={closeChat} context={aiContext} title="Opportunities AI Assistant" pageTitle="Opportunities" />
                <Modal 
    title="Assign Opportunity" 
    open={isAssignModalOpen} 
    onCancel={() => setIsAssignModalOpen(false)}
    footer={null}
    destroyOnClose
>
    <div style={{ padding: '10px 0 20px 0' }}>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Search for a representative to assign to **{selectedOpp?.title}**.
        </Text>
        <TeamMemberSelect 
            onSelect={(userId) => {
                if (selectedOpp) {
                    actions?.assignOpportunity(selectedOpp.id, userId);
                    message.success("Rep assigned successfully");
                }
                setIsAssignModalOpen(false);
            }} 
        />
    </div>
</Modal>

        </>
    );
}

export default withAuth(function OpportunitiesPage() {
    return (
       <ClientProvider>
            <UserProvider>
                <OpportunityProvider>
                    <NoteProvider>
                        <OpportunitiesContent />
                    </NoteProvider>
                </OpportunityProvider>
            </UserProvider>
       </ClientProvider>
    );
});