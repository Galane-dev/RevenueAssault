import { createContext } from 'react';

export interface IContract {
    id: string;
    title: string;
    clientId: string;
    clientName: string;
    value: number;
    currency: string;
    startDate: string;
    endDate: string;
    status: number; // 1: Draft, 2: Active, 3: Expired, 4: Cancelled
    termsAndConditions: string;
    createdDate: string;
}

export interface IContractStateContext {
    isPending: boolean;
    isSuccess: boolean;
    isError: boolean;
    contract?: IContract;
    contracts?: IContract[];
    totalCount?: number;
    filters: {
        searchTerm: string;
        status: number | null;
        pageNumber: number;
        pageSize: number;
    };
}

export interface IContractActionContext {
    getContract: (id: string) => Promise<void>;
    getContracts: (filters: any) => Promise<void>;
    getExpiringContracts: () => Promise<void>;
    createContract: (contract: Partial<IContract>) => Promise<void>;
    updateContract: (contract: IContract) => Promise<void>;
    deleteContract: (id: string) => Promise<void>;
    activateContract: (id: string) => Promise<void>;
    cancelContract: (id: string) => Promise<void>;
    renewContract: (id: string, newEndDate: string) => Promise<void>;
    updateFilters: (filters: Partial<IContractStateContext['filters']>) => void;
}

export const INITIAL_STATE: IContractStateContext = {
    isPending: false,
    isSuccess: false,
    isError: false,
    contracts: [],
    totalCount: 0,
    filters: {
        searchTerm: "",
        status: null,
        pageNumber: 1,
        pageSize: 7
    }
};

export const ContractStateContext = createContext<IContractStateContext>(INITIAL_STATE);
export const ContractActionContext = createContext<IContractActionContext | undefined>(undefined);
