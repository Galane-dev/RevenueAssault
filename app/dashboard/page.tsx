"use client";

import React, { useEffect } from "react";
import { Typography, Row, Col, Card, Table, Statistic, Empty, Spin } from "antd";
import { 
  LineChartOutlined, 
  TeamOutlined, 
  FileDoneOutlined,
  ArrowUpOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import { useStyles } from "./style";
import { useDashboardActions, useDashboardState } from "../providers/dashboardProvider";

const { Title, Text } = Typography;

export default function DashboardOverview() {
  const { styles } = useStyles();
  
  // Subscribe to Global Dashboard State
  const { overview, recentOpportunities, isPending } = useDashboardState();
  const { getDashboardOverview, getRecentOpportunities } = useDashboardActions();

  useEffect(() => {
    // Fetch live data on mount
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
      render: (val: number, record: any) => (
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
      <header className={styles.header}>
        <Title level={2} className={styles.pageTitle}>DASHBOARD OVERVIEW</Title>
      </header>

      <Row gutter={[24, 24]}>
        {/* Metric 1: Pipeline Value */}
        <Col xs={24} sm={12} lg={8}>
          <Card title="PIPELINE VALUE" className={styles.kpiCard}>
            <div className={styles.chartPlaceholder}>
              <Statistic
                value={overview?.opportunities?.pipelineValue || 0}
                precision={2}
                valueStyle={{ color: '#fff', fontSize: '28px', fontFamily: 'var(--font-monda)' }}
                prefix={<LineChartOutlined style={{ color: '#8c8c8c' }} />}
                suffix="ZAR"
              />
              <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                Across {overview?.opportunities?.totalCount || 0} Deals
              </Text>
            </div>
          </Card>
        </Col>

        {/* Metric 2: Win Rate */}
        <Col xs={24} sm={12} lg={8}>
          <Card title="WIN RATE" className={styles.kpiCard}>
            <div className={styles.chartPlaceholder}>
              <Statistic 
                title="Active Opportunities" 
                value={12} 
                styles={{ content: { color: '#3f8600' } }} 
              />
              <Text style={{ color: '#52c41a', fontSize: '12px' }}>
                <ArrowUpOutlined /> {overview?.opportunities?.wonCount || 0} Deals Won
              </Text>
            </div>
          </Card>
        </Col>

        {/* Metric 3: Active Contracts */}
        <Col xs={24} sm={12} lg={8}>
          <Card title="ACTIVE CONTRACTS" className={styles.kpiCard}>
            <div className={styles.chartPlaceholder}>
              <Statistic
                value={overview?.contracts?.totalActiveCount || 0}
                valueStyle={{ color: '#fff', fontSize: '28px', fontFamily: 'var(--font-monda)' }}
                prefix={<FileDoneOutlined style={{ color: '#8c8c8c' }} />}
              />
              <Text style={{ color: overview?.contracts?.expiringThisMonthCount ? '#f5222d' : '#8c8c8c', fontSize: '12px' }}>
                {overview?.contracts?.expiringThisMonthCount || 0} Expiring this month
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      <div className={styles.tableSection}>
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
    </>
  );
}