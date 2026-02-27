import { createContext } from 'react';

export interface ILineItem {
    id?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
}

export interface IProposal {
    id: string;
    opportunityId: string;
    title: string;
    currency: string;
    validUntil: string;
    status: number; // 1=Draft, 2=Submitted, 3=Rejected, 4=Approved
    totalAmount?: number;
    lineItems: ILineItem[];
}

export interface IProposalStateContext {
    isPending: boolean;
    isError: boolean;
    proposals: IProposal[];
    totalCount: number;
    filters: {
        clientId?: string;
        status?: number;
        pageNumber: number;
        pageSize: number;
    };
}

export interface IProposalActionContext {
    getProposals: (filters: any) => void;
    createProposal: (proposal: Partial<IProposal>) => Promise<void>;
    submitProposal: (id: string) => Promise<void>;
    approveProposal: (id: string) => Promise<void>;
    rejectProposal: (id: string) => Promise<void>;
    deleteProposal: (id: string) => Promise<void>;
    updateFilters: (filters: Partial<IProposalStateContext['filters']>) => void;
}

export const INITIAL_STATE: IProposalStateContext = {
    isPending: false,
    isError: false,
    proposals: [],
    totalCount: 0,
    filters: {
        pageNumber: 1,
        pageSize: 10
    }
};

export const ProposalStateContext = createContext<IProposalStateContext>(INITIAL_STATE);
export const ProposalActionContext = createContext<IProposalActionContext | undefined>(undefined);