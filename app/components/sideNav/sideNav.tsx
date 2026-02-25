"use client";

import React, { useState } from "react";
import { Layout, Menu, Typography, Avatar, Space, Button } from "antd";
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
  MenuOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import { useStyles } from "../../dashboard/style";
import { useAuthActions, useAuthState } from "../../providers/authProvider";
import Link from "next/link";


const { Sider } = Layout;
const { Text } = Typography;

export default function SideNav() {
  const { styles } = useStyles();
  const router = useRouter();
  const pathname = usePathname();
  
  // Local state for mobile responsiveness
  const [collapsed, setCollapsed] = useState(false);
  
  const { logout } = useAuthActions();
  const { user } = useAuthState();

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  // Menu items mapped to their respective routes
  const menuItems = [
    { key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "/dashboard/clients", icon: <UserOutlined />, label: "Clients" },
    { key: "/dashboard/opportunities", icon: <RocketOutlined />, label: "Opportunities" },
    { key: "/dashboard/proposals", icon: <FileTextOutlined />, label: "Proposals" },
    { key: "/dashboard/pricing", icon: <DollarOutlined />, label: "Pricing" },
    { key: "/dashboard/activities", icon: <CalendarOutlined />, label: "Activities" },
    { key: "/dashboard/documents", icon: <FolderOpenOutlined />, label: "Documents" },
    { key: "/dashboard/reports", icon: <BarChartOutlined />, label: "Reports" },
  ];

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <Button 
        className={styles.mobileTrigger}
        icon={<MenuOutlined />}
        onClick={() => setCollapsed(!collapsed)}
      />

      <Sider 
        width={280} 
        breakpoint="lg" 
        collapsedWidth="0" 
        trigger={null}
        collapsible 
        collapsed={collapsed}
        onBreakpoint={(broken) => setCollapsed(broken)}
        className={styles.sider}
      >
        <div className={styles.siderFlexContainer}>
          {/* Top Section: Logo & Main Navigation */}
          <div className={styles.topSection}>
            <div className={styles.logo}><Link href="/" className={styles.logo}>
        RevenueAssault
      </Link></div>
            <Menu
              mode="inline"
              selectedKeys={[pathname]} // Automatically highlights current route
              items={menuItems}
              className={styles.menu}
              onClick={({ key }) => {
                router.push(key);
                // On mobile, close the drawer after clicking a link
                if (window.innerWidth <= 992) setCollapsed(true);
              }}
            />
          </div>

          {/* Bottom Section: Settings, Logout & Profile */}
          <div className={styles.bottomSection}>
            <Menu
              mode="inline"
              selectable={false}
              className={styles.menu}
              onClick={({ key }) => {
                if (key === "logout") handleLogout();
                if (key === "settings") router.push("/dashboard/settings");
              }}
              items={[
                { key: "settings", icon: <SettingOutlined />, label: "Settings" },
                { key: "logout", icon: <LogoutOutlined />, label: "Logout" },
              ]}
            />
            
            <div className={styles.accountProfile}>
              <Space size={12}>
                <Avatar 
                  size="large" 
                  style={{ backgroundColor: '#1a1a1a' }}
                  icon={<UserOutlined />} 
                />
                <div className={styles.userInfo}>
                  <Text className={styles.userName}>
                    {user ? `${user.firstName} ${user.lastName}` : "Admin"}
                  </Text>
                  <Text className={styles.userRole}>
                    {user?.roles?.[0] || "Sales Executive"}
                  </Text>
                </div>
              </Space>
            </div>
          </div>
        </div>
      </Sider>

      {/* Mobile Dark Overlay */}
      {!collapsed && (
        <div 
          className={styles.mobileOverlay} 
          onClick={() => setCollapsed(true)} 
        />
      )}
    </>
  );
}