import { createAction } from "redux-actions";
import { IDocumentStateContext, IDocument } from "./context";

export enum DocumentActionEnums {
    SetPending = "SET_PENDING",
    SetDocuments = "SET_DOCUMENTS",
    SetFilters = "SET_FILTERS",
    SetError = "SET_ERROR",
}

export const setPending = createAction<Partial<IDocumentStateContext>>(
    DocumentActionEnums.SetPending, () => ({ isPending: true, isError: false })
);

export const setDocuments = createAction<Partial<IDocumentStateContext>, { items: IDocument[], totalCount: number }>(
    DocumentActionEnums.SetDocuments, 
    ({ items, totalCount }) => ({ documents: items, totalCount, isPending: false })
);

export const setFilters = createAction<Partial<IDocumentStateContext>, { filters: any }>(
    DocumentActionEnums.SetFilters,
    (payload) => ({ filters: payload.filters })
);

export const setError = createAction<Partial<IDocumentStateContext>>(
    DocumentActionEnums.SetError, () => ({ isError: true, isPending: false })
);