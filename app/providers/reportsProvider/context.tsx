import { createContext } from 'react';

export enum ReportActionEnums {
    SetPending = "SET_PENDING",
    SetOpportunityReport = "SET_OPP_REPORT",
    SetSalesPeriodReport = "SET_SALES_REPORT",
    SetFilters = "SET_FILTERS",
}

export interface IOpportunityReport {
    id: string;
    name: string;
    amount: number;
    stage: string;
    ownerName: string;
    closeDate: string;
}

export interface ISalesPeriodReport {
    period: string; 
    revenue: number;
    count: number;
}

export interface IReportStateContext {
    isPending: boolean;
    opportunityReport: IOpportunityReport[];
    salesPeriodReport: ISalesPeriodReport[];
    filters: {
        startDate?: string;
        endDate?: string;
        stage?: string;
        ownerId?: string;
        groupBy: 'month' | 'week';
    };
}

export interface IReportActionContext {
    getOpportunityReport: (params: any) => Promise<void>;
    getSalesPeriodReport: (params: any) => Promise<void>;
    updateFilters: (filters: Partial<IReportStateContext['filters']>) => void;
}

export const INITIAL_STATE: IReportStateContext = {
    isPending: false,
    opportunityReport: [],
    salesPeriodReport: [],
    filters: {
        groupBy: 'month',
        // Default to last 90 days
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
    }
};

export const ReportStateContext = createContext<IReportStateContext>(INITIAL_STATE);
export const ReportActionContext = createContext<IReportActionContext | undefined>(undefined);