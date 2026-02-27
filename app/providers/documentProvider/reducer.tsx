import { handleActions, Action } from "redux-actions";
import { IDocumentStateContext, INITIAL_STATE } from "./context";
import { DocumentActionEnums } from "./actions";

export const documentReducer = handleActions<IDocumentStateContext, any>(
    {
        [DocumentActionEnums.SetPending]: (state) => ({ ...state, isPending: true }),
        [DocumentActionEnums.SetDocuments]: (state, action: Action<Partial<IDocumentStateContext>>) => ({
            ...state,
            ...action.payload,
            isPending: false,
        }),
        [DocumentActionEnums.SetFilters]: (state, action: Action<any>) => ({
            ...state,
            filters: { ...state.filters, ...action.payload.filters },
        }),
        [DocumentActionEnums.SetError]: (state) => ({ ...state, isPending: false, isError: true }),
    },
    INITIAL_STATE
);