import { createAction } from 'redux-actions';
import { IChatMessage, IChatStateContext } from './context';

export enum ChatActionEnums {
    SetPending = 'SET_PENDING',
    SetError = 'SET_ERROR',
    SetPageChats = 'SET_PAGE_CHATS',
    ClearPageChats = 'CLEAR_PAGE_CHATS',
}

export const setPending = createAction<Partial<IChatStateContext>>(
    ChatActionEnums.SetPending,
    () => ({ isPending: true, isError: false })
);

export const setError = createAction<Partial<IChatStateContext>>(
    ChatActionEnums.SetError,
    () => ({ isPending: false, isError: true })
);

export const setPageChats = createAction<
    Partial<IChatStateContext>,
    { pageKey: string; messages: IChatMessage[] }
>(ChatActionEnums.SetPageChats, ({ pageKey, messages }) => ({ pageKey, messages, isPending: false }));

export const clearPageChats = createAction<Partial<IChatStateContext>, { pageKey: string }>(
    ChatActionEnums.ClearPageChats,
    ({ pageKey }) => ({ pageKey, isPending: false })
);
