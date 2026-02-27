"use client";

import React, { useEffect, useContext, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Table, Typography, Tag, Button, Input, Select, Space, Drawer, Divider, Popconfirm, Row, Col, Card, Grid } from "antd";
import { PlusOutlined, SearchOutlined, EditOutlined, MessageOutlined, DeleteOutlined, AppstoreOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { useStyles } from "../style";

// Providers
import { OpportunityProvider, OpportunityStateContext, OpportunityActionContext } from "../../providers/opportunitiesProvider";
import { ClientProvider } from "@/app/providers/clientProvider";
import { NoteProvider } from "@/app/providers/noteProvider";
import { EntityType } from "@/app/providers/noteProvider/context";

// Components
import CreateOpportunityModal from "../../components/modals/addOpportunityModal";
import MoveStageModal from "../../components/modals/moveStageModal";
import { NoteSection } from "../../components/notes/notes"; 
import { IOpportunity } from "@/app/providers/opportunitiesProvider/context";
import { Can } from "../../components/auth/can";
import { withAuth } from "../../hoc/withAuth";

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

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedOpp, setSelectedOpp] = useState<IOpportunity | null>(null);
    const [searchInput, setSearchInput] = useState("");
    const [viewType, setViewType] = useState<"list" | "kanban">("list");

    useEffect(() => {
        actions?.getOpportunities(filters);
    }, [filters, actions]);

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
      
    };

 
    const handleRowClick = (record: IOpportunity) => {
        setSelectedOpp(record);
        setIsDrawerOpen(true);
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
                        {/* NOTE: SalesRep can update 'assigned' opportunities. 
                            If the API handles the 'assigned' check, we just check general role here.
                        */}
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
                            description="Are you sure you want to delete this deal?"
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
                    {/* View Toggle - Visible only on lg+ screens */}
                    {screens.lg && (
                        <Button.Group>
                            <Button 
                                icon={<UnorderedListOutlined />}
                                type={viewType === "list" ? "primary" : "default"}
                                onClick={() => setViewType("list")}
                            >
                                List
                            </Button>
                            <Button 
                                icon={<AppstoreOutlined />}
                                type={viewType === "kanban" ? "primary" : "default"}
                                onClick={() => setViewType("kanban")}
                            >
                                Kanban
                            </Button>
                        </Button.Group>
                    )}

                    {/* Wrap Creation Button: BDM and above can create opportunities */}
                    <Can perform="CREATE_OPPORTUNITY"> 
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            className={styles.primaryButton} 
                            size="large"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            NEW OPPORTUNITY
                        </Button>
                    </Can>
                </div>
            </div>

            <div className={styles.filterSection} style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
                <Input 
                    placeholder="Search deals..." 
                    style={{ width: 300 }}
                    prefix={<SearchOutlined style={{ color: '#595959' }} />}
                    value={searchInput}
                    onChange={handleSearchChange}
                />
                <Select 
                    placeholder="Filter by Stage" 
                    style={{ width: 200 }}
                    allowClear
                    onChange={(val) => actions?.updateFilters({ stage: val, pageNumber: 1 })}
                >
                    {Object.entries(STAGES).map(([key, value]) => (
                        <Select.Option key={key} value={Number(key)}>{value.label}</Select.Option>
                    ))}
                </Select>
            </div>

            {/* LIST VIEW */}
            {viewType === "list" && (
                <Table 
                    columns={columns} 
                    dataSource={opportunities} 
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
            )}

            {/* KANBAN VIEW */}
            {viewType === "kanban" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                    {Object.entries(STAGES).map(([stagKey, stageInfo]) => {
                        const stageNum = Number(stagKey);
                        const oppsByStage = (opportunities || []).filter(opp => opp.stage === stageNum);
                        
                        return (
                            <div key={stagKey} style={{ background: '#1f1f1f', border: '1px solid #303030', borderRadius: 8, padding: 16 }}>
                                <div style={{ marginBottom: 16 }}>
                                    <Tag color={stageInfo.color} style={{ borderRadius: 2 }}>
                                        {stageInfo.label}
                                    </Tag>
                                    <Text style={{ color: '#8c8c8c', marginLeft: 8 }}>
                                        {oppsByStage.length} deal{oppsByStage.length !== 1 ? 's' : ''}
                                    </Text>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 200 }}>
                                    {oppsByStage.length > 0 ? (
                                        oppsByStage.map(opp => (
                                            <Card
                                                key={opp.id}
                                                size="small"
                                                style={{ 
                                                    background: '#141414', 
                                                    border: '1px solid #303030',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                hoverable
                                                onClick={() => handleRowClick(opp)}
                                            >
                                                <div style={{ marginBottom: 8 }}>
                                                    <Text strong style={{ color: '#fff', display: 'block', marginBottom: 4 }}>
                                                        {opp.title || "Untitled Deal"}
                                                    </Text>
                                                    <Text style={{ color: '#52c41a', fontSize: '12px' }}>
                                                        {opp.currency || "ZAR"} {(opp.estimatedValue || 0).toLocaleString()}
                                                    </Text>
                                                </div>

                                                <Divider style={{ borderColor: '#303030', margin: '8px 0' }} />

                                                <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
                                                    <Button 
                                                        type="text" 
                                                        size="small"
                                                        icon={<EditOutlined />} 
                                                        onClick={(e) => handleMoveClick(e, opp)}
                                                        style={{ color: '#595959' }}
                                                    >
                                                        Move
                                                    </Button>
                                                    <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                                                        {opp.probability || 0}% prob
                                                    </Text>
                                                </div>
                                            </Card>
                                        ))
                                    ) : (
                                        <div style={{ color: '#595959', textAlign: 'center', padding: '16px 0', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            No deals
                                        </div>
                                    )}
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
                placement="right"
                width={500}
                onClose={() => {
                    setIsDrawerOpen(false);
                    setSelectedOpp(null);
                }}
                open={isDrawerOpen}
                styles={{ 
                    body: { background: '#141414', padding: '24px' }, 
                    header: { background: '#141414', borderBottom: '1px solid #303030' } 
                }}
            >
                {selectedOpp && (
                    <>
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <Text type="secondary">Status: </Text>
                                    <Tag color={STAGES[Number(selectedOpp.stage)]?.color}>
                                        {STAGES[Number(selectedOpp.stage)]?.label}
                                    </Tag>
                                </div>
                                
                                {/* Assign Action: Admin/SalesManager only */}
                                <Can perform="ASSIGN_OPPORTUNITY">
                                    <Button 
                                        size="small" 
                                        ghost
                                        onClick={() => {
                                            // Show a simple prompt for user ID or integrate with modal
                                            const assignedToId = prompt("Enter user ID to assign:");
                                            if (assignedToId) {
                                                actions?.assignOpportunity(selectedOpp.id, assignedToId);
                                            }
                                        }}
                                    >
                                        Assign Rep
                                    </Button>
                                </Can>
                            </div>
                            <Divider style={{ borderColor: '#303030' }} />
                        </div>
                        
                        <Title level={5} style={{ color: '#d9d9d9', marginBottom: 16 }}>Activity Notes</Title>
                        <NoteSection 
                            type={EntityType.Opportunity} 
                            id={selectedOpp.id} 
                        />
                    </>
                )}
            </Drawer>

            <CreateOpportunityModal 
                open={isCreateModalOpen} 
                onCancel={() => setIsCreateModalOpen(false)} 
            />

            <MoveStageModal 
                opportunity={selectedOpp}
                open={isMoveModalOpen}
                onCancel={() => {
                    setIsMoveModalOpen(false);
                    setSelectedOpp(null);
                }}
            />
        </>
    );
}

export default withAuth(function OpportunitiesPage() {
    return (
       <ClientProvider>
            <OpportunityProvider>
                <NoteProvider>
                    <OpportunitiesContent />
                </NoteProvider>
            </OpportunityProvider>
       </ClientProvider> 
    );
});