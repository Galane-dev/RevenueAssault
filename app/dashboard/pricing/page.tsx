"use client";

import React, { useEffect, useContext, useState } from "react";
import { Table, Typography, Tag, Button, Select, Space, Tooltip, Badge } from "antd";
import { 
    PlusOutlined, 
    ClockCircleOutlined, 
    CheckCircleOutlined, 
    UserAddOutlined,
    AlertOutlined 
} from "@ant-design/icons";
import { useStyles } from "../style";
import dayjs from "dayjs";

// Providers
import { PricingProvider, PricingStateContext, PricingActionContext } from "../../providers/pricingProvider";
import { PricingRequestStatus, PricingPriority } from "@/app/providers/pricingProvider/context";
import { ClientProvider } from "@/app/providers/clientProvider";
import { OpportunityProvider } from "../../providers/opportunitiesProvider";

// Components
import AddPricingRequestModal from "../../components/modals/addPricingRequestModal";
import { Can } from "../../components/auth/can";
import { withAuth } from "../../hoc/withAuth";

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

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        pricingActions?.getRequests(filters);
    }, [filters, pricingActions]);

    const columns = [
        {
            title: "REQUEST DETAILS",
            key: "details",
            render: (record: any) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text strong style={{ color: '#fff' }}>{record.title}</Text>
                    <Text style={{ color: '#595959', fontSize: '12px' }}>{record.clientName || "Unknown Client"}</Text>
                </div>
            )
        },
        {
            title: "PRIORITY",
            dataIndex: "priority",
            key: "priority",
            render: (priority: number) => (
                <Tag color={priorityMap[priority as PricingPriority]?.color} style={{ borderRadius: '2px',backgroundColor:' #111111', color: priorityMap[priority as PricingPriority]?.color }}>
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
                <Text style={{ color: '#8c8c8c' }}>
                    {dayjs(date).format('DD MMM YYYY')}
                </Text>
            )
        },
        {
            
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
                <Can perform="CREATE_PRICING_REQUEST">
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        className={styles.primaryButton} 
                        size="large"
                        onClick={() => setIsModalOpen(true)}
                    >
                        NEW REQUEST
                    </Button>
                </Can>
            </div>

            <div className={styles.filterSection} style={{ marginBottom: 24, gap: 16 }}>
                <Select 
                    placeholder="All Statuses" 
                    style={{ width: 180 }}
                    allowClear
                    onChange={(val) => pricingActions?.updateFilters({ status: val, pageNumber: 1 })}
                    popupClassName={styles.drawerSelectPopup}
                >
                    <Select.Option value={PricingRequestStatus.Pending}>Pending</Select.Option>
                    <Select.Option value={PricingRequestStatus.InProgress}>In Progress</Select.Option>
                    <Select.Option value={PricingRequestStatus.Completed}>Completed</Select.Option>
                </Select>

                <Select 
                    placeholder="Priority" 
                    style={{ width: 150 }}
                    allowClear
                    onChange={(val) => pricingActions?.updateFilters({ priority: val, pageNumber: 1 })}
                    popupClassName={styles.drawerSelectPopup}
                >
                    <Select.Option value={PricingPriority.Low}>Low</Select.Option>
                    <Select.Option value={PricingPriority.Medium}>Medium</Select.Option>
                    <Select.Option value={PricingPriority.High}>High</Select.Option>
                    <Select.Option value={PricingPriority.Urgent}>Urgent</Select.Option>
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

            <Can perform="CREATE_PRICING_REQUEST">
                <AddPricingRequestModal 
                    open={isModalOpen} 
                    onCancel={() => setIsModalOpen(false)} 
                />
            </Can>
        </div>
    );
}

export default withAuth(function PricingPage() {
    return (
        <ClientProvider>
            <OpportunityProvider>
                <PricingProvider>
                    <PricingContent />
                </PricingProvider>
            </OpportunityProvider>
        </ClientProvider>
    );
});