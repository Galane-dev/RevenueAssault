import { useContext, useMemo } from 'react';
import { ReportStateContext } from './context';

export const useAIReportsContext = () => {
    const { opportunityReport, salesPeriodReport, filters } = useContext(ReportStateContext);

    return useMemo(() => {
        const opportunities = opportunityReport || [];
        const periods = salesPeriodReport || [];

        return {
            totalOpportunitiesInReport: opportunities.length,
            totalRevenue: periods.reduce((sum, item) => sum + (item.revenue || 0), 0),
            totalDeals: periods.reduce((sum, item) => sum + (item.count || 0), 0),
            opportunities: opportunities.map((item) => ({
                id: item.id,
                name: item.name,
                amount: item.amount,
                stage: item.stage,
                ownerName: item.ownerName,
                closeDate: item.closeDate,
            })),
            salesPeriods: periods.map((item) => ({
                period: item.period,
                revenue: item.revenue,
                count: item.count,
            })),
            filters: {
                startDate: filters.startDate,
                endDate: filters.endDate,
                stage: filters.stage || null,
                groupBy: filters.groupBy,
            },
        };
    }, [opportunityReport, salesPeriodReport, filters]);
};

export default useAIReportsContext;