import { createAction } from "redux-actions";
import { IProposalStateContext, IProposal } from "./context";

export enum ProposalActionEnums {
    SetPending = "SET_PENDING",
    SetProposals = "SET_PROPOSALS",
    SetFilters = "SET_FILTERS",
    SetError = "SET_ERROR",
}

export const setPending = createAction<Partial<IProposalStateContext>>(
    ProposalActionEnums.SetPending, () => ({ isPending: true, isError: false })
);

export const setProposals = createAction<Partial<IProposalStateContext>, { items: IProposal[], totalCount: number }>(
    ProposalActionEnums.SetProposals, 
    ({ items, totalCount }) => ({ proposals: items, totalCount, isPending: false })
);

export const setFilters = createAction<Partial<IProposalStateContext>, { filters: any }>(
    ProposalActionEnums.SetFilters,
    (payload) => ({ filters: payload.filters })
);

export const setError = createAction<Partial<IProposalStateContext>>(
    ProposalActionEnums.SetError, () => ({ isError: true, isPending: false })
);