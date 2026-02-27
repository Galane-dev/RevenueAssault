import { handleActions, Action } from "redux-actions";
import { IContractStateContext, INITIAL_STATE } from "./context";
import { ContractActionEnums } from "./actions";

export const contractReducer = handleActions<IContractStateContext, any>(
    {
        [ContractActionEnums.SetPending]: (state) => ({
            ...state,
            isPending: true,
            isSuccess: false,
            isError: false
        }),
        [ContractActionEnums.SetContracts]: (state, action: Action<Partial<IContractStateContext>>) => ({
            ...state,
            ...action.payload,
            isPending: false,
            isSuccess: true,
        }),
        [ContractActionEnums.SetFilters]: (state, action: Action<any>) => ({
            ...state,
            filters: { ...state.filters, ...action.payload.filters },
        }),
        [ContractActionEnums.SetError]: (state) => ({
            ...state,
            isPending: false,
            isError: true,
            isSuccess: false
        }),
    },
    INITIAL_STATE
);
