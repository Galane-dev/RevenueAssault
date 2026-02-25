import { handleActions } from "redux-actions";
import { IDashboardState } from "./context";
import { DashboardActionEnums } from "./actions";

export const dashboardReducer = handleActions<IDashboardState, any>(
  {
    [DashboardActionEnums.SetPending]: (state) => ({ ...state, isPending: true, isError: false }),
    [DashboardActionEnums.SetOverview]: (state, action) => ({ 
      ...state, 
      overview: action.payload.overview, 
      isPending: false 
    }),
    [DashboardActionEnums.SetRecentOpportunities]: (state, action) => ({ 
      ...state, 
      recentOpportunities: action.payload.recentOpportunities, 
      isPending: false 
    }),
    [DashboardActionEnums.SetError]: (state) => ({ ...state, isPending: false, isError: true }),
  },
  { overview: null, recentOpportunities: [], isPending: false, isError: false }
);