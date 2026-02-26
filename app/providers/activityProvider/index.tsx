"use client";

import React, { useReducer, useMemo, useCallback } from 'react';
import { activityReducer } from './reducer';
import { ActivityStateContext, ActivityActionContext, INITIAL_STATE } from './context';
import { setPending, setActivities, setError, setFilters } from './actions';
import { getAxiosInstance } from '../../utils/axiosInstance';

export { ActivityStateContext, ActivityActionContext };

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(activityReducer, INITIAL_STATE);

    const getActivities = useCallback(async (filters: any) => {
        dispatch(setPending());
        try {
            const response = await getAxiosInstance().get("/api/activities", { params: filters });
            dispatch(setActivities(response.data));
        } catch (e) {
            dispatch(setError());
        }
    }, []);

    const actions = useMemo(() => ({
        getActivities,
        getUpcoming: async (daysAhead = 7) => {
            dispatch(setPending());
            try {
                const response = await getAxiosInstance().get("/api/activities/upcoming", { params: { daysAhead } });
                dispatch(setActivities({ items: response.data, totalCount: response.data.length }));
            } catch (e) { dispatch(setError()); }
        },
        getOverdue: async () => {
            dispatch(setPending());
            try {
                const response = await getAxiosInstance().get("/api/activities/overdue");
                dispatch(setActivities({ items: response.data, totalCount: response.data.length }));
            } catch (e) { dispatch(setError()); }
        },
        createActivity: async (values: any) => {
            dispatch(setPending());
            try {
                await getAxiosInstance().post("/api/activities", values);
                getActivities(state.filters);
            } catch (e) {
                dispatch(setError());
                throw e;
            }
        },
        completeActivity: async (id: string, outcome: string) => {
            try {
                await getAxiosInstance().put(`/api/activities/${id}/complete`, { outcome });
                getActivities(state.filters);
            } catch (e) { dispatch(setError()); }
        },
        cancelActivity: async (id: string) => {
            try {
                await getAxiosInstance().put(`/api/activities/${id}/cancel`);
                getActivities(state.filters);
            } catch (e) { dispatch(setError()); }
        },
        updateFilters: (newFilters: any) => {
            dispatch(setFilters({ filters: newFilters }));
        }
    }), [getActivities, state.filters]);

    return (
        <ActivityStateContext.Provider value={state}>
            <ActivityActionContext.Provider value={actions}>
                {children}
            </ActivityActionContext.Provider>
        </ActivityStateContext.Provider>
    );
};