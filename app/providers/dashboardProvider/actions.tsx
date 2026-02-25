import { createAction } from "redux-actions";
import { IDashboardState, IDashboardOverview } from "./context";

export enum DashboardActionEnums {
  SetPending = "SET_PENDING",
  SetOverview = "SET_OVERVIEW",
  SetRecentOpportunities = "SET_RECENT_OPPORTUNITIES",
  SetError = "SET_ERROR",
}

// We use Partial<IDashboardState> so we don't have to provide every property in every action
export const setPending = createAction<Partial<IDashboardState>>(
  DashboardActionEnums.SetPending, 
  () => ({ isPending: true, isError: false })
);

export const setOverview = createAction<Partial<IDashboardState>, IDashboardOverview>(
  DashboardActionEnums.SetOverview, 
  (overview) => ({ overview, isPending: false })
);

export const setRecentOpportunities = createAction<Partial<IDashboardState>, any[]>(
  DashboardActionEnums.SetRecentOpportunities, 
  (recentOpportunities) => ({ recentOpportunities, isPending: false })
);

export const setError = createAction<Partial<IDashboardState>>(
  DashboardActionEnums.SetError, 
  () => ({ isPending: false, isError: true })
);