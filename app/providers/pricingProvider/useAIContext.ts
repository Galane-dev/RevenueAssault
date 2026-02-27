import { useContext, useMemo } from 'react';
import { PricingStateContext, PricingPriority, PricingRequestStatus } from './context';

export const useAIPricingContext = () => {
    const { requests, filters, totalCount } = useContext(PricingStateContext);

    return useMemo(() => {
        const list = requests || [];

        return {
            totalRequests: totalCount,
            displayedRequests: list.length,
            requests: list.map((request) => ({
                id: request.id,
                title: request.title,
                clientName: request.clientName,
                priority: PricingPriority[request.priority],
                status: PricingRequestStatus[request.status],
                requiredByDate: request.requiredByDate,
            })),
            summary: {
                pending: list.filter((request) => request.status === PricingRequestStatus.Pending).length,
                inProgress: list.filter((request) => request.status === PricingRequestStatus.InProgress).length,
                completed: list.filter((request) => request.status === PricingRequestStatus.Completed).length,
                urgent: list.filter((request) => request.priority === PricingPriority.Urgent).length,
            },
            filters: {
                status: filters.status !== undefined ? PricingRequestStatus[filters.status] : null,
                priority: filters.priority !== undefined ? PricingPriority[filters.priority] : null,
                pageNumber: filters.pageNumber,
            },
        };
    }, [requests, totalCount, filters]);
};

export default useAIPricingContext;