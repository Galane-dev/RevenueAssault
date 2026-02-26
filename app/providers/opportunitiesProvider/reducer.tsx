import { handleActions, Action } from "redux-actions";
import { IOpportunityStateContext, INITIAL_STATE } from "./context";
import { OpportunityActionEnums } from "./actions";

export const opportunityReducer = handleActions<IOpportunityStateContext, any>(
    {
        [OpportunityActionEnums.SetPending]: (state) => ({ ...state, isPending: true, isError: false }),
        [OpportunityActionEnums.SetOpportunities]: (state, action: Action<Partial<IOpportunityStateContext>>) => ({
            ...state,
            ...action.payload,
        }),
        [OpportunityActionEnums.SetFilters]: (state, action: Action<any>) => ({
            ...state,
            filters: { ...state.filters, ...action.payload.filters },
        }),
        [OpportunityActionEnums.SetError]: (state) => ({ ...state, isPending: false, isError: true }),
    },
    INITIAL_STATE
);