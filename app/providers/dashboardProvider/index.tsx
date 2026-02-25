"use client";

import React, { useReducer, useContext, useMemo } from 'react';
import { dashboardReducer } from './reducer';
import { DashboardStateContext, DashboardActionContext } from './context';
import { setPending, setOverview, setRecentOpportunities, setError } from './actions';
import { getAxiosInstance } from '../../utils/axiosInstance';

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, {
    overview: null,
    recentOpportunities: [],
    isPending: false,
    isError: false,
  });

  const actions = useMemo(() => ({
    getDashboardOverview: async () => {
      dispatch(setPending());
      try {
        const response = await getAxiosInstance().get("/api/dashboard/overview");
        dispatch(setOverview(response.data));
      } catch (e) {
        dispatch(setError());
      }
    },
    getRecentOpportunities: async () => {
      try {
        const response = await getAxiosInstance().get("/api/opportunities?pageSize=5");
        dispatch(setRecentOpportunities(response.data.items));
      } catch (e) {
        console.error("Failed to fetch opportunities", e);
      }
    }
  }), [dispatch]);

  return (
    <DashboardStateContext.Provider value={state}>
      <DashboardActionContext.Provider value={actions}>
        {children}
      </DashboardActionContext.Provider>
    </DashboardStateContext.Provider>
  );
};

// Custom Hooks for easy consumption
export const useDashboardState = () => useContext(DashboardStateContext);
export const useDashboardActions = () => useContext(DashboardActionContext);