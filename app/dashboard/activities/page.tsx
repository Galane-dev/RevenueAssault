"use client";

import React, { useEffect, useContext, useState, useCallback, useMemo } from "react";
import { Typography, Tag, Button, Select, Space, Tabs, Avatar, Tooltip, message, Badge, Empty } from "antd";
import {
    PhoneOutlined,
    MailOutlined,
    CalendarOutlined,
    CheckSquareOutlined,
    PlusOutlined,
    CheckCircleOutlined,
    DeleteOutlined,
    DownloadOutlined,
} from "@ant-design/icons";
import { useStyles } from "../style";
import dayjs, { Dayjs } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { ActivityProvider, ActivityStateContext, ActivityActionContext } from "@/app/providers/activityProvider";
import { IActivity, ActivityType, ActivityStatus, ActivityPriority } from "@/app/providers/activityProvider/context";
import { ClientProvider } from "@/app/providers/clientProvider";
import { OpportunityProvider } from "@/app/providers/opportunitiesProvider";

import LogActivityModal from "../../components/modals/logActivityModal";
import { AIChatComponent, ChatButton } from "../../components/ai";
import { Can } from "../../components/auth/can";
import { withAuth } from "../../hoc/withAuth";
import { useAIChat } from "@/app/hooks/useAIChat";
import { useAIActivitiesContext } from "@/app/providers/activityProvider/useAIContext";
import { exportToCsv } from "@/app/utils/csvExport";

dayjs.extend(relativeTime);
const { Title, Text } = Typography;

const typeMap: Record<ActivityType, { icon: React.ReactNode; color: string; label: string }> = {
    [ActivityType.Task]: { icon: <CheckSquareOutlined />, color: "#8c8c8c", label: "Task" },
    [ActivityType.Meeting]: { icon: <CalendarOutlined />, color: "#1890ff", label: "Meeting" },
    [ActivityType.Email]: { icon: <MailOutlined />, color: "#52c41a", label: "Email" },
    [ActivityType.Call]: { icon: <PhoneOutlined />, color: "#722ed1", label: "Call" },
};

const priorityMap: Record<ActivityPriority, { color: string; label: string }> = {
    [ActivityPriority.Low]: { color: "default", label: "Low" },
    [ActivityPriority.Medium]: { color: "orange", label: "Medium" },
    [ActivityPriority.High]: { color: "volcano", label: "High" },
};

const statusMap: Record<ActivityStatus, { label: string; badgeStatus: "success" | "processing" | "default" }> = {
    [ActivityStatus.Scheduled]: { label: "SCHEDULED", badgeStatus: "processing" },
    [ActivityStatus.Completed]: { label: "COMPLETED", badgeStatus: "success" },
    [ActivityStatus.Cancelled]: { label: "CANCELLED", badgeStatus: "default" },
};

const getValidDate = (value?: string): Dayjs | null => {
    if (!value) return null;
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed : null;
};

