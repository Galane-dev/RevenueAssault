import { createAction } from "redux-actions";
import { IUserStateContext, IUser } from "./context";

export enum UserActionEnums {
    SetPending = "SET_PENDING",
    SetUsers = "SET_USERS",
    SetFilters = "SET_FILTERS",
    SetError = "SET_ERROR",
}


export const setPending = createAction<Partial<IUserStateContext>, boolean>(
    UserActionEnums.SetPending, 
    (isPending) => ({ isPending })
);
export const setError = createAction<Partial<IUserStateContext>>(UserActionEnums.SetError, () => ({ isError: true, isPending: false }));

export const setUsers = createAction<Partial<IUserStateContext>, { items: IUser[], totalCount: number }>(
    UserActionEnums.SetUsers,
    ({ items, totalCount }) => ({ users: items, totalCount, isPending: false, isSuccess: true })
);

export const setFilters = createAction<Partial<IUserStateContext>, { filters: any }>(
    UserActionEnums.SetFilters,
    (payload) => ({ filters: payload.filters })
);