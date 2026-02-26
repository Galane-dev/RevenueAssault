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
            const res = await getAxiosInstance().get("/api/reports/opportunities", { params });
            dispatch({ type: ReportActionEnums.SetOpportunityReport, payload: res.data });
        } catch (e) { console.error(e); }
    }, []);

    const getSalesPeriodReport = useCallback(async (params: any) => {
        dispatch({ type: ReportActionEnums.SetPending });
        try {
            const res = await getAxiosInstance().get("/api/reports/sales-by-period", { params });
            dispatch({ type: ReportActionEnums.SetSalesPeriodReport, payload: res.data });
        } catch (e) { console.error(e); }
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