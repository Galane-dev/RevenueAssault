"use client";

import React, { useEffect, useContext, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Table, Typography, Tag, Button, Space, Tooltip, message, Input, Select, Drawer, Divider, Modal } from "antd";
import { 
    PlusOutlined, 
    DeleteOutlined,
    EyeOutlined,
    MessageOutlined,
    FilePdfOutlined,
    CalendarOutlined,
    DollarOutlined,
    RollbackOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from "@ant-design/icons";
import { useStyles } from "../style";

// Providers
import { ContractProvider, ContractStateContext, ContractActionContext } from "@/app/providers/contractProvider";
import { ClientProvider } from "@/app/providers/clientProvider";
import { NoteProvider } from "@/app/providers/noteProvider";
import { EntityType } from "@/app/providers/noteProvider/context";

// Components
import CreateContractModal from "../../components/modals/createContractModal";
import { AIChatComponent, ChatButton } from "../../components/ai";
import { Can } from "../../components/auth/can";
import { withAuth } from "../../hoc/withAuth";
import { OpportunityProvider } from "@/app/providers/opportunitiesProvider";
import { ProposalProvider } from "@/app/providers/proposalProvider";
import { useAIChat } from "@/app/hooks/useAIChat";
import { useAIContractsContext } from "@/app/providers/contractProvider/useAIContext";
import { NoteSection } from "@/app/components/notes/notes";

const { Title, Text } = Typography;

const STATUS_CONFIG: Record<number, { label: string, color: string }> = {
    1: { label: "DRAFT", color: "default" },
    2: { label: "ACTIVE", color: "success" },
    3: { label: "EXPIRED", color: "error" },
    4: { label: "CANCELLED", color: "warning" },
};

function ContractsContent() {
    const { styles } = useStyles();
    const { contracts, filters, totalCount, isPending } = useContext(ContractStateContext);
    const actions = useContext(ContractActionContext);
    const { isChatOpen, openChat, closeChat } = useAIChat({
        pageTitle: 'Contracts',
    });
    const aiContext = useAIContractsContext();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState<any>(null);
    const [renewDate, setRenewDate] = useState<string>("");
    const [searchInput, setSearchInput] = useState("");

    useEffect(() => {
        actions?.getContracts(filters);
    }, [filters, actions]);

    const debouncedSearch = useDebouncedCallback((value: string) => {
        actions?.updateFilters({ searchTerm: value, pageNumber: 1 });
    }, 500);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchInput(value);
        debouncedSearch(value);
    };

    const handleRowClick = (record: any) => {
        setSelectedContract(record);
        setIsDrawerOpen(true);
    };

    const handleRenew = async () => {
        if (!renewDate || !selectedContract) {
            message.warning("Please select a renewal date");
            return;
        }
        try {
            await actions?.renewContract(selectedContract.id, renewDate);
            message.success("Contract renewed successfully");
            setRenewDate("");
            setIsDrawerOpen(false);
            setSelectedContract(null);
        } catch (e) {
            message.error("Failed to renew contract");
        }
    };

    const handleDelete = (id: string, title: string) => {
        Modal.confirm({
            title: `Delete Contract`,
            content: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
            okText: "Delete",
            okType: "danger",
            cancelText: "Cancel",
            onOk() {
                try {
                    actions?.deleteContract(id);
                    message.success("Contract deleted successfully");
                } catch (error) {
                    message.error("Failed to delete contract");
                }
            },
        });
    };

    const isExpiringSoon = (endDate: string) => {
        const end = new Date(endDate);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    };

    const columns = [
        {
            title: "CONTRACT TITLE",
            dataIndex: "title",
            key: "title",
            render: (text: string) => (
                <Text strong style={{ color: '#fff' }}>{text}</Text>
            ),
        },
        {
            title: "CLIENT",
            dataIndex: "clientName",
            key: "clientName",
            render: (text: string) => (
                <Text style={{ color: '#8c8c8c' }}>{text}</Text>
            ),
        },
        {
            title: "VALUE",
            dataIndex: "contractValue",
            key: "contractValue",
            render: (val: number, record: any) => (
                <Text style={{ color: '#52c41a' }}>
                    
                    {record.currency} {(val || 0).toLocaleString()}
                </Text>
            ),
        },
        {
            title: "STATUS",
            dataIndex: "status",
            key: "status",
            render: (status: number, record: any) => {
                if (status === 2 && isExpiringSoon(record.endDate)) {
                    return <Tag color="orange">EXPIRING SOON</Tag>;
                }
                return (
                    <Tag color={STATUS_CONFIG[status]?.color} style={{ borderRadius: '2px' }}>
                        {STATUS_CONFIG[status]?.label}
                    </Tag>
                );
            },
        },
        {
            title: "START DATE",
            dataIndex: "startDate",
            key: "startDate",
            render: (date: string) => (
                <Text style={{ color: '#595959', fontSize: '12px' }}>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    {new Date(date).toLocaleDateString()}
                </Text>
            ),
        },
        {
            title: "END DATE",
            dataIndex: "endDate",
            key: "endDate",
            render: (date: string, record: any) => {
                const isExpiring = record.status === 2 && isExpiringSoon(date);
                return (
                    <Text style={{ color: isExpiring ? '#ff4d4f' : '#595959', fontSize: '12px', fontWeight: isExpiring ? 600 : 400 }}>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {new Date(date).toLocaleDateString()}
                    </Text>
                );
            },
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
            align: 'right' as const,
            render: (record: any) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <Button 
                            type="text" 
                            icon={<EyeOutlined />} 
                            onClick={() => handleRowClick(record)}
                            style={{ color: '#8c8c8c' }}
                        />
                    </Tooltip>

                    {record.status === 1 && (
                        <Can perform="ACTIVATE_CONTRACT">
                            <Tooltip title="Activate">
                                <Button 
                                    type="text" 
                                    icon={<CheckCircleOutlined />}
                                    onClick={() => {
                                        try {
                                            actions?.activateContract(record.id);
                                            message.success("Contract activated");
                                        } catch (e) {
                                            message.error("Failed to activate");
                                        }
                                    }}
                                    style={{ color: '#52c41a' }}
                                />
                            </Tooltip>
                        </Can>
                    )}

                    {record.status === 2 && (
                        <Can perform="RENEW_CONTRACT">
                            <Tooltip title="Renew">
                                <Button 
                                    type="text" 
                                    icon={<RollbackOutlined />}
                                    onClick={() => {
                                        setSelectedContract(record);
                                        setIsDrawerOpen(true);
                                    }}
                                    style={{ color: '#1677ff' }}
                                />
                            </Tooltip>
                        </Can>
                    )}

                    {record.status !== 4 && (
                        <Can perform="CANCEL_CONTRACT">
                            <Tooltip title="Cancel">
                                <Button 
                                    type="text" 
                                    icon={<CloseCircleOutlined />}
                                    onClick={() => {
                                        try {
                                            actions?.cancelContract(record.id);
                                            message.success("Contract cancelled");
                                        } catch (e) {
                                            message.error("Failed to cancel");
                                        }
                                    }}
                                    style={{ color: '#ff7a45' }}
                                />
                            </Tooltip>
                        </Can>
                    )}

                    <Can perform="DELETE_CONTRACT">
                        <Tooltip title="Delete">
                            <Button 
                                type="text" 
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleDelete(record.id, record.title)}
                                style={{ color: '#ff4d4f' }}
                            />
                        </Tooltip>
                    </Can>
                </Space>
            ),
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
                        CONTRACTS & AGREEMENTS
                    </Title>
                </header>
                <div style={{ display: 'flex', gap: 12 }}>
                    <ChatButton
                        onClick={() => openChat(aiContext)}
                        title="Ask AI about contracts"
                    />
                    <Can perform="CREATE_CONTRACT">
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            className={styles.primaryButton} 
                            size="large"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            CREATE CONTRACT
                        </Button>
                    </Can>
                </div>
            </div>

            <div className={styles.filterSection} style={{ marginBottom: 24, display: 'flex', gap: '16px' }}>
                <Input 
                    placeholder="Search contracts..." 
                    style={{ width: 300 }}
                    prefix={<FilePdfOutlined style={{ color: '#595959' }} />}
                    value={searchInput}
                    onChange={handleSearchChange}
                />
                <Select 
                    placeholder="Filter by Status" 
                    style={{ width: 200 }}
                    allowClear
                    onChange={(val) => actions?.updateFilters({ status: val, pageNumber: 1 })}
                >
                    <Select.Option value={1}>Draft</Select.Option>
                    <Select.Option value={2}>Active</Select.Option>
                    <Select.Option value={3}>Expired</Select.Option>
                    <Select.Option value={4}>Cancelled</Select.Option>
                </Select>
            </div>

            <Table 
                columns={columns} 
                dataSource={contracts} 
                loading={isPending}
                rowKey="id"
                className={styles.customTable}
                pagination={{
                    total: totalCount,
                    current: filters.pageNumber,
                    pageSize: filters.pageSize,
                    showSizeChanger: false,
                    onChange: (page) => actions?.updateFilters({ pageNumber: page })
                }}
                onRow={(record) => ({
                    onClick: () => handleRowClick(record),
                    style: { cursor: 'pointer' }
                })}
            />

            {/* Contract Details Drawer */}
            <Drawer
                title={
                    <div>
                        <Text type="secondary" style={{ fontSize: '10px', display: 'block' }}>CONTRACT DETAILS</Text>
                        <Title level={4} style={{ margin: 0, color: '#fff' }}>{selectedContract?.title}</Title>
                    </div>
                }
                placement="right"
                width={500}
                onClose={() => {
                    setIsDrawerOpen(false);
                    setSelectedContract(null);
                    setRenewDate("");
                }}
                open={isDrawerOpen}
                styles={{ 
                    body: { background: '#141414', padding: '24px' }, 
                    header: { background: '#141414', borderBottom: '1px solid #303030' } 
                }}
            >
                {selectedContract && (
                    <>
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                <div>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>Status</Text>
                                    <div>
                                        <Tag color={STATUS_CONFIG[selectedContract.status]?.color} style={{ marginTop: 4 }}>
                                            {STATUS_CONFIG[selectedContract.status]?.label}
                                        </Tag>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>Contract Value </Text>
                                    <div style={{ color: '#52c41a', fontSize: '18px', fontWeight: 600, marginTop: 4 }}>
                                        {selectedContract.currency} {(selectedContract.contractValue || 0).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <Divider style={{ borderColor: '#303030' }} />
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: 8 }}>Client</Text>
                            <Text style={{ color: '#fff' }}>{selectedContract.clientName}</Text>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: 16 }}>
                                <div>
                                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: 8 }}>Start Date</Text>
                                    <Text style={{ color: '#fff' }}>{new Date(selectedContract.startDate).toLocaleDateString()}</Text>
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: 8 }}>End Date</Text>
                                    <Text style={{ color: isExpiringSoon(selectedContract.endDate) ? '#ff4d4f' : '#fff' }}>
                                        {new Date(selectedContract.endDate).toLocaleDateString()}
                                    </Text>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: 8 }}>Terms & Conditions</Text>
                            <Text style={{ color: '#8c8c8c', whiteSpace: 'pre-wrap' }}>
                                {selectedContract.terms || "No additional terms specified"}
                            </Text>
                        </div>

                        <Divider style={{ borderColor: '#303030' }} />
                        <Title level={5} style={{ color: '#d9d9d9', marginBottom: 16 }}>Activity Notes</Title>
                        <NoteSection
                            type={EntityType.Task}
                            id={selectedContract.id}
                        />

                        {selectedContract.status === 2 && (
                            <Can perform="RENEW_CONTRACT">
                                <Divider style={{ borderColor: '#303030' }} />
                                <div style={{ marginTop: 24 }}>
                                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: 8 }}>Renew Contract</Text>
                                    <Input 
                                        type="date" 
                                        value={renewDate}
                                        onChange={(e) => setRenewDate(e.target.value)}
                                        style={{ marginBottom: 12 }}
                                    />
                                    <Button 
                                        type="primary" 
                                        block
                                        onClick={handleRenew}
                                    >
                                        Confirm Renewal
                                    </Button>
                                </div>
                            </Can>
                        )}
                    </>
                )}
            </Drawer>

            {/* Create Contract Modal */}
            <Can perform="CREATE_CONTRACT">
                <CreateContractModal 
                    open={isCreateModalOpen} 
                    onCancel={() => setIsCreateModalOpen(false)} 
                />
            </Can>

            <AIChatComponent
                open={isChatOpen}
                onClose={closeChat}
                context={aiContext}
                title="Contracts AI Assistant"
                pageTitle="Contracts"
            />
        </div>
    );
}

/**
 * Page Export with nested Providers
 */
export default withAuth(function ContractsPage() {
    return (
        <ClientProvider>
            <OpportunityProvider>
                <ProposalProvider>
                    <ContractProvider>
                        <NoteProvider>
                            <ContractsContent />
                        </NoteProvider>
                    </ContractProvider>
                </ProposalProvider>
                
            </OpportunityProvider>
        </ClientProvider>
    );
});
