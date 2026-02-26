import { createAction } from "redux-actions";
import { IActivityStateContext, IActivity } from "./context";

export enum ActivityActionEnums {
    SetPending = "SET_PENDING",
    SetActivities = "SET_ACTIVITIES",
    SetFilters = "SET_FILTERS",
    SetError = "SET_ERROR",
}

export const setPending = createAction<Partial<IActivityStateContext>>(
    ActivityActionEnums.SetPending, () => ({ isPending: true, isError: false })
);

export const setActivities = createAction<Partial<IActivityStateContext>, { items: IActivity[], totalCount: number }>(
    ActivityActionEnums.SetActivities, 
    ({ items, totalCount }) => ({ activities: items, totalCount, isPending: false })
);

export const setFilters = createAction<Partial<IActivityStateContext>, { filters: any }>(
    ActivityActionEnums.SetFilters,
    (payload) => ({ filters: payload.filters })
);

export const setError = createAction<Partial<IActivityStateContext>>(
    ActivityActionEnums.SetError, () => ({ isError: true, isPending: false })
);