function ActivityFeedContent() {
    const { styles } = useStyles();
    const { activities, filters, isPending } = useContext(ActivityStateContext);
    const activityActions = useContext(ActivityActionContext);
    const { isChatOpen, openChat, closeChat } = useAIChat({ pageTitle: "Activities" });
    const aiContext = useAIActivitiesContext();

    const [activeTab, setActiveTab] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = useCallback(() => {
        if (activeTab === "upcoming") {
            activityActions?.getUpcoming(7);
            return;
        }

        if (activeTab === "overdue") {
            activityActions?.getOverdue();
            return;
        }

        activityActions?.getActivities(filters);
    }, [activeTab, filters, activityActions]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const displayActivities = useMemo(
        () =>
            [...(activities || [])].sort((a, b) => {
                const dateA = getValidDate(a.dueDate);
                const dateB = getValidDate(b.dueDate);

                if (!dateA && !dateB) return 0;
                if (!dateA) return 1;
                if (!dateB) return -1;
                return dateA.valueOf() - dateB.valueOf();
            }),
        [activities]
    );

    const timetableGroups = useMemo(() => {
        const groups = new Map<string, IActivity[]>();

        displayActivities.forEach((activity) => {
            const date = getValidDate(activity.dueDate);
            const key = date ? date.format("YYYY-MM-DD") : "UNSCHEDULED";
            const current = groups.get(key) || [];
            groups.set(key, [...current, activity]);
        });

        return [...groups.entries()]
            .sort(([a], [b]) => {
                if (a === "UNSCHEDULED") return 1;
                if (b === "UNSCHEDULED") return -1;
                return dayjs(a).valueOf() - dayjs(b).valueOf();
            })
            .map(([key, items]) => ({
                key,
                label: key === "UNSCHEDULED" ? "Unscheduled" : dayjs(key).format("dddd, DD MMM YYYY"),
                items,
            }));
    }, [displayActivities]);

    const handleComplete = async (id: string) => {
        try {
            await activityActions?.completeActivity(id, "Marked complete from global feed");
            message.success("Activity completed");
        } catch {
            message.error("Failed to update activity");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this activity?")) return;

        try {
            await activityActions?.deleteActivity(id);
            message.success("Activity deleted");
        } catch {
            message.error("Failed to delete activity");
        }
    };

    const handleExportActivities = () => {
        if (!activities || activities.length === 0) {
            message.info("There are no activities to export.");
            return;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        exportToCsv({
            filename: `activities-${timestamp}.csv`,
            headers: [
                "ID",
                "Type",
                "Subject",
                "Description",
                "Due Date",
                "Priority",
                "Status",
                "Assigned To",
                "Related Type",
                "Related ID",
                "Duration (mins)",
                "Location",
                "Outcome",
            ],
            rows: activities.map((activity) => [
                activity.id,
                typeMap[activity.type]?.label || "Unknown",
                activity.subject,
                activity.description || "",
                getValidDate(activity.dueDate)?.format("YYYY-MM-DD HH:mm") || "",
                priorityMap[activity.priority]?.label || "Unknown",
                statusMap[activity.status]?.label || "Unknown",
                activity.assignedToId,
                activity.relatedToType,
                activity.relatedToId,
                activity.duration ?? "",
                activity.location || "",
                activity.outcome || "",
            ]),
        });

        message.success("Activities exported successfully.");
    };

    const isFilterEnabled = activeTab === "all";

    return (
        <div style={{ padding: "0 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
                <header>
                    <Text style={{ color: "#595959", letterSpacing: "2px", fontSize: "10px", fontWeight: 700 }}>
                        RELATIONSHIP MANAGEMENT
                    </Text>
                    <Title level={2} className={styles.pageTitle} style={{ margin: 0, marginTop: 4 }}>
                        ACTIVITY FEED
                    </Title>
                </header>
                <div style={{ display: "flex", gap: 12 }}>
                    <ChatButton onClick={() => openChat(aiContext)} title="Ask AI about activities" />
                    <Button icon={<DownloadOutlined />} size="large" onClick={handleExportActivities}>
                        EXPORT CSV
                    </Button>
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
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                    { key: "all", label: "ALL ACTIVITIES" },
                    { key: "upcoming", label: "UPCOMING (7 DAYS)" },
                    { key: "overdue", label: "OVERDUE" },
                ]}
            />

            <div className={styles.filterSection} style={{ marginBottom: 24, display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <Select
                    placeholder="Activity Type"
                    style={{ width: 180 }}
                    allowClear
                    value={filters.type}
                    disabled={!isFilterEnabled}
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
                    value={filters.priority}
                    disabled={!isFilterEnabled}
                    onChange={(val) => activityActions?.updateFilters({ priority: val, pageNumber: 1 })}
                    popupClassName={styles.drawerSelectPopup}
                >
                    <Select.Option value={ActivityPriority.High}>High</Select.Option>
                    <Select.Option value={ActivityPriority.Medium}>Medium</Select.Option>
                    <Select.Option value={ActivityPriority.Low}>Low</Select.Option>
                </Select>

                <Select
                    placeholder="Status"
                    style={{ width: 160 }}
                    allowClear
                    value={filters.status}
                    disabled={!isFilterEnabled}
                    onChange={(val) => activityActions?.updateFilters({ status: val, pageNumber: 1 })}
                    popupClassName={styles.drawerSelectPopup}
                >
                    <Select.Option value={ActivityStatus.Scheduled}>Scheduled</Select.Option>
                    <Select.Option value={ActivityStatus.Completed}>Completed</Select.Option>
                    <Select.Option value={ActivityStatus.Cancelled}>Cancelled</Select.Option>
                </Select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {timetableGroups.length === 0 ? (
                    <div style={{ border: "1px solid #1f1f1f", borderRadius: 6, padding: 32 }}>
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={<Text style={{ color: "#8c8c8c" }}>{isPending ? "Loading activities..." : "No activities available"}</Text>}
                        />
                    </div>
                ) : (
                    timetableGroups.map((group) => (
                        <div
                            key={group.key}
                            style={{
                                border: "1px solid #2b2b2b",
                                borderRadius: 6,
                                overflow: "hidden",
                                background: "#050505",
                            }}
                        >
                            <div
                                style={{
                                    padding: "10px 14px",
                                    borderBottom: "1px solid #2b2b2b",
                                    background: "#0d0d0d",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <Space>
                                    <CalendarOutlined style={{ color: "#8c8c8c" }} />
                                    <Text strong style={{ color: "#e7e7e7" }}>
                                        {group.label}
                                    </Text>
                                </Space>
                                <Tag bordered={false}>{group.items.length} activities</Tag>
                            </div>

                            {group.items.map((activity, index) => {
                                const dueDate = getValidDate(activity.dueDate);
                                const status = statusMap[activity.status] || statusMap[ActivityStatus.Scheduled];
                                const isOverdue = !!dueDate && dueDate.isBefore(dayjs()) && activity.status === ActivityStatus.Scheduled;

                                return (
                                    <div
                                        key={activity.id}
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "100px 1fr auto",
                                            gap: 12,
                                            alignItems: "center",
                                            padding: "12px 14px",
                                            borderBottom: index === group.items.length - 1 ? "none" : "1px solid #1a1a1a",
                                        }}
                                    >
                                        <Text style={{ color: isOverdue ? "#cf1322" : "#8c8c8c", fontSize: 12 }}>
                                            {dueDate ? dueDate.format("HH:mm") : "No time"}
                                        </Text>

                                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                            <Space size={8}>
                                                <Tooltip title={typeMap[activity.type]?.label}>
                                                    <Avatar
                                                        shape="square"
                                                        size={18}
                                                        icon={typeMap[activity.type]?.icon}
                                                        style={{
                                                            backgroundColor: "transparent",
                                                            border: `1px solid ${typeMap[activity.type]?.color}`,
                                                            color: typeMap[activity.type]?.color,
                                                        }}
                                                    />
                                                </Tooltip>
                                                <Text strong style={{ color: "#f0f0f0" }}>
                                                    {activity.subject}
                                                </Text>
                                            </Space>

                                            <Space size={8} wrap>
                                                <Tag bordered={false} color={priorityMap[activity.priority]?.color}>
                                                    {priorityMap[activity.priority]?.label}
                                                </Tag>
                                                <Badge
                                                    status={status.badgeStatus}
                                                    text={<Text style={{ color: "#8c8c8c", fontSize: 12 }}>{status.label}</Text>}
                                                />
                                                {dueDate && <Text style={{ color: "#595959", fontSize: 12 }}>{dueDate.fromNow()}</Text>}
                                            </Space>

                                            {activity.description && <Text style={{ color: "#595959", fontSize: 12 }}>{activity.description}</Text>}
                                        </div>

                                        <Space>
                                            {activity.status === ActivityStatus.Scheduled && (
                                                <Button
                                                    size="small"
                                                    type="primary"
                                                    ghost
                                                    icon={<CheckCircleOutlined />}
                                                    onClick={() => handleComplete(activity.id)}
                                                >
                                                    Complete
                                                </Button>
                                            )}
                                            <Can perform="DELETE_ACTIVITY">
                                                <Button
                                                    type="text"
                                                    danger
                                                    size="small"
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => handleDelete(activity.id)}
                                                />
                                            </Can>
                                        </Space>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
            </div>

            <Can perform="CREATE_ACTIVITY">
                <LogActivityModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} />
            </Can>

            <AIChatComponent
                open={isChatOpen}
                onClose={closeChat}
                context={aiContext}
                title="Activities AI Assistant"
                pageTitle="Activities"
            />
        </div>
    );
}

export default withAuth(function ActivityPage() {
    return (
        <ClientProvider>
            <OpportunityProvider>
                <ActivityProvider>
                    <ActivityFeedContent />
                </ActivityProvider>
            </OpportunityProvider>
        </ClientProvider>
    );
});