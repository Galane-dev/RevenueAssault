import { createContext } from 'react';

export interface IOpportunity {
    id: string;
    title: string;
    clientId: string;
    clientName?: string; // Usually returned in joined paged list
    estimatedValue: number;
    currency: string;
    stage: number; // 1=Discovery, 2=Proposal, 3=Negotiation, 4=Won, 5=Lost
    probability: number;
    expectedCloseDate: string;
    ownerId: string;
}

export interface IOpportunityStateContext {
    isPending: boolean;
    isSuccess: boolean;
    isError: boolean;
    opportunities?: IOpportunity[];
    totalCount: number;
    filters: {
        clientId?: string;
        stage?: number;
        searchTerm: string;
        pageNumber: number;
        pageSize: number;
    };
}

export interface IOpportunityActionContext {
    getOpportunities: (filters: any) => void;
    createOpportunity: (values: Partial<IOpportunity>) => Promise<void>;
    updateStage: (id: string, stage: number, reason?: string) => Promise<void>;
    updateFilters: (filters: Partial<IOpportunityStateContext['filters']>) => void;
}

export const INITIAL_STATE: IOpportunityStateContext = {
    isPending: false,
    isSuccess: false,
    isError: false,
    opportunities: [],
    totalCount: 0,
    filters: {
        searchTerm: "",
        pageNumber: 1,
        pageSize: 10
    }
};

export const OpportunityStateContext = createContext<IOpportunityStateContext>(INITIAL_STATE);
export const OpportunityActionContext = createContext<IOpportunityActionContext | undefined>(undefined);