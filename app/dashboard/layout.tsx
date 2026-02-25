"use client";

import { Layout } from "antd";
import SideNav from "../components/sideNav/sideNav";
import { useStyles } from "./style";
import { DashboardProvider } from "../providers/dashboardProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { styles } = useStyles();

  return (
    <Layout className={styles.layoutWrapper} hasSider>
    <DashboardProvider>
        <SideNav />
        <Layout className={styles.mainLayout}>
            <main className={styles.content}>
            {children}
            </main>
        </Layout>
    </DashboardProvider>
      
    </Layout>
  );
}