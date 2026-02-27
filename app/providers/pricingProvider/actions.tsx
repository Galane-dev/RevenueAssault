import { createAction } from "redux-actions";
import { IPricingStateContext, IPricingRequest } from "./context";

export enum PricingActionEnums {
    SetPending = "SET_PENDING",
    SetRequests = "SET_REQUESTS",
    SetFilters = "SET_FILTERS",
    SetError = "SET_ERROR",
}

export const setPending = createAction<Partial<IPricingStateContext>>(
    PricingActionEnums.SetPending, () => ({ isPending: true, isError: false })
);

export const setRequests = createAction<Partial<IPricingStateContext>, { items: IPricingRequest[], totalCount: number }>(
    PricingActionEnums.SetRequests, 
    ({ items, totalCount }) => ({ requests: items, totalCount, isPending: false })
);

export const setFilters = createAction<Partial<IPricingStateContext>, { filters: any }>(
    PricingActionEnums.SetFilters,
    (payload) => ({ filters: payload.filters })
);

export const setError = createAction<Partial<IPricingStateContext>>(
    PricingActionEnums.SetError, () => ({ isError: true, isPending: false })
);