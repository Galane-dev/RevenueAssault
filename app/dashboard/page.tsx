"use client";

import React, { useEffect, useState } from "react";
import { Layout, Menu, Typography, Avatar, Space, Row, Col, Card, Table, Button } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  RocketOutlined,
  FileTextOutlined,
  DollarOutlined,
  CalendarOutlined,
  FolderOpenOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined, // New Icon
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useStyles } from "./style";
import { useAuthActions, useAuthState } from "../providers/authProvider";

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function DashboardPage() {
  const { styles } = useStyles();
  const router = useRouter();
  
  // State to control mobile sidebar
  const [collapsed, setCollapsed] = useState(false);
  
  const { logout, getCurrentUser } = useAuthActions();
  const { user } = useAuthState();

  useEffect(() => {
    getCurrentUser();
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  const menuItems = [
    { key: "1", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "2", icon: <UserOutlined />, label: "Clients" },
    { key: "3", icon: <RocketOutlined />, label: "Leads" },
    { key: "4", icon: <FileTextOutlined />, label: "Proposals" },
    { key: "5", icon: <DollarOutlined />, label: "Requests" },
    { key: "6", icon: <CalendarOutlined />, label: "Activities" },
    { key: "7", icon: <FolderOpenOutlined />, label: "Documents" },
    { key: "8", icon: <BarChartOutlined />, label: "Reports" },
  ];

  return (
    <Layout className={styles.layoutWrapper} hasSider>
      {/* Mobile Toggle Button */}
      <Button 
        className={styles.mobileTrigger}
        icon={<MenuOutlined />}
        onClick={() => setCollapsed(!collapsed)}
      />

      <Sider 
        width={280} 
        breakpoint="lg" 
        collapsedWidth="0" 
        trigger={null} // Hide default trigger
        collapsible 
        collapsed={collapsed}
        onBreakpoint={(broken) => {
          // Auto-collapse when switching to mobile view
          setCollapsed(broken);
        }}
        className={styles.sider}
      >
        <div className={styles.siderFlexContainer}>
          <div className={styles.topSection}>
            <div className={styles.logo}>RevenueAssault</div>
            <Menu
              mode="inline"
              defaultSelectedKeys={["1"]}
              items={menuItems}
              className={styles.menu}
            />
          </div>

          <div className={styles.bottomSection}>
            <Menu
              mode="inline"
              selectable={false}
              className={styles.menu}
              onClick={({ key }) => key === "logout" && handleLogout()}
              items={[
                { key: "settings", icon: <SettingOutlined />, label: "Settings" },
                { key: "logout", icon: <LogoutOutlined />, label: "Logout" },
              ]}
            />
            <div className={styles.accountProfile}>
              <Space size={12}>
                <Avatar size="large" icon={<UserOutlined />} />
                <div className={styles.userInfo}>
                  <Text className={styles.userName}>
                    {user ? `${user.firstName} ${user.lastName}` : "Admin"}
                  </Text>
                  <Text className={styles.userRole}>
                    {user?.roles?.[0] || "Sales Rep"}
                  </Text>
                </div>
              </Space>
            </div>
          </div>
        </div>
      </Sider>

      {/* Overlay for mobile to close sidebar when clicking outside */}
      {!collapsed && (
        <div 
          className={styles.mobileOverlay} 
          onClick={() => setCollapsed(true)} 
        />
      )}

      <Layout className={styles.mainLayout}>
        <Content className={styles.content}>
          <header className={styles.header}>
            <Title level={2} className={styles.pageTitle}>KPIs</Title>
          </header>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card title="Pipeline Chart" className={styles.kpiCard}>
                <div className={styles.chartPlaceholder}>
                   {/* Integrate Chart.js or Recharts here later */}
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title="Top Sales Reps" className={styles.kpiCard}>
                <div className={styles.chartPlaceholder} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title="Expiring Contracts" className={styles.kpiCard}>
                <div className={styles.chartPlaceholder} />
              </Card>
            </Col>
          </Row>

          <div className={styles.tableSection}>
            <Title level={4} className={styles.sectionTitle}>Recent Opportunities</Title>
            <Table
              className={styles.customTable}
              dataSource={[]} // Populate from /api/opportunities
              columns={[
                { title: 'CLIENT', dataIndex: 'client', key: 'client' },
                { title: 'STAGE', dataIndex: 'stage', key: 'stage' },
                { title: 'VALUE', dataIndex: 'value', key: 'value' },
                { title: 'ASSIGNED TO', dataIndex: 'user', key: 'user' },
              ]}
              pagination={false}
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}