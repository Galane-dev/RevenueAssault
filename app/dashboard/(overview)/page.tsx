"use client";

import React, { useState, useEffect, useRef } from "react";
import { Typography, Row, Col, Card, Table, Statistic, Empty, Spin, Progress, Space, Button, Modal, Form, Input, Select, message } from "antd";
import { 
  LineChartOutlined, 
  FileDoneOutlined,
  ArrowUpOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { Line } from "@ant-design/plots";
import { useStyles } from "../style";
import { useDashboardActions, useDashboardState } from "../../providers/dashboardProvider";
import { AIChatComponent, AISummaryCard, ChatButton } from "../../components/ai";
import { useAIChat } from "@/app/hooks/useAIChat";
import { useAIDashboardContext } from "@/app/providers/dashboardProvider/useAIContext";
import { withAuth } from "../../hoc/withAuth";
import { useAuthState } from "@/app/providers/authProvider";

const { Title, Text } = Typography;
type InviteRole = "SalesRep" | "SalesManager" | "BusinessDevelopmentManager";

interface OpportunityRow {
  id: string;
  clientName?: string;
  stage?: number;
  estimatedValue?: number;
  probability?: number;
  currency?: string;
}

interface MonthlyTrendPoint {
  month?: number;
  year?: number;
  monthName?: string;
  actual?: number;
  projected?: number;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Could not send invitation.";

function DashboardOverview() {
  const { styles } = useStyles();
  const hasFetchedInitialData = useRef(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteForm] = Form.useForm();
  
  // AI Chat
  const { isChatOpen, openChat, closeChat } = useAIChat({ 
    pageTitle: 'Dashboard Overview' 
  });
  const aiContext = useAIDashboardContext();

  // Subscribe to Global Dashboard State
  const { overview, recentOpportunities, isPending } = useDashboardState();
  const { getDashboardOverview, getRecentOpportunities } = useDashboardActions();
  const { user } = useAuthState();

  const currentTenantId = user?.tenantId;

  const onInviteSubmit = async (values: { email: string; role: InviteRole }) => {
    if (!currentTenantId) {
      message.error("Your tenant information is missing. Please login again.");
      return;
    }

    try {
      setIsSendingInvite(true);
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          role: values.role,
          tenantId: currentTenantId,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to send invite");
      }

      message.success("Invitation sent successfully.");
      inviteForm.resetFields();
      setInviteOpen(false);
    } catch (error: unknown) {
      message.error(getErrorMessage(error));
    } finally {
      setIsSendingInvite(false);
    }
  };

  useEffect(() => {
    if (hasFetchedInitialData.current) {
      return;
    }

    hasFetchedInitialData.current = true;

    // Fetch live data on mount only
    getDashboardOverview();
    getRecentOpportunities();
  }, [getDashboardOverview, getRecentOpportunities]);

  const opportunityColumns = [
    {
      title: "CLIENT",
      dataIndex: "clientName",
      key: "clientName",
      render: (text: string) => <Text strong style={{ color: '#fff' }}>{text || 'N/A'}</Text>,
    },
    {
      title: "STAGE",
      dataIndex: "stage",
      key: "stage",
      render: (stage: number) => {
        const stages: Record<number, string> = { 1: 'Discovery', 2: 'Proposal', 3: 'Negotiation', 4: 'Closed' };
        return <Text style={{ color: '#8c8c8c' }}>{stages[stage] || 'Lead'}</Text>;
      }
    },
    {
      title: "VALUE",
      dataIndex: "estimatedValue",
      key: "estimatedValue",
      render: (val: number, record: OpportunityRow) => (
        <Text style={{ color: '#fff' }}>{record.currency || 'ZAR'} {val?.toLocaleString()}</Text>
      ),
    },
    {
      title: "PROBABILITY",
      dataIndex: "probability",
      key: "probability",
      render: (prob: number) => (
        <Text style={{ color: prob > 50 ? '#52c41a' : '#f5222d' }}>{prob}%</Text>
      ),
    },
  ];

  // Prepare revenue trend data with both actual and projected
  const revenueTrendData = (overview?.revenue?.monthlyTrend as MonthlyTrendPoint[] | undefined)?.map((item) => ({
    monthName: item.monthName || `${item.month}/${item.year}`,
    actual: item.actual || 0,
    projected: item.projected || 0
  })) || [];

  // Transform for line chart with multiple series
  const chartData = revenueTrendData.flatMap((item) => [
    { monthName: item.monthName, type: 'Actual', value: item.actual },
    { monthName: item.monthName, type: 'Projected', value: item.projected }
  ]);

  // Show a sleek loading spinner if the initial fetch is happening
  if (isPending && !overview) {
    return (
      <div style={{ height: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#fff' }} spin />} />
      </div>
    );
  }

  return (
    <>
      <header className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} className={styles.pageTitle}>DASHBOARD OVERVIEW</Title>
        <Space>
          <Button
            type="primary"
            className={styles.primaryButton}
            onClick={() => setInviteOpen(true)}
          >
            Invite User
          </Button>
          <ChatButton
            onClick={() => openChat(aiContext)}
            title="Ask AI about dashboard"
          />
        </Space>
      </header>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <AISummaryCard
            overview={overview}
            recentOpportunities={recentOpportunities}
            onAskAI={() => openChat(aiContext)}
          />
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Win Rate - Large Box at Top (Majority Width) */}
        <Col xs={24} sm={24} lg={16}>
          <Card title="WIN RATE" className={styles.kpiCard}>
            <div className={styles.chartPlaceholder} style={{ minHeight: 150 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Statistic
                    value={overview?.opportunities?.winRate || 0}
                    precision={1}
                    valueStyle={{ color: '#52c41a', fontSize: '48px', fontFamily: 'var(--font-monda)' }}
                    suffix="%"
                  />
                  <Text style={{ color: '#8c8c8c', fontSize: '12px', display: 'block', marginTop: 8 }}>
                    <ArrowUpOutlined /> {overview?.opportunities?.wonCount || 0} Deals Won
                  </Text>
                </div>
                <Progress
                  type="circle"
                  percent={overview?.opportunities?.winRate || 0}
                  width={120}
                  format={() => ''}
                  strokeColor="#52c41a"
                  trailColor="#303030"
                />
              </div>
            </div>
          </Card>
        </Col>

        {/* Activities Summary - Small Box at Top (Minority Width) */}
        <Col xs={24} sm={24} lg={8}>
          <Card className={styles.kpiCard}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Space>
                  <CheckCircleOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>COMPLETED TODAY</Text>
                    <Text style={{ fontSize: '20px', fontWeight: 600, display: 'block', color: '#52c41a' }}>
                      {overview?.activities?.completedTodayCount || 0}
                    </Text>
                  </div>
                </Space>
              </div>
              <div>
                <Space>
                  <ClockCircleOutlined style={{ fontSize: 20, color: '#faad14' }} />
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>UPCOMING</Text>
                    <Text style={{ fontSize: '20px', fontWeight: 600, display: 'block', color: '#faad14' }}>
                      {overview?.activities?.upcomingCount || 0}
                    </Text>
                  </div>
                </Space>
              </div>
              <div>
                <Space>
                  <ExclamationCircleOutlined style={{ fontSize: 20, color: '#f5222d' }} />
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>OVERDUE</Text>
                    <Text style={{ fontSize: '20px', fontWeight: 600, display: 'block', color: '#f5222d' }}>
                      {overview?.activities?.overdueCount || 0}
                    </Text>
                  </div>
                </Space>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* Metric 1: Pipeline Value */}
        <Col xs={24} sm={12} lg={8}>
          <Card title="PIPELINE VALUE" className={styles.kpiCard}>
            <div className={styles.chartPlaceholder} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 120 }}>
              <Statistic
                value={overview?.opportunities?.pipelineValue || 0}
                precision={0}
                valueStyle={{ color: '#fff', fontSize: '28px', fontFamily: 'var(--font-monda)' }}
                prefix={<LineChartOutlined style={{ color: '#8c8c8c' }} />}
                suffix="ZAR"
              />
              <Text style={{ color: '#8c8c8c', fontSize: '12px', textAlign: 'right' }}>
                Across {overview?.opportunities?.totalCount || 0} Deals
              </Text>
            </div>
          </Card>
        </Col>

        {/* Metric 2: Active Contracts */}
        <Col xs={24} sm={12} lg={8}>
          <Card title="ACTIVE CONTRACTS" className={styles.kpiCard}>
            <div className={styles.chartPlaceholder} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 120 }}>
              <Statistic
                value={overview?.contracts?.totalActiveCount || 0}
                valueStyle={{ color: '#fff', fontSize: '28px', fontFamily: 'var(--font-monda)' }}
                prefix={<FileDoneOutlined style={{ color: '#8c8c8c' }} />}
              />
              <Text style={{ color: (overview?.contracts?.expiringThisMonthCount || 0) > 0 ? '#f5222d' : '#8c8c8c', fontSize: '12px', textAlign: 'right' }}>
                {overview?.contracts?.expiringThisMonthCount || 0} Expiring this month
              </Text>
            </div>
          </Card>
        </Col>

        {/* Metric 3: Contract Value */}
        <Col xs={24} sm={12} lg={8}>
          <Card title="CONTRACT VALUE" className={styles.kpiCard}>
            <div className={styles.chartPlaceholder} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 120 }}>
              <Statistic
                value={overview?.contracts?.totalContractValue || 0}
                precision={0}
                valueStyle={{ color: '#fff', fontSize: '28px', fontFamily: 'var(--font-monda)' }}
                prefix={<DollarOutlined style={{ color: '#8c8c8c' }} />}
                suffix="ZAR"
              />
              <Text style={{ color: '#8c8c8c', fontSize: '12px', textAlign: 'right' }}>
                Total Active Value
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* Revenue Trend Chart */}
        <Col xs={24} sm={24} lg={24}>
          <Card title="REVENUE TREND" className={styles.kpiCard} style={{ minHeight: 300 }}>
            {chartData && chartData.length > 0 ? (
              <Line
                data={chartData}
                xField="monthName"
                yField="value"
                seriesField="type"
                smooth
                animation={{
                  appear: {
                    animation: 'path-in',
                    duration: 1000,
                  },
                }}
                color={['#52c41a', '#1f1f1f']}
                lineStyle={{
                  lineWidth: 2,
                }}
                point={{
                  size: 3,
                  shape: 'circle',
                }}
                xAxis={{
                  label: {
                    autoHide: true,
                    autoRotate: false,
                    style: {
                      fill: '#8c8c8c',
                    },
                  },
                }}
                yAxis={{
                  label: {
                    formatter: (v: string) => `$${(Number(v) / 1000).toFixed(0)}k`,
                    style: {
                      fill: '#8c8c8c',
                    },
                  },
                  grid: {
                    line: {
                      style: {
                        stroke: '#303030',
                      },
                    },
                  },
                }}
                tooltip={{
                  showMarkers: true,
                }}
              />
            ) : (
              <Empty description="No revenue data available" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Opportunities */}
      <div className={styles.tableSection} style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={4} className={styles.sectionTitle}>Recent Opportunities</Title>
          <Text 
            style={{ color: '#8c8c8c', cursor: 'pointer' }} 
            onClick={() => window.location.href = '/dashboard/opportunities'}
          >
            View All
          </Text>
        </div>
        
        <Table
          className={styles.customTable}
          columns={opportunityColumns}
          dataSource={recentOpportunities}
          rowKey="id"
          pagination={false}
          loading={isPending}
          locale={{ emptyText: <Empty description="No recent opportunities" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
        />
      </div>

      <AIChatComponent
        open={isChatOpen}
        onClose={closeChat}
        context={aiContext}
        title="Dashboard AI Assistant"
        pageTitle="Dashboard Overview"
      />

      <Modal
        title="Invite user to organisation"
        open={inviteOpen}
        onCancel={() => {
          setInviteOpen(false);
          inviteForm.resetFields();
        }}
        okText="Send Invite"
        onOk={() => inviteForm.submit()}
        okButtonProps={{ loading: isSendingInvite }}
      >
        <Form
          form={inviteForm}
          layout="vertical"
          onFinish={onInviteSubmit}
          initialValues={{ role: "SalesRep" }}
        >
          <Form.Item label="Tenant ID">
            <Input value={currentTenantId} disabled />
          </Form.Item>
          <Form.Item
            name="email"
            label="Invitee Email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input placeholder="name@company.com" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Role is required" }]}
          >
            <Select>
              <Select.Option value="SalesRep">Sales Rep</Select.Option>
              <Select.Option value="SalesManager">Sales Manager</Select.Option>
              <Select.Option value="BusinessDevelopmentManager">Business Development Manager</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default withAuth(DashboardOverview);