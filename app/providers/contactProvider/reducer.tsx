import { handleActions, Action } from "redux-actions";
import { IContactStateContext, INITIAL_STATE } from "./context";
import { ContactActionEnums } from "./actions";

export const contactReducer = handleActions<IContactStateContext, any>(
    {
        [ContactActionEnums.SetPending]: (state) => ({
            ...state,
            isPending: true,
        }),
        [ContactActionEnums.SetContacts]: (state, action: Action<Partial<IContactStateContext>>) => ({
            ...state,
            ...action.payload,
            isPending: false,
        }),
        [ContactActionEnums.SetFilters]: (state, action: Action<any>) => ({
            ...state,
            filters: { 
                ...state.filters, 
                ...action.payload.filters 
            },
        }),
        [ContactActionEnums.SetError]: (state) => ({
            ...state,
            isPending: false,
            isError: true,
        }),
    },
    INITIAL_STATE
);