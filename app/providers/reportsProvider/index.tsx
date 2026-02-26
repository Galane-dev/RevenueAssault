"use client";

import React, { useReducer, useMemo, useCallback } from 'react';
import { reportReducer } from './reducer';
import { ReportStateContext, ReportActionContext, INITIAL_STATE, ReportActionEnums } from './context';
import { getAxiosInstance } from '../../utils/axiosInstance';

export { ReportStateContext, ReportActionContext };

export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reportReducer, INITIAL_STATE);

    const getOpportunityReport = useCallback(async (params: any) => {
        dispatch({ type: ReportActionEnums.SetPending });
        try {
            // Format dates properly for API (YYYY-MM-DD)
            const apiParams: any = {
                ...params,
                startDate: params.startDate ? new Date(params.startDate).toISOString().split('T')[0] : undefined,
                endDate: params.endDate ? new Date(params.endDate).toISOString().split('T')[0] : undefined,
            };
            // Remove undefined values
            Object.keys(apiParams).forEach((key: string) => apiParams[key] === undefined && delete apiParams[key]);
            
            const res = await getAxiosInstance().get("/api/reports/opportunities", { params: apiParams });
            dispatch({ type: ReportActionEnums.SetOpportunityReport, payload: res.data });
        } catch (e) { 
            console.error('Error fetching opportunity report:', e);
            dispatch({ type: ReportActionEnums.SetOpportunityReport, payload: [] });
        }
    }, []);

    const getSalesPeriodReport = useCallback(async (params: any) => {
        dispatch({ type: ReportActionEnums.SetPending });
        try {
            // Format dates properly for API (YYYY-MM-DD)
            const apiParams: any = {
                startDate: params.startDate ? new Date(params.startDate).toISOString().split('T')[0] : undefined,
                endDate: params.endDate ? new Date(params.endDate).toISOString().split('T')[0] : undefined,
                groupBy: params.groupBy || 'month',
            };
            // Remove undefined values
            Object.keys(apiParams).forEach((key: string) => apiParams[key] === undefined && delete apiParams[key]);
            
            const res = await getAxiosInstance().get("/api/reports/sales-by-period", { params: apiParams });
            dispatch({ type: ReportActionEnums.SetSalesPeriodReport, payload: res.data });
        } catch (e) { 
            console.error('Error fetching sales period report:', e);
            dispatch({ type: ReportActionEnums.SetSalesPeriodReport, payload: [] });
        }
    }, []);

    const actions = useMemo(() => ({
        getOpportunityReport,
        getSalesPeriodReport,
        updateFilters: (filters: any) => dispatch({ type: ReportActionEnums.SetFilters, payload: filters })
    }), [getOpportunityReport, getSalesPeriodReport]);

    return (
        <ReportStateContext.Provider value={state}>
            <ReportActionContext.Provider value={actions}>
                {children}
            </ReportActionContext.Provider>
        </ReportStateContext.Provider>
    );
};