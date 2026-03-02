"use client";

import React, { useEffect, useContext, useState } from "react";
import { Table, Typography, Tag, Button, Select, Space, Tooltip, message, Popconfirm } from "antd";
import { 
    PlusOutlined, 
    ClockCircleOutlined, 
    CheckCircleOutlined, 
    UserAddOutlined,
    AlertOutlined,
    CheckOutlined
} from "@ant-design/icons";
import { useStyles } from "../style";
import dayjs from "dayjs";

// Providers
import { PricingStateContext, PricingActionContext } from "../../providers/pricingProvider";
import { PricingRequestStatus, PricingPriority, IPricingRequest } from "@/app/providers/pricingProvider/context";
import { UserStateContext } from "@/app/providers/userProvider/context";
import { OpportunityProvider } from "@/app/providers/opportunitiesProvider";
import { ClientProvider } from "@/app/providers/clientProvider";
import { PricingProvider } from "../../providers/pricingProvider";
import { UserActionContext } from "@/app/providers/userProvider/context";
import { UserProvider } from "@/app/providers/userProvider";

// Components
import AddPricingRequestModal from "../../components/modals/addPricingRequestModal";
import { AIChatComponent, ChatButton } from "../../components/ai";
import { Can } from "../../components/auth/can";
import { withAuth } from "../../hoc/withAuth";
import { useAIChat } from "@/app/hooks/useAIChat";
import { useAIPricingContext } from "@/app/providers/pricingProvider/useAIContext";
import { TeamMemberSelect } from "@/app/components/modals/teamMembersModal";

const { Title, Text } = Typography;

const statusMap = {
    [PricingRequestStatus.Pending]: { color: "default", text: "PENDING", icon: <ClockCircleOutlined /> },
    [PricingRequestStatus.InProgress]: { color: "processing", text: "IN PROGRESS", icon: <AlertOutlined /> },
    [PricingRequestStatus.Completed]: { color: "success", text: "COMPLETED", icon: <CheckCircleOutlined /> },
    [PricingRequestStatus.Cancelled]: { color: "error", text: "CANCELLED", icon: null },
};

const priorityMap = {
    [PricingPriority.Low]: { color: "#262626", label: "Low" },
    [PricingPriority.Medium]: { color: "#595959", label: "Medium" },
    [PricingPriority.High]: { color: "#d46b08", label: "High" },
    [PricingPriority.Urgent]: { color: "#cf1322", label: "Urgent" },
};

