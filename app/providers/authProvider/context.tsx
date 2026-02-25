import { createContext } from 'react';

export interface IUser {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    token?: string;
}

export interface IAuthStateContext {
    isPending: boolean;
    isSuccess: boolean;
    isError: boolean;
    user?: IUser;
    isAuthenticated: boolean;
}

export interface IAuthActionContext {
    login: (credentials: any) => Promise<void>;
    register: (details: any) => Promise<void>;
    logout: () => void;
    getCurrentUser: () => Promise<void>;
}

export const INITIAL_AUTH_STATE: IAuthStateContext = {
    isPending: false,
    isSuccess: false,
    isError: false,
    isAuthenticated: false,
};

export const AuthStateContext = createContext<IAuthStateContext>(INITIAL_AUTH_STATE);
export const AuthActionContext = createContext<IAuthActionContext | undefined>(undefined);