import { createContext } from 'react';

export interface IClient {
    id: string;
    name: string;
    industry: string;
    clientType: number;
    website: string;
    isActive: boolean;
}

// Add the filters definition here
export interface IClientStateContext {
    isPending: boolean;
    isSuccess: boolean;
    isError: boolean;
    client?: IClient;
    clients?: IClient[];
    totalCount?: number;
    filters: { // <--- Add this block
        searchTerm: string;
        industry: string;
        isActive: boolean | null;
        pageNumber: number;
        pageSize: number;
    };
}

export interface IClientActionContext {
    getClient: (id: string) => void;
    getClients: (filters: any) => void;
    updateClient: (client: IClient) => void;
    createClient: (client: Partial<IClient>) => Promise<void>;
    deleteClient: (id: string) => void;
    updateFilters: (filters: Partial<IClientStateContext['filters']>) => void;
}

export const INITIAL_STATE: IClientStateContext = {
    isPending: false,
    isSuccess: false,
    isError: false,
    clients: [],
    totalCount: 0,
    filters: { // <--- Initialize this block
        searchTerm: "",
        industry: "",
        isActive: null,
        pageNumber: 1,
        pageSize: 10
    }
};

export const ClientStateContext = createContext<IClientStateContext>(INITIAL_STATE);
export const ClientActionContext = createContext<IClientActionContext | undefined>(undefined);