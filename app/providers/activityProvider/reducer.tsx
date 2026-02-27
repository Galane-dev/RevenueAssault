import { handleActions, Action } from "redux-actions";
import { IActivityStateContext, INITIAL_STATE } from "./context";
import { ActivityActionEnums } from "./actions";

export const activityReducer = handleActions<IActivityStateContext, any>(
    {
        [ActivityActionEnums.SetPending]: (state) => ({ ...state, isPending: true }),
        [ActivityActionEnums.SetActivities]: (state, action: Action<Partial<IActivityStateContext>>) => ({
            ...state,
            ...action.payload,
            isPending: false,
        }),
        [ActivityActionEnums.SetFilters]: (state, action: Action<any>) => ({
            ...state,
            filters: { ...state.filters, ...action.payload.filters },
        }),
        [ActivityActionEnums.SetError]: (state) => ({ ...state, isPending: false, isError: true }),
    },
    INITIAL_STATE
);