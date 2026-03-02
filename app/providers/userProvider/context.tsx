import { createContext } from 'react';

export interface IUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    phoneNumber: string;
    isActive: boolean;
    roles: string[];
    lastLoginAt: string;
    createdAt: string;
}

export interface IUserStateContext {
    isPending: boolean;
    isSuccess: boolean;
    isError: boolean;
    users?: IUser[];
    totalCount: number;
    filters: {
        role?: string;
        searchTerm: string;
        isActive?: boolean;
        pageNumber: number;
        pageSize: number;
    };
}

export interface IUserActionContext {
    getUsers: (filters: any) => void;
    getUserById: (id: string) => Promise<IUser | undefined>;
    updateFilters: (filters: Partial<IUserStateContext['filters']>) => void;
}

export const INITIAL_STATE: IUserStateContext = {
    isPending: false,
    isSuccess: false,
    isError: false,
    users: [],
    totalCount: 0,
    filters: {
        searchTerm: "",
        pageNumber: 1,
        pageSize: 20,
        isActive: true
    }
};

export const UserStateContext = createContext<IUserStateContext>(INITIAL_STATE);
export const UserActionContext = createContext<IUserActionContext | undefined>(undefined);