"use client";

import React, { useReducer, useMemo, useCallback } from 'react';
import { proposalReducer } from './reducer';
import { ProposalStateContext, ProposalActionContext, INITIAL_STATE } from './context';
import { setPending, setProposals, setError, setFilters } from './actions';
import { getAxiosInstance } from '../../utils/axiosInstance';

export { ProposalStateContext, ProposalActionContext };

export const ProposalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(proposalReducer, INITIAL_STATE);

    const getProposals = useCallback(async (filters: any) => {
        dispatch(setPending());
        try {
            const response = await getAxiosInstance().get("/api/proposals", { params: filters });
            dispatch(setProposals(response.data));
        } catch (e) {
            dispatch(setError());
        }
    }, []);

    const actions = useMemo(() => ({
        getProposals,
        
       createProposal: async (values: any) => {
    dispatch(setPending());
    try {
        const cleanedValues = {
            ...values,
            // Format to YYYY-MM-DD to match API docs example exactly
            validUntil: values.validUntil 
                ? new Date(values.validUntil).toISOString().split('T')[0] 
                : null,
            
            lineItems: values.lineItems?.map((item: any) => ({
                productServiceName: item.productServiceName || item.description,
                description: item.description,
                quantity: Number(item.quantity || 0),
                unitPrice: Number(item.unitPrice || 0),
                taxRate: Number(item.taxRate || 0),
                discount: Number(item.discount || 0)
            }))
        };

        await getAxiosInstance().post("/api/proposals", cleanedValues);
        getProposals(state.filters);
    } catch (e) {
        dispatch(setError());
        throw e;
    }
},

        submitProposal: async (id: string) => {
            try {
                await getAxiosInstance().put(`/api/proposals/${id}/submit`);
                getProposals(state.filters);
            } catch (e) { dispatch(setError()); }
        },

        approveProposal: async (id: string) => {
            try {
                await getAxiosInstance().put(`/api/proposals/${id}/approve`);
                getProposals(state.filters);
            } catch (e) { dispatch(setError()); }
        },

        rejectProposal: async (id: string) => {
            try {
                await getAxiosInstance().put(`/api/proposals/${id}/reject`);
                getProposals(state.filters);
            } catch (e) { dispatch(setError()); }
        },

        deleteProposal: async (id: string) => {
            try {
                await getAxiosInstance().delete(`/api/proposals/${id}`);
                getProposals(state.filters);
            } catch (e) { dispatch(setError()); }
        },

        updateFilters: (newFilters: any) => {
            dispatch(setFilters({ filters: newFilters }));
        }
    }), [getProposals, state.filters]);

    return (
        <ProposalStateContext.Provider value={state}>
            <ProposalActionContext.Provider value={actions}>
                {children}
            </ProposalActionContext.Provider>
        </ProposalStateContext.Provider>
    );
};