function PricingContent() {
    const { styles } = useStyles();
    const { requests, filters, totalCount, isPending } = useContext(PricingStateContext);
    const pricingActions = useContext(PricingActionContext);
    const { users } = useContext(UserStateContext); // Access users for owner name lookup
    const userActions = useContext(UserActionContext);
    const { isChatOpen, openChat, closeChat } = useAIChat({ pageTitle: 'Pricing' });
    const aiContext = useAIPricingContext();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"all" | "my" | "pending">("all");

    useEffect(() => {
        if (viewMode === "my") pricingActions?.getMyRequests();
        else if (viewMode === "pending") pricingActions?.getPending();
        else pricingActions?.getRequests(filters);
    }, [filters, pricingActions, viewMode]);

    useEffect(() => {
    // Ensure users are loaded so the dropdown has data
    if (!users || users.length === 0) {
        userActions?.getUsers({ pageNumber: 1, pageSize: 100 }); 
    }
}, [users, userActions]);

    const handleAssign = async (id: string, userId: string) => {
        try {
            await pricingActions?.assignRequest(id, userId);
            message.success("Request assigned successfully");
        } catch (error) {
            message.error("Failed to assign request");
        }
    };

    const handleComplete = async (id: string) => {
        try {
            await pricingActions?.completeRequest(id);
            message.success("Request marked as completed");
        } catch (error) {
            message.error("Failed to complete request");
        }
    };

    const columns = [
        {
    title: "REQUEST DETAILS",
    key: "details",
    render: (record: IPricingRequest) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong style={{ color: '#fff' }}>{record.title}</Text>
            <Text style={{ color: '#595959', fontSize: '11px' }}>
                {/* Use opportunityTitle since clientName is missing from API */}
                {record.opportunityTitle || "No Opportunity Linked"} 
            </Text>
            <Text style={{ color: '#434343', fontSize: '10px' }}>
                {record.requestNumber}
            </Text>
        </div>
    )
},
       {
    title: "ASSIGNED TO",
    dataIndex: "assignedToId",
    key: "assignedTo",
    render: (assignedToId: string, record: IPricingRequest) => {
        return (
            <Can 
                perform="ASSIGN_PRICING_REQUEST" 
                // Use the name directly from the record if they don't have permission to change it
                fallback={<Text type="secondary">{record.assignedToName || "Unassigned"}</Text>}
            >
                <Select
                    placeholder="Assign Rep"
                    variant="borderless"
                    style={{ width: 150 }}
                    value={assignedToId} // This ID matches the Select.Option value
                    onChange={(val) => handleAssign(record.id, val)}
                >
                    {users?.map(u => (
                        <Select.Option key={u.id} value={u.id}>
                            {u.fullName}
                        </Select.Option>
                    ))}
                </Select>
            </Can>
        );
    }
},
        {
            title: "PRIORITY",
            dataIndex: "priority",
            key: "priority",
            render: (priority: number) => (
                <Tag color={priorityMap[priority as PricingPriority]?.color} style={{ borderRadius: '2px', backgroundColor: '#111111' }}>
                    {priorityMap[priority as PricingPriority]?.label}
                </Tag>
            )
        },
        {
            title: "STATUS",
            dataIndex: "status",
            key: "status",
            render: (status: number) => {
                const config = statusMap[status as PricingRequestStatus];
                return (
                    <Tag icon={config.icon} color={config.color} bordered={false}>
                        {config.text}
                    </Tag>
                );
            }
        },
        {
            title: "REQUIRED BY",
            dataIndex: "requiredByDate",
            key: "requiredByDate",
            render: (date: string) => (
                <Text style={{ color: dayjs(date).isBefore(dayjs()) ? '#cf1322' : '#8c8c8c' }}>
                    {dayjs(date).format('DD MMM YYYY')}
                </Text>
            )
        },
        {
            title: "ACTIONS",
            key: "actions",
            render: (record: IPricingRequest) => (
                <Space>
                    {record.status !== PricingRequestStatus.Completed && (
                        <Popconfirm 
                            title="Mark as completed?" 
                            onConfirm={() => handleComplete(record.id)}
                        >
                            <Tooltip title="Complete Request">
                                <Button type="text" icon={<CheckOutlined style={{ color: '#52c41a' }} />} />
                            </Tooltip>
                        </Popconfirm>
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
                        FINANCIAL OPERATIONS
                    </Text>
                    <Title level={2} className={styles.pageTitle} style={{ margin: 0, marginTop: 4 }}>
                        PRICING REQUESTS
                    </Title>
                </header>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Button.Group>
                        <Button type={viewMode === "all" ? "primary" : "default"} onClick={() => setViewMode("all")}>All</Button>
                        <Button type={viewMode === "my" ? "primary" : "default"} onClick={() => setViewMode("my")}>My Tasks</Button>
                        <Can perform="VIEW_PENDING_PRICING">
                            <Button type={viewMode === "pending" ? "primary" : "default"} onClick={() => setViewMode("pending")}>Unassigned</Button>
                        </Can>
                    </Button.Group>
                    <ChatButton onClick={() => openChat(aiContext)} title="Ask AI about pricing" />
                    <Can perform="CREATE_PRICING_REQUEST">
                        <Button 
                            type="primary" icon={<PlusOutlined />} 
                            className={styles.primaryButton} size="large"
                            onClick={() => setIsModalOpen(true)}
                        >
                            NEW REQUEST
                        </Button>
                    </Can>
                </div>
            </div>

            <div className={styles.filterSection} style={{ marginBottom: 24, display: 'flex', gap: 16 }}>
                <Select 
                    placeholder="All Statuses" 
                    style={{ width: 180 }}
                    allowClear
                    onChange={(val) => pricingActions?.updateFilters({ status: val, pageNumber: 1 })}
                >
                    {Object.entries(PricingRequestStatus)
                        .filter(([key]) => isNaN(Number(key)))
                        .map(([key, val]) => <Select.Option key={val} value={val}>{key}</Select.Option>)}
                </Select>

                <Select 
                    placeholder="Priority" 
                    style={{ width: 150 }}
                    allowClear
                    onChange={(val) => pricingActions?.updateFilters({ priority: val, pageNumber: 1 })}
                >
                    {Object.entries(PricingPriority)
                        .filter(([key]) => isNaN(Number(key)))
                        .map(([key, val]) => <Select.Option key={val} value={val}>{key}</Select.Option>)}
                </Select>
            </div>

            <Table 
                columns={columns} 
                dataSource={requests} 
                loading={isPending}
                rowKey="id"
                className={styles.customTable}
                pagination={{
                    total: totalCount,
                    current: filters.pageNumber,
                    pageSize: filters.pageSize,
                    onChange: (page) => pricingActions?.updateFilters({ pageNumber: page })
                }}
            />

            <AddPricingRequestModal 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
            />

            <AIChatComponent
                open={isChatOpen}
                onClose={closeChat}
                context={aiContext}
                title="Pricing AI Assistant"
                pageTitle="Pricing"
            />
        </div>
    );
}

export default withAuth(function PricingPage() {
    return (
       <UserProvider> 
            <ClientProvider>
                <OpportunityProvider>
                    <PricingProvider>
                        <PricingContent />
                    </PricingProvider>
                </OpportunityProvider>
            </ClientProvider>
        </UserProvider>
    );
});