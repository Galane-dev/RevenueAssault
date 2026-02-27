"use client";

import React, { useEffect, useContext, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Table, Typography, Tag, Button, Input, Select, Space, Avatar, Tooltip, message } from "antd";
import { PlusOutlined, SearchOutlined, UserOutlined, StarFilled, MailOutlined, PhoneOutlined, StarOutlined, DeleteOutlined } from "@ant-design/icons";
import { useStyles } from "../style";

import { ContactProvider, ContactStateContext, ContactActionContext } from "@/app/providers/contactProvider";
import { ClientProvider, ClientStateContext, ClientActionContext } from "../../providers/clientProvider";
import AddContactModal from "../../components/modals/addContactModal";
import { Can } from "../../components/auth/can";
import { withAuth } from "../../hoc/withAuth";

const { Title, Text } = Typography;

function ContactsContent() {
    const { styles } = useStyles();
    const { contacts, filters, totalCount, isPending } = useContext(ContactStateContext);
    const contactActions = useContext(ContactActionContext);
    const { clients } = useContext(ClientStateContext);
    const clientActions = useContext(ClientActionContext);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchInput, setSearchInput] = useState("");

    useEffect(() => {
        contactActions?.getContacts(filters);
    }, [filters, contactActions]);

    const debouncedSearch = useDebouncedCallback((value: string) => {
        contactActions?.updateFilters({ searchTerm: value, pageNumber: 1 });
    }, 500);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchInput(value);
        debouncedSearch(value);
    };

    useEffect(() => {
        if (!clients || clients.length === 0) {
            clientActions?.getClients({ pageNumber: 1, pageSize: 100 });
        }
    }, [clients, clientActions]);

    const handleDeleteContact = (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                contactActions?.deleteContact(id);
                message.success("Contact deleted successfully");
            } catch (error) {
                message.error("Failed to delete contact");
            }
        }
    };

    const columns = [
        {
            title: "CONTACT",
            key: "contact",
            render: (record: any) => (
                <Space size="middle">
                    <Avatar 
                        icon={<UserOutlined />} 
                        style={{ backgroundColor: record.isPrimaryContact ? '#050505' : '#1a1a1a', border: '1px solid #303030' }} 
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Space size={4}>
                            <Text strong style={{ color: '#fff' }}>{`${record.firstName} ${record.lastName}`}</Text>
                            {record.isPrimaryContact && (
                                <Tooltip title="Primary Contact">
                                    <StarOutlined style={{ color: '#9a9a9a', fontSize: '12px' }} />
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
            dataIndex: "phoneNumber", // Updated
            key: "phoneNumber",
            render: (text: string) => (
                <Text style={{ color: '#8c8c8c' }}>
                    <PhoneOutlined style={{ marginRight: 8, fontSize: '11px' }} />
                    {text || "N/A"}
                </Text>
            )
        },
        {
            title: "POSITION", // Updated from Role
            dataIndex: "position",
            key: "position",
            render: (text: string, record: any) => (
                <Space direction="vertical" size={0}>
                    <Text style={{ color: '#d9d9d9' }}>{text || "Stakeholder"}</Text>
                    {record.isPrimaryContact && <Tag color="#21c718"  style={{ fontSize: '10px', marginTop: 4, backgroundColor:" #00cc0b62" }}>PRIMARY</Tag>}
                </Space>
            )
        },
        {
            title: "ACTIONS",
            key: "actions",
            align: 'right' as const,
            render: (record: any) => (
                <Space>
                    <Button 
                        type="text" 
                        disabled={record.isPrimaryContact}
                        onClick={() => contactActions?.setPrimary(record.id)}
                        style={{ color: record.isPrimaryContact ? '#262626' : '#138c1d', fontSize: '12px' }}
                    >
                        {record.isPrimaryContact ? "PRIMARY" : "SET AS PRIMARY"}
                    </Button>
                    <Can perform="DELETE_CONTACT">
                        <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />} 
                            onClick={() => handleDeleteContact(record.id, `${record.firstName} ${record.lastName}`)}
                            style={{ fontSize: '12px' }}
                        />
                    </Can>
                </Space>
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
                <Can perform="CREATE_CONTACT">
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        className={styles.primaryButton} 
                        size="large"
                        onClick={() => setIsModalOpen(true)}
                    >
                        ADD NEW CONTACT
                    </Button>
                </Can>
            </div>

            <div className={styles.filterSection} style={{ marginBottom: 24, gap: 16 }}>
                <Input 
                    placeholder="Search by name, email or phone..." 
                    style={{ maxWidth: 400 }}
                    prefix={<SearchOutlined style={{ color: '#595959' }} />}
                    value={searchInput}
                    onChange={handleSearchChange}
                />
                <Select 
                    placeholder="Filter by Client" 
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

            <Can perform="CREATE_CONTACT">
                <AddContactModal 
                    open={isModalOpen} 
                    onCancel={() => setIsModalOpen(false)} 
                />
            </Can>
        </div>
    );
}

export default withAuth(function ContactsPage() {
    return (
        <ClientProvider>
            <ContactProvider>
                <ContactsContent />
            </ContactProvider>
        </ClientProvider>
    );
});