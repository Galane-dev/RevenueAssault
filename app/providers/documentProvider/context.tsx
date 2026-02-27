import { createContext } from 'react';

export enum DocumentCategory {
    Contract = 1,
    Proposal = 2,
    Presentation = 3,
    Quote = 4,
    Report = 5,
    Other = 6
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