import { createContext } from 'react';

export enum PricingRequestStatus {
    Pending = 0,
    InProgress = 1,
    Completed = 2,
    Cancelled = 3
}

export enum PricingPriority {
    Low = 1,
    Medium = 2,
    High = 3,
    Urgent = 4
}

export interface IPricingRequest {
    id: string;
    title: string;
    description: string;
    clientId: string;
    clientName?: string;
    opportunityId?: string;
    requestedById: string;
    assignedToId?: string;
    priority: PricingPriority;
    status: PricingRequestStatus;
    requiredByDate: string;
    createdAt: string;
}

export interface IPricingStateContext {
    isPending: boolean;
    isError: boolean;
    requests: IPricingRequest[];
    totalCount: number;
    filters: {
        status?: PricingRequestStatus;
        priority?: PricingPriority;
        assignedToId?: string;
        pageNumber: number;
        pageSize: number;
    };
}

export interface IPricingActionContext {
    getRequests: (filters: any) => void;
    createRequest: (request: Partial<IPricingRequest>) => Promise<void>;
    assignRequest: (id: string, userId: string) => Promise<void>;
    completeRequest: (id: string) => Promise<void>;
    updateFilters: (filters: Partial<IPricingStateContext['filters']>) => void;
}

export const INITIAL_STATE: IPricingStateContext = {
    isPending: false,
    isError: false,
    requests: [],
    totalCount: 0,
    filters: {
        pageNumber: 1,
        pageSize: 10
    }
};

export const PricingStateContext = createContext<IPricingStateContext>(INITIAL_STATE);
export const PricingActionContext = createContext<IPricingActionContext | undefined>(undefined);