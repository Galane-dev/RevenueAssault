import { handleActions, Action } from "redux-actions";
import { IUserStateContext, INITIAL_STATE } from "./context";
import { UserActionEnums } from "./actions";

export const userReducer = handleActions<IUserStateContext, any>(
    {
        [UserActionEnums.SetPending]: (state, action: Action<Partial<IUserStateContext>>) => ({ 
    ...state, 
    ...action.payload, // This now spreads { isPending: true/false }
    isError: false 
}),
        [UserActionEnums.SetUsers]: (state, action: Action<Partial<IUserStateContext>>) => ({
            ...state,
            ...action.payload,
        }),
        [UserActionEnums.SetFilters]: (state, action: Action<any>) => ({
            ...state,
            filters: { ...state.filters, ...action.payload.filters },
        }),
        [UserActionEnums.SetError]: (state) => ({ ...state, isPending: false, isError: true }),
    },
    INITIAL_STATE
);