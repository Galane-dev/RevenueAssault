import { useContext, useMemo } from 'react';
import { ContactStateContext } from './context';

export const useAIContactsContext = () => {
    const { contacts, filters, totalCount } = useContext(ContactStateContext);

    return useMemo(() => {
        if (!contacts) {
            return {
                totalContacts: 0,
                displayedContacts: 0,
                contacts: [],
                filters: {
                    searchTerm: '',
                    pageNumber: 1,
                },
            };
        }

        return {
            totalContacts: totalCount,
            displayedContacts: contacts.length,
            contacts: contacts.map(contact => ({
                id: contact.id,
                clientId: contact.clientId,
            })),
            filters: {
                searchTerm: filters.searchTerm,
                pageNumber: filters.pageNumber,
            },
        };
    }, [contacts, totalCount, filters]);
};

export default useAIContactsContext;
