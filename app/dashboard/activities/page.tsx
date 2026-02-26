"use client";

import React, { useEffect, useContext, useState, useCallback } from "react";
import { Table, Typography, Tag, Button, Select, Space, Tabs, Avatar, Tooltip, message } from "antd";
import { 
    PhoneOutlined, 
    MailOutlined, 
    CalendarOutlined, 
    CheckSquareOutlined,
    PlusOutlined,
    MoreOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import { useStyles } from "../style";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {Badge} from 'antd';

// Providers
import { ActivityProvider, ActivityStateContext, ActivityActionContext } from "@/app/providers/activityProvider";
import { ActivityType, ActivityStatus, ActivityPriority } from "@/app/providers/activityProvider/context";
import { AuthStateContext } from "@/app/providers/authProvider/context";
import { ClientProvider } from "@/app/providers/clientProvider";
import { OpportunityProvider } from "@/app/providers/opportunitiesProvider";

// Components
import LogActivityModal from "../../components/modals/logActivityModal";
import { Can } from "../../components/auth/can";

dayjs.extend(relativeTime);
const { Title, Text } = Typography;

/**
 * UI Mapping for Activity Types
 */
const typeMap = {
    [ActivityType.Task]: { icon: <CheckSquareOutlined />, color: "#8c8c8c", label: "Task" },
    [ActivityType.Meeting]: { icon: <CalendarOutlined />, color: "#1890ff", label: "Meeting" },
    [ActivityType.Email]: { icon: <MailOutlined />, color: "#52c41a", label: "Email" },
    [ActivityType.Call]: { icon: <PhoneOutlined />, color: "#722ed1", label: "Call" },
};

/**
 * UI Mapping for Priority Tags
 */
const priorityMap = {
    [ActivityPriority.Low]: { color: "default", label: "Low" },
    [ActivityPriority.Medium]: { color: "orange", label: "Medium" },
    [ActivityPriority.High]: { color: "volcano", label: "High" },
};

function ActivityFeedContent() {
    const { styles } = useStyles();
    const { activities, filters, totalCount, isPending } = useContext(ActivityStateContext);
    const activityActions = useContext(ActivityActionContext);
    
    const [activeTab, setActiveTab] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch data based on the active tab
    const fetchData = useCallback(() => {
        if (activeTab === "upcoming") {
            activityActions?.getUpcoming(7);
        } else if (activeTab === "overdue") {
            activityActions?.getOverdue();
        } else {
            activityActions?.getActivities(filters);
        }
    }, [activeTab, filters, activityActions]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleComplete = async (id: string) => {
        try {
            // Your API requires an outcome string for completion
            await activityActions?.completeActivity(id, "Marked complete from global feed");
            message.success("Activity completed");
        } catch (error) {
            message.error("Failed to update activity");
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this activity?")) {
            try {
                await activityActions?.deleteActivity?.(id);
                message.success("Activity deleted");
            } catch (error) {
                message.error("Failed to delete activity");
            }
        }
    };

    const columns = [
        {
            title: "TYPE",
            dataIndex: "type",
            key: "type",
            width: 80,
            render: (type: ActivityType) => (
                <Tooltip title={typeMap[type]?.label}>
                    <Avatar 
                        shape="square" 
                        size="small"
                        icon={typeMap[type]?.icon} 
                        style={{ 
                            backgroundColor: 'transparent', 
                            border: `1px solid ${typeMap[type]?.color}`, 
                            color: typeMap[type]?.color 
                        }} 
                    />
                </Tooltip>
            )
        },
        {
            title: "SUBJECT & DESCRIPTION",
            key: "subject",
            render: (record: any) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text strong style={{ color: '#fff' }}>{record.subject}</Text>
                    <Text style={{ color: '#595959', fontSize: '12px' }} ellipsis>
                        {record.description || "No additional notes"}
                    </Text>
                </div>
            )
        },
        {
            title: "DUE DATE",
            dataIndex: "dueDate",
            key: "dueDate",
            render: (date: string, record: any) => {
                const isOverdue = dayjs(date).isBefore(dayjs()) && record.status === ActivityStatus.Scheduled;
                return (
                    <Space direction="vertical" size={0}>
                        <Text style={{ color: isOverdue ? '#cf1322' : '#d9d9d9', fontSize: '13px' }}>
                            {dayjs(date).format('DD MMM YYYY, HH:mm')}
                        </Text>
                        <Text style={{ color: '#595959', fontSize: '11px' }}>
                            {dayjs(date).fromNow()}
                        </Text>
                    </Space>
                );
            }
        },
        {
            title: "PRIORITY",
            dataIndex: "priority",
            key: "priority",
            render: (priority: ActivityPriority) => (
                <Tag color={priorityMap[priority]?.color} bordered={false}>
                    {priorityMap[priority]?.label}
                </Tag>
            )
        },
        {
            title: "STATUS",
            dataIndex: "status",
            key: "status",
            render: (status: ActivityStatus) => (
                <Badge 
                    status={status === ActivityStatus.Completed ? "success" : "processing"} 
                    text={<Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                        {status === ActivityStatus.Completed ? "COMPLETED" : "SCHEDULED"}
                    </Text>} 
                />
            )
        },
        {
            title: "ACTIONS",
            key: "actions",
            align: 'right' as const,
            render: (record: any) => (
                <Space>
                    {record.status === ActivityStatus.Scheduled && (
                        <Button 
                            size="small" 
                            type="primary"
                            ghost
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleComplete(record.id)}
                        >
                            COMPLETE
                        </Button>
                    )}
                    <Can perform="DELETE_ACTIVITY">
                        <Button 
                            type="text" 
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record.id)}
                        />
                    </Can>
                    <Button type="text" icon={<MoreOutlined />} style={{ color: '#595959' }} />
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '0 24px' }}>
            {/* Header Section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
                <header>
                    <Text style={{ color: '#595959', letterSpacing: '2px', fontSize: '10px', fontWeight: 700 }}>
                        RELATIONSHIP MANAGEMENT
                    </Text>
                    <Title level={2} className={styles.pageTitle} style={{ margin: 0, marginTop: 4 }}>
                        ACTIVITY FEED
                    </Title>
                </header>
                <Can perform="CREATE_ACTIVITY">
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        className={styles.primaryButton}
                        size="large"
                        onClick={() => setIsModalOpen(true)}
                    >
                        LOG ACTIVITY
                    </Button>
                </Can>
            </div>

            {/* View Tabs */}
            <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                items={[
                    { key: "all", label: "ALL ACTIVITIES" },
                    { key: "upcoming", label: "UPCOMING TASKS" },
                    { key: "overdue", label: <span style={{ color: '#ff4d4f' }}>OVERDUE</span> },
                ]}
            />

            {/* Filter Bar */}
            <div className={styles.filterSection} style={{ marginBottom: 24, display: 'flex', gap: '16px' }}>
                <Select 
                    placeholder="Activity Type" 
                    style={{ width: 180 }}
                    allowClear
                    onChange={(val) => activityActions?.updateFilters({ type: val, pageNumber: 1 })}
                    popupClassName={styles.drawerSelectPopup}
                >
                    <Select.Option value={ActivityType.Call}>Phone Calls</Select.Option>
                    <Select.Option value={ActivityType.Meeting}>Meetings</Select.Option>
                    <Select.Option value={ActivityType.Task}>Tasks</Select.Option>
                    <Select.Option value={ActivityType.Email}>Emails</Select.Option>
                </Select>

                <Select 
                    placeholder="Priority" 
                    style={{ width: 140 }}
                    allowClear
                    onChange={(val) => activityActions?.updateFilters({ priority: val, pageNumber: 1 })}
                    popupClassName={styles.drawerSelectPopup}
                >
                    <Select.Option value={ActivityPriority.High}>High Only</Select.Option>
                    <Select.Option value={ActivityPriority.Medium}>Medium</Select.Option>
                    <Select.Option value={ActivityPriority.Low}>Low</Select.Option>
                </Select>
            </div>

            {/* Table */}
            <Table 
                columns={columns} 
                dataSource={activities} 
                loading={isPending}
                rowKey="id"
                className={styles.customTable}
                pagination={{
                    total: totalCount,
                    current: filters.pageNumber,
                    pageSize: filters.pageSize,
                    showSizeChanger: false,
                    onChange: (page) => activityActions?.updateFilters({ pageNumber: page })
                }}
            />

            {/* Modal Integration */}
            <Can perform="CREATE_ACTIVITY">
                <LogActivityModal 
                    open={isModalOpen} 
                    onCancel={() => setIsModalOpen(false)} 
                />
            </Can>
        </div>
    );
}

/**
 * Page Export with nested Providers
 */
export default function ActivityPage() {
    return (
        <ClientProvider>
            <OpportunityProvider>
                <ActivityProvider>
                    <ActivityFeedContent />
                </ActivityProvider>
            </OpportunityProvider>
        </ClientProvider>
    );
}