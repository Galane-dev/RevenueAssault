import { ReportActionEnums, IReportStateContext } from "./context";

export const reportReducer = (state: IReportStateContext, action: any): IReportStateContext => {
    switch (action.type) {
        case ReportActionEnums.SetPending:
            return { ...state, isPending: true };
        case ReportActionEnums.SetOpportunityReport:
            return { ...state, opportunityReport: action.payload, isPending: false };
        case ReportActionEnums.SetSalesPeriodReport:
            return { ...state, salesPeriodReport: action.payload, isPending: false };
        case ReportActionEnums.SetFilters:
            return { ...state, filters: { ...state.filters, ...action.payload } };
        default:
            return state;
    }
};