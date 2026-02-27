import { useContext, useMemo } from 'react';
import { ContractStateContext } from './context';

const STATUS_LABELS: Record<number, string> = {
    1: 'DRAFT',
    2: 'ACTIVE',
    3: 'EXPIRED',
    4: 'CANCELLED',
};

export const useAIContractsContext = () => {
    const { contracts, filters, totalCount } = useContext(ContractStateContext);

    return useMemo(() => {
        const list = contracts || [];

        return {
            totalContracts: totalCount || 0,
            displayedContracts: list.length,
            contracts: list.map((contract: any) => ({
                id: contract.id,
                title: contract.title,
                clientName: contract.clientName,
                value: contract.contractValue ?? contract.value ?? 0,
                currency: contract.currency,
                status: STATUS_LABELS[Number(contract.status)] || 'UNKNOWN',
                startDate: contract.startDate,
                endDate: contract.endDate,
            })),
            summary: {
                active: list.filter((contract: any) => Number(contract.status) === 2).length,
                draft: list.filter((contract: any) => Number(contract.status) === 1).length,
                expiringSoon: list.filter((contract: any) => {
                    if (Number(contract.status) !== 2 || !contract.endDate) return false;
                    const now = new Date();
                    const end = new Date(contract.endDate);
                    const daysUntilExpiry = Math.ceil(
                        (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
                }).length,
            },
            filters: {
                searchTerm: filters.searchTerm,
                status: filters.status ? STATUS_LABELS[filters.status] : null,
                pageNumber: filters.pageNumber,
            },
        };
    }, [contracts, totalCount, filters]);
};

export default useAIContractsContext;