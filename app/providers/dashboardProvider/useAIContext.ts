import { useMemo } from 'react';
import { useDashboardState } from './index';

export const useAIDashboardContext = () => {
    const { overview, recentOpportunities } = useDashboardState();

    return useMemo(() => {
        if (!overview) {
            return {
                dashboardMetrics: {
                    winRate: 0,
                    pipelineValue: 0,
                    activeContracts: 0,
                    contractValue: 0,
                },
                recentOpportunities: [],
                summary: {
                    completedToday: 0,
                    upcoming: 0,
                    overdue: 0,
                },
            };
        }

        return {
            dashboardMetrics: {
                winRate: overview?.opportunities?.winRate || 0,
                pipelineValue: overview?.opportunities?.pipelineValue || 0,
                activeContracts: overview?.contracts?.totalActiveCount || 0,
                contractValue: overview?.contracts?.totalContractValue || 0,
            },
            recentOpportunities: (recentOpportunities || []).map(opp => ({
                id: opp.id,
                title: opp.title,
                clientName: opp.clientName,
                estimatedValue: opp.estimatedValue,
                stage: opp.stage,
            })),
            summary: {
                completedToday: overview?.activities?.completedTodayCount || 0,
                upcoming: overview?.activities?.upcomingCount || 0,
                overdue: overview?.activities?.overdueCount || 0,
            },
        };
    }, [overview, recentOpportunities]);
};

export default useAIDashboardContext;
