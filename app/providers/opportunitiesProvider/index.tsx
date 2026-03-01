"use client";

import React, { useReducer, useMemo, useCallback } from 'react';
import { opportunityReducer } from './reducer';
import { OpportunityStateContext, OpportunityActionContext, INITIAL_STATE } from './context';
import { setPending, setOpportunities, setError, setFilters } from './actions';
import { getAxiosInstance } from '../../utils/axiosInstance';
import { message } from 'antd';

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
                return response.data;
            } catch (e) {
                dispatch(setError());
            }
        },
        
        createOpportunity: async (values: any) => {
            dispatch(setPending());
            try {
                await getAxiosInstance().post("/api/opportunities", values);
                await getOpportunities(state.filters);
            } catch (e) {
                dispatch(setError());
                throw e;
            }
        },

        updateStage: async (id: string, stage: number, reason?: string) => {
            dispatch(setPending()); 
            try {
                const payload = { 
                    stage: Number(stage), 
                    notes: reason || "Stage updated via pipeline",
                    lossReason: stage === 6 ? reason : null 
                };

                await getAxiosInstance().put(`/api/opportunities/${id}/stage`, payload);
                await getOpportunities(state.filters);
            } catch (e: any) {
                dispatch(setError());
                throw e;
            }
        },

        deleteOpportunity: async (id: string) => {
            try {
                await getAxiosInstance().delete(`/api/opportunities/${id}`);
                await getOpportunities(state.filters);
            } catch (e) { 
                dispatch(setError()); 
            }
        },

        /**
         * Matches API Doc: POST /api/opportunities/{id}/assign
         * Payload: { "userId": "..." }
         */
        assignOpportunity: async (id: string, userId: string) => {
            dispatch(setPending());
            try {
                await getAxiosInstance().post(`/api/opportunities/${id}/assign`, { 
                    userId: userId 
                });
                
                // Refresh the local list so the new owner name is reflected
                await getOpportunities(state.filters);
                message.success("Representative assigned successfully");
            } catch (e) { 
                dispatch(setError()); 
                message.error("Failed to assign representative");
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