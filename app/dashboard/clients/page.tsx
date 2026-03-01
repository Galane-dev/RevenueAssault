"use client";

import React, { useEffect, useState, useContext } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Table, Input, Tag, Space, Button, Typography, message, Modal, Drawer, Divider, Spin, List, Card } from "antd";
import { 
  SearchOutlined, 
  PlusOutlined, 
  GlobalOutlined, 
  DeleteOutlined,
  ExclamationCircleOutlined,
  MessageOutlined,
  DollarOutlined,
  ArrowRightOutlined
} from "@ant-design/icons";
import { useStyles } from "../style";
import { ClientStateContext, ClientActionContext, IClient } from "@/app/providers/clientProvider/context";
import { ClientProvider } from "@/app/providers/clientProvider";
import AddClientModal from "../../components/modals/addClientModal";
import { AIChatComponent, ChatButton } from "../../components/ai";
import { useAIChat } from "@/app/hooks/useAIChat";
import { useAIClientsContext } from "@/app/providers/clientProvider/useAIContext";
import { Can } from "../../components/auth/can";
import { withAuth } from "../../hoc/withAuth";
import { NoteProvider } from "@/app/providers/noteProvider";
import { EntityType } from "@/app/providers/noteProvider/context";
import { NoteSection } from "@/app/components/notes/notes";
import { getAxiosInstance } from "@/app/utils/axiosInstance";

const { Title, Text } = Typography;
const { confirm } = Modal;

function ClientsContent() {
  const { styles } = useStyles();
  
  const { isChatOpen, openChat, closeChat } = useAIChat({ pageTitle: 'Clients' });
  const aiContext = useAIClientsContext();

  const { clients, client, totalCount, isPending, filters } = useContext(ClientStateContext);
  const actions = useContext(ClientActionContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Local state for opportunities
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isOpsPending, setIsOpsPending] = useState(false);

  useEffect(() => {
    actions?.getClients(filters);
  }, [filters, actions]);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    actions?.updateFilters?.({ searchTerm: value, pageNumber: 1 });
  }, 500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  const fetchClientOpportunities = async (clientId: string) => {
    setIsOpsPending(true);
    try {
      const response = await getAxiosInstance().get("/api/opportunities", { 
        params: { clientId, pageSize: 5 } 
      });
      setOpportunities(response.data.items || []);
    } catch (error) {
      console.error("Failed to fetch opportunities", error);
    } finally {
      setIsOpsPending(false);
    }
  };

  const handleRowClick = async (record: IClient) => {
    setIsDrawerOpen(true);
    setOpportunities([]); // Clear previous ops
    actions?.getClient(record.id);
    fetchClientOpportunities(record.id);
  };

  const columns = [
    {
      title: "CLIENT NAME",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text strong style={{ color: "#fff" }}>{text}</Text>,
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
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: active ? '#52c41a' : '#ff4d4f' }} />
          <Text style={{ color: '#8c8c8c' }}>{active ? "ACTIVE" : "INACTIVE"}</Text>
        </Space>
      ),
    },
    {
      title: "WEBSITE",
      dataIndex: "website",
      key: "website",
      render: (url: string) => (
        <Button type="link" icon={<GlobalOutlined />} href={url} target="_blank" style={{ color: "#b6b6b6", padding: 0 }} onClick={(e) => e.stopPropagation()}>
          Visit
        </Button>
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      align: 'right' as const,
      render: (_: unknown, record: IClient) => (
        <Space size="middle" onClick={(e) => e.stopPropagation()}>
          <Can perform="DELETE_CLIENT">
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => {
                confirm({
                    title: `Delete ${record.name}?`,
                    onOk: () => actions?.deleteClient(record.id)
                });
            }} />
          </Can>
        </Space>
      ),
    },
  ];

  return (
    <>
      {/* Header and Table remains the same */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
        <header>
          <Text style={{ color: '#595959', letterSpacing: '2px', fontSize: '12px' }}>CRM / RELATIONSHIPS</Text>
          <Title level={2} className={styles.pageTitle} style={{ margin: 0 }}>CLIENTS</Title>
        </header>
        <div style={{ display: "flex", gap: 12 }}>
          <ChatButton onClick={() => openChat(aiContext)} />
          <Can perform="CREATE_CLIENT">
            <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setIsModalOpen(true)}>ADD NEW CLIENT</Button>
          </Can>
        </div>
      </div>

      <div className={styles.filterSection}>
        <Input placeholder="Search..." prefix={<SearchOutlined />} value={searchInput} onChange={handleSearchChange} />
      </div>

      <Table
        className={styles.customTable}
        columns={columns}
        dataSource={clients}
        rowKey="id"
        loading={isPending && clients?.length === 0}
        onRow={(record) => ({ onClick: () => handleRowClick(record) })}
        pagination={{ total: totalCount, current: filters.pageNumber, pageSize: filters.pageSize }}
      />

      <Drawer
        title={<Title level={4} style={{ margin: 0, color: '#fff' }}>{client?.name || "Client Details"}</Title>}
        placement="right"
        width={550}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        styles={{
          body: { background: '#141414', padding: '24px' },
          header: { background: '#141414', borderBottom: '1px solid #303030' }
        }}
      >
        {isPending && !client ? <Spin /> : client && (
          <>
            {/* Info Section */}
            <div style={{ marginBottom: 32 }}>
              <Space split={<Divider type="vertical" />}>
                <Tag color="cyan">{client.industry}</Tag>
                <Text type="secondary">{client.website}</Text>
              </Space>
            </div>

            {/* Opportunities Section */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={5} style={{ color: '#fff', margin: 0 }}>
                  <DollarOutlined /> ACTIVE OPPORTUNITIES
                </Title>
                <Button type="link" size="small">View All</Button>
              </div>

              {isOpsPending ? (
                <Spin size="small" />
              ) : (
                <List
                  dataSource={opportunities}
                  locale={{ emptyText: <Text type="secondary">No opportunities found.</Text> }}
                  renderItem={(op) => (
                    <Card size="small" style={{ background: '#1d1d1d', border: '1px solid #303030', marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <Text strong style={{ color: '#fff', display: 'block' }}>{op.title}</Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>Value: {op.currency} {op.estimatedValue?.toLocaleString()}</Text>
                        </div>
                        <Tag color="blue" style={{ alignSelf: 'center' }}>Stage {op.stage}</Tag>
                      </div>
                    </Card>
                  )}
                />
              )}
            </div>

            <Divider style={{ borderColor: '#303030' }} />

            {/* Notes Section */}
            <Title level={5} style={{ color: '#fff', marginBottom: 16 }}>
                <MessageOutlined /> ACTIVITY NOTES
            </Title>
            <NoteSection type={EntityType.Account} id={client.id} />
          </>
        )}
      </Drawer>

      <AddClientModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} />
      <AIChatComponent open={isChatOpen} onClose={closeChat} context={aiContext} />
    </>
  );
}

export default withAuth(function ClientsPage() {
  return (
    <ClientProvider>
      <NoteProvider>
        <ClientsContent />
      </NoteProvider>
    </ClientProvider>
  );
});