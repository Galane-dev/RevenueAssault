import { useContext, useMemo } from 'react';
import { ClientStateContext } from './context';

export const useAIClientsContext = () => {
    const { clients, filters, totalCount } = useContext(ClientStateContext);

    return useMemo(() => {
        if (!clients) {
            return {
                totalClients: 0,
                displayedClients: 0,
                clients: [],
                filters: {
                    searchTerm: '',
                    pageNumber: 1,
                },
            };
        }

        return {
            totalClients: totalCount,
            displayedClients: clients.length,
            clients: clients.map(client => ({
                id: client.id,
                name: client.name,
                industry: client.industry,
            })),
            filters: {
                searchTerm: filters.searchTerm,
                pageNumber: filters.pageNumber,
            },
        };
    }, [clients, totalCount, filters]);
};

export default useAIClientsContext;
