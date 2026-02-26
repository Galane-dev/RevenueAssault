"use client";

import React, { useReducer, useMemo, useCallback } from 'react';
import { opportunityReducer } from './reducer';
// Import the contexts and the INITIAL_STATE
import { OpportunityStateContext, OpportunityActionContext, INITIAL_STATE } from './context';
import { setPending, setOpportunities, setError, setFilters } from './actions';
import { getAxiosInstance } from '../../utils/axiosInstance';

// EXPORT these so the page can see them
export { OpportunityStateContext, OpportunityActionContext };

export const OpportunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(opportunityReducer, INITIAL_STATE);

    const getOpportunities = useCallback(async (filters: any) => {
        dispatch(setPending());
        try {
            const response = await getAxiosInstance().get("/api/opportunities", { params: filters });
            dispatch(setOpportunities(response.data));
        } catch (e) {
            dispatch(setError());
        }
    }, []);

    const actions = useMemo(() => ({
        getOpportunities,
        
        createOpportunity: async (values: any) => {
            dispatch(setPending());
            try {
                await getAxiosInstance().post("/api/opportunities", values);
                getOpportunities(state.filters);
            } catch (e) {
                dispatch(setError());
                throw e;
            }
        },

        updateStage: async (id: string, stage: number, reason?: string) => {
            dispatch(setPending()); // Set loading while updating
            try {
                await getAxiosInstance().put(`/api/opportunities/${id}/stage`, { stage, reason });
                getOpportunities(state.filters);
            } catch (e) {
                dispatch(setError());
                throw e;
            }
        },

        updateFilters: (newFilters: any) => {
            dispatch(setFilters({ filters: newFilters }));
        }
    }), [getOpportunities, state.filters]);

    return (
        <OpportunityStateContext.Provider value={state}>
            <OpportunityActionContext.Provider value={actions}>
                {children}
            </OpportunityActionContext.Provider>
        </OpportunityStateContext.Provider>
    );
};