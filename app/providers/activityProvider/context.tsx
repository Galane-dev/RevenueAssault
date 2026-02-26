import { createContext } from 'react';

export enum ActivityType {
    Task = 1,
    Meeting = 2,
    Email = 3,
    Call = 4
}

export enum ActivityStatus {
    Scheduled = 1,
    Completed = 2,
    Cancelled = 3
}

export enum ActivityPriority {
    Low = 1,
    Medium = 2,
    High = 3
}

export interface IActivity {
    id: string;
    type: ActivityType;
    subject: string;
    description?: string;
    priority: ActivityPriority;
    status: ActivityStatus;
    dueDate: string;
    assignedToId: string;
    relatedToType: number; // e.g., 1=Client, 2=Opportunity, 3=Pricing
    relatedToId: string;
    duration?: number;
    location?: string;
    outcome?: string;
}

export interface IActivityStateContext {
    isPending: boolean;
    isError: boolean;
    activities: IActivity[];
    totalCount: number;
    filters: {
        assignedToId?: string;
        type?: ActivityType;
        status?: ActivityStatus;
        priority?: ActivityPriority; // <-- ADD THIS LINE
        relatedToType?: number;
        relatedToId?: string;
        pageNumber: number;
        pageSize: number;
    };
}

export interface IActivityActionContext {
    getActivities: (filters: any) => Promise<void>;
    getUpcoming: (daysAhead?: number) => Promise<void>;
    getMyActivities: () => Promise<void>;
    getOverdue: () => Promise<void>;
    createActivity: (activity: Partial<IActivity>) => Promise<void>;
    completeActivity: (id: string, outcome: string) => Promise<void>;
    cancelActivity: (id: string) => Promise<void>;
    deleteActivity: (id: string) => Promise<void>;
    updateFilters: (filters: Partial<IActivityStateContext['filters']>) => void;
}

export const INITIAL_STATE: IActivityStateContext = {
    isPending: false,
    isError: false,
    activities: [],
    totalCount: 0,
    filters: {
        pageNumber: 1,
        pageSize: 10
    }
};

export const ActivityStateContext = createContext<IActivityStateContext>(INITIAL_STATE);
export const ActivityActionContext = createContext<IActivityActionContext | undefined>(undefined);

