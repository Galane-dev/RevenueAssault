import { createContext } from 'react';

export enum DocumentCategory {
    General = 1,
    Contract = 2,
    Proposal = 3,
    Invoice = 4,
    ID_Proof = 5,
    Technical_Spec = 6
}

export interface IDocument {
    id: string;
    fileName: string;
    fileExtension: string;
    fileSize: number;
    contentType: string;
    category: DocumentCategory;
    description?: string;
    uploadedBy: string;
    uploadedAt: string;
    relatedToType?: number;
    relatedToId?: string;
}

export interface IDocumentStateContext {
    isPending: boolean;
    isError: boolean;
    documents: IDocument[];
    totalCount: number;
    filters: {
        relatedToType?: number;
        relatedToId?: string;
        category?: DocumentCategory;
        pageNumber: number;
        pageSize: number;
    };
}

export interface IDocumentActionContext {
    getDocuments: (filters: any) => Promise<void>;
    uploadDocument: (formData: FormData) => Promise<void>;
    downloadDocument: (id: string, fileName: string) => Promise<void>;
    deleteDocument: (id: string) => Promise<void>;
    updateFilters: (filters: Partial<IDocumentStateContext['filters']>) => void;
}

export const INITIAL_STATE: IDocumentStateContext = {
    isPending: false,
    isError: false,
    documents: [],
    totalCount: 0,
    filters: {
        pageNumber: 1,
        pageSize: 10
    }
};

export const DocumentStateContext = createContext<IDocumentStateContext>(INITIAL_STATE);
export const DocumentActionContext = createContext<IDocumentActionContext | undefined>(undefined);