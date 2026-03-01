import { createAction } from "redux-actions";
import { IClientStateContext, IClient } from "./context";

export enum ClientActionEnums {
  SetPending = "SET_PENDING",
  SetClients = "SET_CLIENTS",
  SetFilters = "SET_FILTERS", // Ensure this exists in your Enum
  SetError = "SET_ERROR",
  SetSelectedClient = "SET_SELECTED_CLIENT",
}

export const setPending = createAction<Partial<IClientStateContext>>(
    ClientActionEnums.SetPending, () => ({ isPending: true })
);

export const setClients = createAction<Partial<IClientStateContext>, { items: IClient[], totalCount: number }>(
  ClientActionEnums.SetClients, 
  ({ items, totalCount }) => ({ clients: items, totalCount })
);

// Add this missing export:
export const setFilters = createAction<Partial<IClientStateContext>, { filters: any }>(
  ClientActionEnums.SetFilters,
  (payload) => ({ filters: payload.filters })
);

export const setSelectedClientAction = createAction<Partial<IClientStateContext>, { client: IClient }>(
  ClientActionEnums.SetSelectedClient,
  ({ client }) => ({ client })
);

export const setError = createAction<Partial<IClientStateContext>>(
    ClientActionEnums.SetError, () => ({ isError: true })
);