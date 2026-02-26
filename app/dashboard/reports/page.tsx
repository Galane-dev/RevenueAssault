"use client";

import React, { useEffect, useContext } from "react";
import { 
    Tag,Card, Row, Col, Statistic, Table, 
    DatePicker, Select, Space, Typography, Skeleton, Empty, Result
} from "antd";
import { 
    ArrowUpOutlined, 
    DollarOutlined, 
    BarChartOutlined, 
    RiseOutlined,
    LockOutlined
} from "@ant-design/icons";
import { Column } from "@ant-design/plots";
import { useStyles } from "../style";
import dayjs from "dayjs";

// Providers
import { ReportProvider, ReportStateContext, ReportActionContext } from "../../providers/reportsProvider";
import { IReportStateContext, IReportActionContext } from "@/app/providers/reportsProvider/context";

// Components
import { Can } from "../../components/auth/can";
import { withAuth } from "../../hoc/withAuth";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

function SalesDashboardContent() {
    const { styles } = useStyles();
    
    // Explicit Type Assertion to resolve 'unknown' error
    const { 
        opportunityReport, 
        salesPeriodReport, 
        filters, 
        isPending 
    } = useContext(ReportStateContext) as IReportStateContext;
    
    const reportActions = useContext(ReportActionContext) as IReportActionContext;

    useEffect(() => {
        // Fetch data whenever filters change
        reportActions?.getOpportunityReport(filters);
        reportActions?.getSalesPeriodReport(filters);
    }, [filters, reportActions]);

    // Derived Statistics
    const totalRevenue = salesPeriodReport?.reduce((sum, item) => sum + item.revenue, 0) || 0;
    const totalDeals = salesPeriodReport?.reduce((sum, item) => sum + item.count, 0) || 0;

    /**
     * Chart Configuration for @ant-design/plots
     */
    const chartConfig = {
        data: salesPeriodReport || [],
        xField: 'period',
        yField: 'revenue',
        seriesField: '',
        color: '#1890ff',
        label: {
            position: 'middle',
            style: {
                fill: '#FFFFFF',
                opacity: 0.6,
            },
        },
        xAxis: {
            label: {
                autoHide: true,
                autoRotate: false,
                style: { fill: '#8c8c8c' }
            },
        },
        yAxis: {
            label: {
                formatter: (v: string) => `$${(Number(v) / 1000).toFixed(0)}k`,
                style: { fill: '#8c8c8c' }
            },
            grid: {
                line: { style: { stroke: '#303030' } }
            }
        },
        tooltip: {
            showMarkers: false,
        },
        theme: 'dark', // Native dark theme support
    };

    const columns = [
        { 
            title: 'OPPORTUNITY', 
            dataIndex: 'name', 
            key: 'name', 
            render: (text: string) => <Text strong style={{color: '#fff'}}>{text}</Text> 
        },
        { 
            title: 'STAGE', 
            dataIndex: 'stage', 
            key: 'stage',
            render: (stage: string) => <Tag color="blue">{stage}</Tag>
        },
        { 
            title: 'AMOUNT', 
            dataIndex: 'amount', 
            key: 'amount', 
            align: 'right' as const,
            render: (val: number | null | undefined) => (
                <Text style={{ color: '#52c41a', fontWeight: 600 }}>
                    {/* If val is null/undefined, show $0.00, otherwise format it */}
                    ${(val ?? 0).toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                    })}
                </Text>
            )
        },
    ];

    return (
        <div style={{ padding: '0 24px' }}>
            {/* Header Section */}
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <Text style={{ color: '#595959', letterSpacing: '2px', fontSize: '10px', fontWeight: 700 }}>
                        MANAGEMENT DASHBOARD
                    </Text>
                    <Title level={2} style={{ margin: 0, marginTop: 4, color: '#fff' }}>
                        SALES ANALYTICS
                    </Title>
                </div>
                
                <Space size="middle">
                    <RangePicker 
                        onChange={(dates) => {
                            reportActions?.updateFilters({ 
                                startDate: dates ? dates[0]?.toISOString() : undefined, 
                                endDate: dates ? dates[1]?.toISOString() : undefined 
                            });
                        }}
                        style={{ background: '#141414', borderColor: '#303030' }}
                    />
                    <Select 
                        value={filters.groupBy} 
                        onChange={(val) => reportActions?.updateFilters({ groupBy: val })}
                        options={[
                            { value: 'week', label: 'By Week' }, 
                            { value: 'month', label: 'By Month' }
                        ]}
                        style={{ width: 130 }}
                    />
                </Space>
            </div>

            {/* KPI Overview */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card style={{ background: '#141414', border: '1px solid #303030' }}>
                        <Statistic
                            title={<Text type="secondary">Total Revenue</Text>}
                            value={totalRevenue}
                            precision={2}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<DollarOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card style={{ background: '#141414', border: '1px solid #303030' }}>
                        <Statistic
                            title={<Text type="secondary">Total Deals</Text>}
                            value={totalDeals}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<RiseOutlined />} // Updated here
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card style={{ background: '#141414', border: '1px solid #303030' }}>
                        <Statistic
                            title={<Text type="secondary">Avg Deal Size</Text>}
                            value={totalDeals > 0 ? totalRevenue / totalDeals : 0}
                            precision={2}
                            valueStyle={{ color: '#faad14' }}
                            prefix={<BarChartOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card style={{ background: '#141414', border: '1px solid #303030' }}>
                        <Statistic
                            title={<Text type="secondary">Active Pipeline</Text>}
                            value={opportunityReport.length}
                            valueStyle={{ color: '#fff' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={24}>
                {/* Revenue Trend Chart */}
                <Col span={16}>
                    <Card 
                        title={<span style={{color: '#d9d9d9'}}>Revenue Growth</span>} 
                        style={{ background: '#141414', border: '1px solid #303030', minHeight: '450px' }}
                    >
                        {isPending ? (
                            <Skeleton active paragraph={{ rows: 8 }} />
                        ) : salesPeriodReport.length > 0 ? (
                            <Column {...chartConfig} />
                        ) : (
                            <div style={{ padding: '100px 0', textAlign: 'center' }}>
                                <Text type="secondary">No revenue data for this period</Text>
                            </div>
                        )}
                    </Card>
                </Col>

                {/* Top Opportunities Table */}
                <Col span={8}>
                    <Card 
                        title={<span style={{color: '#d9d9d9'}}>High Value Deals</span>} 
                        style={{ background: '#141414', border: '1px solid #303030' }}
                    >
                        <Table 
                            dataSource={opportunityReport} 
                            columns={columns} 
                            pagination={{ pageSize: 6 }} 
                            size="small" 
                            loading={isPending}
                            rowKey="id"
                            className={styles.customTable}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

// Ensure proper wrapping with Provider
export default withAuth(function SalesDashboardPage() {
    return (
        <Can 
            perform="VIEW_REPORTS"
            fallback={
                <div style={{ padding: '0 24px', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Result
                        status="403"
                        icon={<LockOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />}
                        title="Access Restricted"
                        subTitle="This feature is only available to Admins and Sales Managers"
                    />
                </div>
            }
        >
            <ReportProvider>
                <SalesDashboardContent />
            </ReportProvider>
        </Can>
    );
});