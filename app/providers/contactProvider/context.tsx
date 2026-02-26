import { createContext } from 'react';

export interface IContact {
    id: string;
    clientId: string;
    clientName?: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;    // Updated
    position: string;       // Added
    isPrimaryContact: boolean; // Updated
}

export interface IContactStateContext {
    isPending: boolean;
    isError: boolean;
    contacts: IContact[];
    totalCount: number;
    filters: {
        clientId?: string;
        searchTerm: string;
        pageNumber: number;
        pageSize: number;
    };
}

export interface IContactActionContext {
    getContacts: (filters: any) => void;
    createContact: (contact: Partial<IContact>) => Promise<void>;
    setPrimary: (id: string) => Promise<void>;
    updateFilters: (filters: Partial<IContactStateContext['filters']>) => void;
}

export const INITIAL_STATE: IContactStateContext = {
    isPending: false,
    isError: false,
    contacts: [],
    totalCount: 0,
    filters: {
        searchTerm: "",
        pageNumber: 1,
        pageSize: 10
    }
};

export const ContactStateContext = createContext<IContactStateContext>(INITIAL_STATE);
export const ContactActionContext = createContext<IContactActionContext | undefined>(undefined);