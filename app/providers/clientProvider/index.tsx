"use client";

import React, { useReducer, useMemo, useCallback } from 'react';
import { clientReducer } from './reducer';
import { ClientStateContext, ClientActionContext, INITIAL_STATE } from './context';
import { setPending, setClients, setError, setFilters } from './actions';
import { getAxiosInstance } from '../../utils/axiosInstance';

export { ClientStateContext, ClientActionContext };

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(clientReducer, INITIAL_STATE);

    // Standardized fetcher that uses current filters
    const getClients = useCallback(async (filters: any) => {
        dispatch(setPending());
        try {
            const response = await getAxiosInstance().get("/api/clients", { params: filters });
            dispatch(setClients(response.data));
        } catch (e) {
            dispatch(setError());
        }
    }, []);

    const actions = useMemo(() => ({
        getClients,

        // Fetches a single client by ID
        getClient: async (id: string) => {
            dispatch(setPending());
            try {
                const response = await getAxiosInstance().get(`/api/clients/${id}`);
                dispatch(setClients({ items: [response.data], totalCount: 1 }));
            } catch (e) {
                dispatch(setError());
            }
        },

        // Fetches client statistics
        getClientStats: async (id: string) => {
            dispatch(setPending());
            try {
                const response = await getAxiosInstance().get(`/api/clients/${id}/stats`);
                return response.data;
            } catch (e) {
                dispatch(setError());
            }
        },

        // Updates an existing client
        updateClient: async (client: any) => {
            dispatch(setPending());
            try {
                await getAxiosInstance().put(`/api/clients/${client.id}`, client);
                // Refresh the list using current page/search state
                getClients(state.filters);
            } catch (e) {
                dispatch(setError());
                throw e;
            }
        },

        // Creates a new client
        createClient: async (values: any) => {
            dispatch(setPending());
            try {
                await getAxiosInstance().post("/api/clients", values);
                // Reset to page 1 to show the new entry
                getClients({ ...state.filters, pageNumber: 1 });
            } catch (e) {
                dispatch(setError());
                throw e;
            }
        },

        // Deletes a client
        deleteClient: async (id: string) => {
            try {
                await getAxiosInstance().delete(`/api/clients/${id}`);
                getClients(state.filters);
            } catch (e) { 
                dispatch(setError()); 
            }
        },

        // Updates the filter state (Fixes your search input issue)
        updateFilters: (newFilters: any) => {
            dispatch(setFilters({ filters: newFilters }));
        }
    }), [getClients, state.filters]);

    return (
        <ClientStateContext.Provider value={state}>
            <ClientActionContext.Provider value={actions}>
                {children}
            </ClientActionContext.Provider>
        </ClientStateContext.Provider>
    );
};