import { handleActions, Action } from "redux-actions";
import { IProposalStateContext, INITIAL_STATE } from "./context";
import { ProposalActionEnums } from "./actions";

export const proposalReducer = handleActions<IProposalStateContext, any>(
    {
        [ProposalActionEnums.SetPending]: (state) => ({ ...state, isPending: true }),
        [ProposalActionEnums.SetProposals]: (state, action: Action<Partial<IProposalStateContext>>) => ({
            ...state,
            ...action.payload,
            isPending: false,
        }),
        [ProposalActionEnums.SetFilters]: (state, action: Action<any>) => ({
            ...state,
            filters: { ...state.filters, ...action.payload.filters },
        }),
        [ProposalActionEnums.SetError]: (state) => ({ ...state, isPending: false, isError: true }),
    },
    INITIAL_STATE
);