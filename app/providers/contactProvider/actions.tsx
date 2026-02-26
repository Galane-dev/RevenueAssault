import { createAction } from "redux-actions";
import { IContactStateContext, IContact } from "./context";

export enum ContactActionEnums {
    SetPending = "SET_PENDING",
    SetContacts = "SET_CONTACTS",
    SetFilters = "SET_FILTERS",
    SetError = "SET_ERROR",
}

export const setPending = createAction<Partial<IContactStateContext>>(
    ContactActionEnums.SetPending, () => ({ isPending: true, isError: false })
);

export const setContacts = createAction<Partial<IContactStateContext>, { items: IContact[], totalCount: number }>(
    ContactActionEnums.SetContacts, 
    ({ items, totalCount }) => ({ contacts: items, totalCount, isPending: false })
);

export const setFilters = createAction<Partial<IContactStateContext>, { filters: any }>(
    ContactActionEnums.SetFilters,
    (payload) => ({ filters: payload.filters })
);

export const setError = createAction<Partial<IContactStateContext>>(
    ContactActionEnums.SetError, () => ({ isError: true, isPending: false })
);