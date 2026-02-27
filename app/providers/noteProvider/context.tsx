import { createContext } from 'react';

export enum EntityType {
    Lead = 1,
    Opportunity = 2,
    Account = 3,
    Task = 4
}

export interface INote {
    id: string;
    content: string;
    relatedToType: number;
    relatedToId: string;
    isPrivate: boolean;
    createdBy: string;
    createdAt: string;
}

export interface INoteStateContext {
    notes: INote[];
    isPending: boolean;
    filters: {
        relatedToType?: number;
        relatedToId?: string;
        pageNumber: number;
        pageSize: number;
    };
}

export interface INoteActionContext {
    getNotes: (params?: any) => Promise<void>;
    addNote: (note: Partial<INote>) => Promise<void>;
    updateNote: (id: string, content: string, isPrivate: boolean) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
    clearNotes: () => void;
}

export const INITIAL_STATE: INoteStateContext = {
    notes: [],
    isPending: false,
    filters: {
        pageNumber: 1,
        pageSize: 10
    }
};

export const NoteStateContext = createContext<INoteStateContext>(INITIAL_STATE);
export const NoteActionContext = createContext<INoteActionContext | undefined>(undefined);