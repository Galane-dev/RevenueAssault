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
        
        getMyOpportunities: async () => {
            dispatch(setPending());
            try {
                const response = await getAxiosInstance().get("/api/opportunities/my-opportunities");
                dispatch(setOpportunities(response.data));
            } catch (e) {
                dispatch(setError());
            }
        },

        getPipeline: async (filters: any) => {
            dispatch(setPending());
            try {
                const response = await getAxiosInstance().get("/api/opportunities/pipeline", { params: filters });
                dispatch(setOpportunities(response.data));
            } catch (e) {
                dispatch(setError());
            }
        },

        getStageHistory: async (id: string) => {
            try {
                const response = await getAxiosInstance().get(`/api/opportunities/${id}/stage-history`);
                // This might be stored differently - could return details
                return response.data;
            } catch (e) {
                dispatch(setError());
            }
        },
        
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
            dispatch(setPending()); 
            try {
                // The API expects: { newStage: int, notes: string, lossReason: string }
                const payload = { 
                    stage: Number(stage), 
                    notes: reason || "Stage updated via pipeline",
                    // If stage is 6 (LOST), we send the reason as lossReason, otherwise null
                    lossReason: stage === 6 ? reason : "" 
                };

                console.log("Sending Updated Payload:", payload);

                const response = await getAxiosInstance().put(`/api/opportunities/${id}/stage`, payload);
                
                console.log("Success Status:", response.status);

                // Refresh the list to show the new stage
                await getOpportunities(state.filters);
            } catch (e: any) {
                dispatch(setError());
                if (e.response) {
                    console.error("API Rejected Request:", e.response.data);
                }
                throw e;
            }
        },
        deleteOpportunity: async (id: string) => {
            try {
                await getAxiosInstance().delete(`/api/opportunities/${id}`);
                getOpportunities(state.filters);
            } catch (e) { dispatch(setError()); }
        },
        assignOpportunity: async (id: string, assignedToId: string) => {
            try {
                await getAxiosInstance().post(`/api/opportunities/${id}/assign`, { assignedToId });
                getOpportunities(state.filters);
            } catch (e) { dispatch(setError()); }
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