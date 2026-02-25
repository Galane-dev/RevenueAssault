"use client";

import React, { useEffect, useContext, useState } from "react";
import { Table, Typography, Tag, Button, Input, Select, Space } from "antd";
import { PlusOutlined, SearchOutlined, EditOutlined } from "@ant-design/icons";
import { useStyles } from "../style";
import { OpportunityProvider, OpportunityStateContext, OpportunityActionContext } from "../../providers/opportunitiesProvider";
import { ClientProvider } from "@/app/providers/clientProvider";

// Import your new modals
import CreateOpportunityModal from "../../components/modals/addOpportunityModal";
import MoveStageModal from "../../components/modals/moveStageModal";
import { IOpportunity } from "@/app/providers/opportunitiesProvider/context";

const { Title, Text } = Typography;

const STAGES: Record<number, { label: string, color: string }> = {
    1: { label: "DISCOVERY", color: "default" },
    2: { label: "PROPOSAL", color: "blue" },
    3: { label: "NEGOTIATION", color: "orange" },
    4: { label: "WON", color: "green" },
    5: { label: "LOST", color: "red" },
};

function OpportunitiesContent() {
    const { styles } = useStyles();
    const { opportunities, filters, totalCount, isPending } = useContext(OpportunityStateContext);
    const actions = useContext(OpportunityActionContext);

    // --- MODAL STATES ---
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [selectedOpp, setSelectedOpp] = useState<IOpportunity | null>(null);

    useEffect(() => {
        actions?.getOpportunities(filters);
    }, [filters, actions]);

    const handleMoveClick = (record: IOpportunity) => {
        setSelectedOpp(record);
        setIsMoveModalOpen(true);
    };

    const columns = [
        {
            title: "OPPORTUNITY",
            dataIndex: "title",
            key: "title",
            render: (text: string) => <Text strong style={{ color: '#fff' }}>{text}</Text>
        },
        {
            title: "EST. VALUE",
            dataIndex: "estimatedValue",
            key: "estimatedValue",
            render: (val: number, record: any) => (
                <Text style={{ color: '#52c41a' }}>{record.currency} {val?.toLocaleString()}</Text>
            )
        },
        {
            title: "STAGE",
            dataIndex: "stage",
            key: "stage",
            render: (stage: number, record: IOpportunity) => (
                <Space>
                    <Tag color={STAGES[stage]?.color} style={{ borderRadius: 2 }}>
                        {STAGES[stage]?.label}
                    </Tag>
                    <Button 
                        type="text" 
                        size="small" 
                        icon={<EditOutlined />} 
                        onClick={() => handleMoveClick(record)}
                        style={{ color: '#595959' }}
                    />
                </Space>
            )
        },
        {
            title: "PROBABILITY",
            dataIndex: "probability",
            key: "probability",
            render: (prob: number) => <Text style={{ color: '#8c8c8c' }}>{prob}%</Text>
        }
    ];

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
                <header>
                    <Text style={{ color: '#595959', letterSpacing: '2px', fontSize: '12px' }}>SALES PIPELINE</Text>
                    <Title level={2} className={styles.pageTitle} style={{ margin: 0 }}>OPPORTUNITIES</Title>
                </header>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    className={styles.primaryButton} 
                    size="large"
                    onClick={() => setIsCreateModalOpen(true)} // 1. Added Trigger
                >
                    NEW OPPORTUNITY
                </Button>
            </div>

            <div className={styles.filterSection}>
                <Input 
                    placeholder="Search deals..." 
                    className={styles.searchInput}
                    prefix={<SearchOutlined style={{ color: '#595959' }} />}
                    value={filters.searchTerm}
                    onChange={(e) => actions?.updateFilters({ searchTerm: e.target.value, pageNumber: 1 })}
                />
                <Select 
                    placeholder="Filter by Stage" 
                    className={styles.searchInput}
                    style={{ width: 200 }}
                    allowClear
                    onChange={(val) => actions?.updateFilters({ stage: val, pageNumber: 1 })}
                    popupClassName={styles.drawerSelectPopup}
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
                pagination={{
                    total: totalCount,
                    current: filters.pageNumber,
                    pageSize: filters.pageSize,
                    onChange: (page) => actions?.updateFilters({ pageNumber: page })
                }}
            />

            {/* 2. ADD THE MODALS HERE */}
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

export default function OpportunitiesPage() {
    return (
       <ClientProvider>
        <OpportunityProvider>
            <OpportunitiesContent />
        </OpportunityProvider>
       </ClientProvider> 
    );
}