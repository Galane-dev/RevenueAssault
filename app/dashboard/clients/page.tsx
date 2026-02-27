"use client";

import React, { useEffect, useState, useContext } from "react";
import { Table, Input, Tag, Space, Button, Typography, message, Modal } from "antd";
import { 
  SearchOutlined, 
  PlusOutlined, 
  GlobalOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ExclamationCircleOutlined 
} from "@ant-design/icons";
import { useStyles } from "../style";
import { ClientStateContext, ClientActionContext } from "@/app/providers/clientProvider/context";
import { ClientProvider } from "@/app/providers/clientProvider";
import AddClientModal from "../../components/modals/addClientModal";
import { Can } from "../../components/auth/can";
import { withAuth } from "../../hoc/withAuth";

const { Title, Text } = Typography;
const { confirm } = Modal;

function ClientsContent() {
  const { styles } = useStyles();
  
  // Consuming contexts modeled after the Machine pattern
  const { clients, totalCount, isPending, filters } = useContext(ClientStateContext);
  const actions = useContext(ClientActionContext);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Trigger fetch whenever global filters change
  useEffect(() => {
    actions?.getClients(filters);
  }, [filters, actions]);

  const showDeleteConfirm = (id: string, name: string) => {
    confirm({
      title: `Delete ${name}?`,
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: 'This action cannot be undone and will change status to inactive.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        actions?.deleteClient(id);
        message.success("Client deleted");
      },
    });
  };

  const columns = [
    {
      title: "CLIENT NAME",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <Text strong style={{ color: "#fff" }}>{text}</Text>
      ),
    },
    {
      title: "INDUSTRY",
      dataIndex: "industry",
      key: "industry",
      render: (industry: string) => (
        <Tag color="cyan" style={{ borderRadius: 0, border: 'none', background: '#132322', color: '#5cdbd3' }}>
          {industry?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "isActive",
      key: "isActive",
      render: (active: boolean) => (
        <Space size={8}>
          <div style={{ 
            width: 8, height: 8, borderRadius: '50%', 
            background: active ? '#52c41a' : '#ff4d4f' 
          }} />
          <Text style={{ color: '#8c8c8c' }}>{active ? "ACTIVE" : "INACTIVE"}</Text>
        </Space>
      ),
    },
    {
      title: "WEBSITE",
      dataIndex: "website",
      key: "website",
      render: (url: string) => (
        <Button 
          type="link" 
          icon={<GlobalOutlined />} 
          href={url} 
          target="_blank" 
          style={{ color: "#b6b6b6", padding: 0 }}
        >
          Visit
        </Button>
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      align: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} style={{ color: "#8c8c8c" }} />
          <Can perform="DELETE_CLIENT">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => showDeleteConfirm(record.id, record.name)} 
            />
          </Can>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
        <header>
          <Text style={{ color: '#595959', letterSpacing: '2px', fontSize: '12px' }}>CRM / RELATIONSHIPS</Text>
          <Title level={2} className={styles.pageTitle} style={{ margin: 0 }}>CLIENTS</Title>
        </header>
        <Can perform="CREATE_CLIENT">
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large" 
            className={styles.primaryButton}
            onClick={() => setIsModalOpen(true)}
          >
            ADD NEW CLIENT
          </Button>
        </Can>
      </div>

      <div className={styles.filterSection}>
        <Input
          placeholder="Search by company name or industry..."
          prefix={<SearchOutlined style={{ color: '#595959' }} />}
          value={filters.searchTerm}
          onChange={(e) => {
            // Update global filters via action
            actions?.updateFilters?.({ searchTerm: e.target.value, pageNumber: 1 });
          }}
        />
      </div>

      <Table
        className={styles.customTable}
        columns={columns}
        dataSource={clients}
        rowKey="id"
        loading={isPending}
        pagination={{
          total: totalCount,
          current: filters.pageNumber,
          pageSize: filters.pageSize,
          onChange: (page) => actions?.updateFilters?.({ pageNumber: page }),
          position: ['bottomRight'],
        }}
      />

      <Can perform="CREATE_CLIENT">
        <AddClientModal 
          open={isModalOpen} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Can>
    </>
  );
}

// Wrap the content with the Provider
export default withAuth(function ClientsPage() {
  return (
    <ClientProvider>
      <ClientsContent />
    </ClientProvider>
  );
});