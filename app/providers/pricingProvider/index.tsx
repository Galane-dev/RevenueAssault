"use client";

import React, { useReducer, useMemo, useCallback } from 'react';
import { pricingReducer } from './reducer';
import { PricingStateContext, PricingActionContext, INITIAL_STATE } from './context';
import { setPending, setRequests, setError, setFilters } from './actions';
import { getAxiosInstance } from '../../utils/axiosInstance';

export { PricingStateContext, PricingActionContext };

export const PricingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(pricingReducer, INITIAL_STATE);

    const getRequests = useCallback(async (filters: any) => {
        dispatch(setPending());
        try {
            const response = await getAxiosInstance().get("/api/pricingrequests", { params: filters });
            // Matches { items: [], totalCount: 0 } pattern
            dispatch(setRequests(response.data));
        } catch (e) {
            dispatch(setError());
        }
    }, []);

    const actions = useMemo(() => ({
        getRequests,
        createRequest: async (values: any) => {
            dispatch(setPending());
            try {
                await getAxiosInstance().post("/api/pricingrequests", values);
                getRequests(state.filters);
            } catch (e) {
                dispatch(setError());
                throw e;
            }
        },
        assignRequest: async (id: string, userId: string) => {
            try {
                await getAxiosInstance().post(`/api/pricingrequests/${id}/assign`, { userId });
                getRequests(state.filters);
            } catch (e) {
                dispatch(setError());
            }
        },
        completeRequest: async (id: string) => {
            try {
                await getAxiosInstance().put(`/api/pricingrequests/${id}/complete`);
                getRequests(state.filters);
            } catch (e) {
                dispatch(setError());
            }
        },
        updateFilters: (newFilters: any) => {
            dispatch(setFilters({ filters: newFilters }));
        }
    }), [getRequests, state.filters]);

    return (
        <PricingStateContext.Provider value={state}>
            <PricingActionContext.Provider value={actions}>
                {children}
            </PricingActionContext.Provider>
        </PricingStateContext.Provider>
    );
};