import { handleActions, Action } from "redux-actions";
import { IPricingStateContext, INITIAL_STATE } from "./context";
import { PricingActionEnums } from "./actions";

export const pricingReducer = handleActions<IPricingStateContext, any>(
    {
        [PricingActionEnums.SetPending]: (state) => ({
            ...state,
            isPending: true,
        }),
        [PricingActionEnums.SetRequests]: (state, action: Action<Partial<IPricingStateContext>>) => ({
            ...state,
            ...action.payload,
            isPending: false,
        }),
        [PricingActionEnums.SetFilters]: (state, action: Action<any>) => ({
            ...state,
            filters: { 
                ...state.filters, 
                ...action.payload.filters 
            },
        }),
        [PricingActionEnums.SetError]: (state) => ({
            ...state,
            isPending: false,
            isError: true,
        }),
    },
    INITIAL_STATE
);