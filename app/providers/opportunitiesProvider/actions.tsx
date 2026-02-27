import { createAction } from "redux-actions";
import { IOpportunityStateContext, IOpportunity } from "./context";

export enum OpportunityActionEnums {
    SetPending = "SET_PENDING",
    SetOpportunities = "SET_OPPORTUNITIES",
    SetFilters = "SET_FILTERS",
    SetError = "SET_ERROR",
}

export const setPending = createAction<Partial<IOpportunityStateContext>>(OpportunityActionEnums.SetPending, () => ({ isPending: true }));
export const setError = createAction<Partial<IOpportunityStateContext>>(OpportunityActionEnums.SetError, () => ({ isError: true, isPending: false }));

export const setOpportunities = createAction<Partial<IOpportunityStateContext>, { items: IOpportunity[], totalCount: number }>(
    OpportunityActionEnums.SetOpportunities,
    ({ items, totalCount }) => ({ opportunities: items, totalCount, isPending: false, isSuccess: true })
);

export const setFilters = createAction<Partial<IOpportunityStateContext>, { filters: any }>(
    OpportunityActionEnums.SetFilters,
    (payload) => ({ filters: payload.filters })
);
