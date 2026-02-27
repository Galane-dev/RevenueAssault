import { createContext } from 'react';

export interface IChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface IChatStateContext {
    chatsByPage: Record<string, IChatMessage[]>;
    isPending: boolean;
    isError: boolean;
}

export interface IChatActionContext {
    loadPageChats: (pageTitle: string) => Promise<void>;
    savePageChats: (pageTitle: string, messages: IChatMessage[]) => Promise<void>;
    setPageMessages: (pageTitle: string, messages: IChatMessage[]) => void;
    appendMessage: (pageTitle: string, message: IChatMessage) => Promise<void>;
    clearPageMessages: (pageTitle: string) => Promise<void>;
}

export const INITIAL_STATE: IChatStateContext = {
    chatsByPage: {},
    isPending: false,
    isError: false,
};

export const getChatPageKey = (pageTitle: string) =>
    pageTitle?.trim().toLowerCase().replace(/\s+/g, '-') || 'general';

export const ChatStateContext = createContext<IChatStateContext>(INITIAL_STATE);
export const ChatActionContext = createContext<IChatActionContext | undefined>(undefined);
