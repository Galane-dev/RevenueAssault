"use client";

import React, { useReducer, useMemo, useCallback } from 'react';
import { contractReducer } from './reducer';
import { ContractStateContext, ContractActionContext, INITIAL_STATE } from './context';
import { setPending, setContracts, setError, setFilters } from './actions';
import { getAxiosInstance } from '../../utils/axiosInstance';

export { ContractStateContext, ContractActionContext };

export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(contractReducer, INITIAL_STATE);

    // Standardized fetcher that uses current filters
    const getContracts = useCallback(async (filters: any) => {
        dispatch(setPending());
        try {
            const response = await getAxiosInstance().get("/api/contracts", { params: filters });
            dispatch(setContracts(response.data));
        } catch (e) {
            dispatch(setError());
        }
    }, []);

    const actions = useMemo(() => ({
        getContracts,

        // Fetches a single contract by ID
        getContract: async (id: string) => {
            dispatch(setPending());
            try {
                const response = await getAxiosInstance().get(`/api/contracts/${id}`);
                dispatch(setContracts({ items: [response.data], totalCount: 1 }));
            } catch (e) {
                dispatch(setError());
            }
        },

        // Fetches expiring contracts
        getExpiringContracts: async () => {
            dispatch(setPending());
            try {
                const response = await getAxiosInstance().get("/api/contracts/expiring");
                dispatch(setContracts(response.data));
            } catch (e) {
                dispatch(setError());
            }
        },

        // Creates a new contract
        createContract: async (values: any) => {
            dispatch(setPending());
            try {
                await getAxiosInstance().post("/api/contracts", values);
                getContracts({ ...state.filters, pageNumber: 1 });
            } catch (e) {
                dispatch(setError());
                throw e;
            }
        },

        // Updates an existing contract
        updateContract: async (contract: any) => {
            dispatch(setPending());
            try {
                await getAxiosInstance().put(`/api/contracts/${contract.id}`, contract);
                getContracts(state.filters);
            } catch (e) {
                dispatch(setError());
                throw e;
            }
        },

        // Deletes a contract
        deleteContract: async (id: string) => {
            try {
                await getAxiosInstance().delete(`/api/contracts/${id}`);
                getContracts(state.filters);
            } catch (e) {
                dispatch(setError());
            }
        },

        // Activates a contract
        activateContract: async (id: string) => {
            try {
                await getAxiosInstance().put(`/api/contracts/${id}/activate`);
                getContracts(state.filters);
            } catch (e) {
                dispatch(setError());
            }
        },

        // Cancels a contract
        cancelContract: async (id: string) => {
            try {
                await getAxiosInstance().put(`/api/contracts/${id}/cancel`);
                getContracts(state.filters);
            } catch (e) {
                dispatch(setError());
            }
        },

        // Renews a contract
        // Renews a contract by updating its end date
renewContract: async (id: string, newEndDate: string) => {
    dispatch(setPending());
    try {
        // 1. Fetch the current contract to get all its existing data
        const response = await getAxiosInstance().get(`/api/contracts/${id}`);
        const currentContract = response.data;

        // 2. Update the end date while keeping other fields intact
        const updatedContract = {
            ...currentContract,
            endDate: newEndDate,
            // You might want to flip autoRenew or update terms here if needed
        };

        // 3. Use the standard PUT endpoint to save the changes
        await getAxiosInstance().put(`/api/contracts/${id}`, updatedContract);
        
        // 4. Refresh the list
        getContracts(state.filters);
    } catch (e) {
        dispatch(setError());
        throw e;
    }
},

        // Updates the filter state
        updateFilters: (newFilters: any) => {
            dispatch(setFilters({ filters: newFilters }));
        }
    }), [getContracts, state.filters]);

    return (
        <ContractStateContext.Provider value={state}>
            <ContractActionContext.Provider value={actions}>
                {children}
            </ContractActionContext.Provider>
        </ContractStateContext.Provider>
    );
};
