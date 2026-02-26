import { createAction } from "redux-actions";
import { IContractStateContext, IContract } from "./context";

export enum ContractActionEnums {
    SetPending = "SET_PENDING",
    SetContracts = "SET_CONTRACTS",
    SetFilters = "SET_FILTERS",
    SetError = "SET_ERROR",
}

export const setPending = createAction<Partial<IContractStateContext>>(
    ContractActionEnums.SetPending, () => ({ isPending: true })
);

export const setContracts = createAction<Partial<IContractStateContext>, { items: IContract[], totalCount: number }>(
    ContractActionEnums.SetContracts, 
    ({ items, totalCount }) => ({ contracts: items, totalCount })
);

export const setFilters = createAction<Partial<IContractStateContext>, { filters: any }>(
    ContractActionEnums.SetFilters,
    (payload) => ({ filters: payload.filters })
);

export const setError = createAction<Partial<IContractStateContext>>(
    ContractActionEnums.SetError, () => ({ isError: true })
);
