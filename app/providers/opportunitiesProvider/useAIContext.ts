import { useContext, useMemo } from 'react';
import { OpportunityStateContext } from './context';

const STAGES: Record<number, string> = {
    1: "LEAD",
    2: "QUALIFICATION",
    3: "PROPOSAL",
    4: "NEGOTIATION",
    5: "WON",
    6: "LOST",
};

export const useAIOpportunitiesContext = () => {
    const { opportunities, filters, totalCount } = useContext(OpportunityStateContext);

    return useMemo(() => {
        if (!opportunities) {
            return {
                totalOpportunities: 0,
                displayedOpportunities: 0,
                opportunities: [],
                summary: {
                    totalPipelineValue: 0,
                    byStage: [],
                },
            };
        }

        const oppsData = opportunities || [];

        return {
            totalOpportunities: totalCount,
            displayedOpportunities: oppsData.length,
            opportunities: oppsData.map(opp => ({
                id: opp.id,
                title: opp.title,
                stage: STAGES[Number(opp.stage)] || 'UNKNOWN',
                estimatedValue: opp.estimatedValue,
                currency: opp.currency,
                expectedCloseDate: opp.expectedCloseDate,
            })),
            filters: {
                searchTerm: filters.searchTerm,
                stage: filters.stage ? STAGES[filters.stage] : null,
                pageNumber: filters.pageNumber,
            },
            summary: {
                totalPipelineValue: oppsData.reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0),
                byStage: Object.entries(STAGES).map(([stageNum, stageLabel]) => ({
                    stage: stageLabel,
                    count: oppsData.filter(opp => Number(opp.stage) === Number(stageNum)).length,
                    totalValue: oppsData
                        .filter(opp => Number(opp.stage) === Number(stageNum))
                        .reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0),
                })),
            },
        };
    }, [opportunities, totalCount, filters]);
};

export default useAIOpportunitiesContext;
