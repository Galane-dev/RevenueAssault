"use client";

import React, { useEffect, useContext, useState } from "react";
import { Table, Typography, Tag, Button, Input, Select, Space, Avatar, Tooltip } from "antd";
import { PlusOutlined, SearchOutlined, UserOutlined, StarFilled, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { useStyles } from "../style";

// Providers and Contexts
import { ContactProvider, ContactStateContext, ContactActionContext } from "@/app/providers/contactProvider";
import { ClientProvider, ClientStateContext, ClientActionContext } from "../../providers/clientProvider";

// Components
import AddContactModal from "../../components/modals/addContactModal";

const { Title, Text } = Typography;

function ContactsContent() {
    const { styles } = useStyles();
    
    // Consume Contact Machine State/Actions
    const { contacts, filters, totalCount, isPending } = useContext(ContactStateContext);
    const contactActions = useContext(ContactActionContext);

    // Consume Client Machine State/Actions for the filter dropdown
    const { clients } = useContext(ClientStateContext);
    const clientActions = useContext(ClientActionContext);

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Initial load and filter synchronization
    useEffect(() => {
        contactActions?.getContacts(filters);
    }, [filters, contactActions]);

    // Fetch clients once for the filter dropdown if they aren't loaded
    useEffect(() => {
        if (!clients || clients.length === 0) {
            clientActions?.getClients({ pageNumber: 1, pageSize: 100 });
        }
    }, [clients, clientActions]);

    const columns = [
        {
            title: "CONTACT",
            key: "contact",
            render: (record: any) => (
                <Space size="middle">
                    <Avatar 
                        icon={<UserOutlined />} 
                        style={{ backgroundColor: record.isPrimary ? '#1677ff' : '#1a1a1a', border: '1px solid #303030' }} 
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Space size={4}>
                            <Text strong style={{ color: '#fff' }}>{`${record.firstName} ${record.lastName}`}</Text>
                            {record.isPrimary && (
                                <Tooltip title="Primary Contact">
                                    <StarFilled style={{ color: '#faad14', fontSize: '12px' }} />
                                </Tooltip>
                            )}
                        </Space>
                        <Text style={{ color: '#595959', fontSize: '12px' }}>
                            <MailOutlined style={{ marginRight: 4 }} />{record.email}
                        </Text>
                    </div>
                </Space>
            )
        },
        {
            title: "CLIENT / COMPANY",
            dataIndex: "clientName",
            key: "clientName",
            render: (text: string) => (
                <Tag bordered={false} style={{ background: '#141414', color: '#8c8c8c', border: '1px solid #303030' }}>
                    {text || "Individual"}
                </Tag>
            )
        },
        {
            title: "PHONE",
            dataIndex: "phone",
            key: "phone",
            render: (text: string) => (
                <Text style={{ color: '#8c8c8c' }}>
                    <PhoneOutlined style={{ marginRight: 8, fontSize: '11px' }} />
                    {text || "N/A"}
                </Text>
            )
        },
        {
            title: "ROLE",
            key: "role",
            render: (record: any) => (
                record.isPrimary ? <Tag color="blue">Primary Decision Maker</Tag> : <Text style={{ color: '#434343' }}>Stakeholder</Text>
            )
        },
        {
            title: "ACTIONS",
            key: "actions",
            align: 'right' as const,
            render: (record: any) => (
                <Button 
                    type="text" 
                    disabled={record.isPrimary}
                    onClick={() => contactActions?.setPrimary(record.id)}
                    style={{ color: record.isPrimary ? '#262626' : '#1677ff', fontSize: '12px' }}
                >
                    {record.isPrimary ? "PRIMARY" : "SET AS PRIMARY"}
                </Button>
            )
        }
    ];

    return (
        <div style={{ padding: '0 24px' }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
                <header>
                    <Text style={{ color: '#595959', letterSpacing: '2px', fontSize: '10px', fontWeight: 700 }}>
                        RELATIONSHIP MANAGEMENT
                    </Text>
                    <Title level={2} className={styles.pageTitle} style={{ margin: 0, marginTop: 4 }}>
                        CONTACT DIRECTORY
                    </Title>
                </header>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    className={styles.primaryButton} 
                    size="large"
                    onClick={() => setIsModalOpen(true)}
                >
                    ADD NEW CONTACT
                </Button>
            </div>

            <div className={styles.filterSection} style={{ marginBottom: 24, gap: 16 }}>
                <Input 
                    placeholder="Search by name, email or phone..." 
                    className={styles.searchInput}
                    style={{ maxWidth: 400 }}
                    prefix={<SearchOutlined style={{ color: '#595959' }} />}
                    value={filters.searchTerm}
                    onChange={(e) => contactActions?.updateFilters({ searchTerm: e.target.value, pageNumber: 1 })}
                />
                <Select 
                    placeholder="Filter by Client" 
                    className={styles.searchInput}
                    style={{ width: 250 }}
                    allowClear
                    onChange={(val) => contactActions?.updateFilters({ clientId: val, pageNumber: 1 })}
                    popupClassName={styles.drawerSelectPopup}
                >
                    {clients?.map(c => (
                        <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                    ))}
                </Select>
            </div>

            <Table 
                columns={columns} 
                dataSource={contacts} 
                loading={isPending}
                rowKey="id"
                className={styles.customTable}
                pagination={{
                    total: totalCount,
                    current: filters.pageNumber,
                    pageSize: filters.pageSize,
                    showSizeChanger: false,
                    onChange: (page) => contactActions?.updateFilters({ pageNumber: page })
                }}
            />

            <AddContactModal 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
            />
        </div>
    );
}

// Nested Providers to satisfy machine structure evaluation
export default function ContactsPage() {
    return (
        <ClientProvider>
            <ContactProvider>
                <ContactsContent />
            </ContactProvider>
        </ClientProvider>
    );
}