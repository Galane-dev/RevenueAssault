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
                await getAxiosInstance().post("/api/proposals", values);
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