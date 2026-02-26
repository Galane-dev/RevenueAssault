"use client";

import React, { useEffect, useContext, useState } from "react";
import { Table, Typography, Tag, Button, Input, Select, Space, Drawer, Divider, Popconfirm } from "antd";
import { PlusOutlined, SearchOutlined, EditOutlined, MessageOutlined, DeleteOutlined } from "@ant-design/icons";
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
    1: { label: "LEAD / DISCOVERY", color: "default" },
    2: { label: "QUALIFICATION", color: "cyan" },
    3: { label: "PROPOSAL", color: "blue" },
    4: { label: "NEGOTIATION", color: "orange" },
    5: { label: "WON", color: "green" },
    6: { label: "LOST", color: "red" },
};

function OpportunitiesContent() {
    const { styles } = useStyles();
    const { opportunities, filters, totalCount, isPending } = useContext(OpportunityStateContext);
    const actions = useContext(OpportunityActionContext);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedOpp, setSelectedOpp] = useState<IOpportunity | null>(null);

    useEffect(() => {
        actions?.getOpportunities(filters);
    }, [filters, actions]);

    const handleMoveClick = (e: React.MouseEvent, record: IOpportunity) => {
        e.stopPropagation();
        setSelectedOpp(record);
        setIsMoveModalOpen(true);
    };

    const handleDeleteOpportunity = (id: string) => {
        if (window.confirm("Are you sure you want to delete this opportunity?")) {
            try {
                actions?.deleteOpportunity(id);
            } catch (error) {
                console.error("Failed to delete opportunity", error);
            }
        }
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

            <div className={styles.filterSection} style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
                <Input 
                    placeholder="Search deals..." 
                    style={{ width: 300 }}
                    prefix={<SearchOutlined style={{ color: '#595959' }} />}
                    value={filters.searchTerm}
                    onChange={(e) => actions?.updateFilters({ searchTerm: e.target.value, pageNumber: 1 })}
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