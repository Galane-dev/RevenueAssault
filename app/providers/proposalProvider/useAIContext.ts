import { useContext, useMemo } from 'react';
import { ProposalStateContext } from './context';

const STATUS_LABELS: Record<number, string> = {
    1: 'DRAFT',
    2: 'SUBMITTED',
    3: 'REJECTED',
    4: 'APPROVED',
};

export const useAIProposalsContext = () => {
    const { proposals, filters, totalCount } = useContext(ProposalStateContext);

    return useMemo(() => {
        const list = proposals || [];

        return {
            totalProposals: totalCount,
            displayedProposals: list.length,
            proposals: list.map((proposal) => ({
                id: proposal.id,
                title: proposal.title,
                currency: proposal.currency,
                totalAmount: proposal.totalAmount || 0,
                status: STATUS_LABELS[proposal.status] || 'UNKNOWN',
                validUntil: proposal.validUntil,
            })),
            summary: {
                totalValue: list.reduce((sum, proposal) => sum + (proposal.totalAmount || 0), 0),
                draft: list.filter((proposal) => proposal.status === 1).length,
                submitted: list.filter((proposal) => proposal.status === 2).length,
                approved: list.filter((proposal) => proposal.status === 4).length,
            },
            filters: {
                status: filters.status ? STATUS_LABELS[filters.status] : null,
                pageNumber: filters.pageNumber,
            },
        };
    }, [proposals, totalCount, filters]);
};

export default useAIProposalsContext;