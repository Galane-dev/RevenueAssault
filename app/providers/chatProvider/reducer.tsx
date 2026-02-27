import { handleActions, Action } from 'redux-actions';
import { INITIAL_STATE, IChatMessage, IChatStateContext } from './context';
import { ChatActionEnums } from './actions';

interface ISetPageChatsPayload {
    pageKey: string;
    messages: IChatMessage[];
}

interface IClearPageChatsPayload {
    pageKey: string;
}

export const chatReducer = handleActions<IChatStateContext, any>(
    {
        [ChatActionEnums.SetPending]: (state) => ({
            ...state,
            isPending: true,
            isError: false,
        }),
        [ChatActionEnums.SetError]: (state) => ({
            ...state,
            isPending: false,
            isError: true,
        }),
        [ChatActionEnums.SetPageChats]: (
            state,
            action: Action<Partial<ISetPageChatsPayload>>
        ) => {
            const pageKey = action.payload?.pageKey;
            if (!pageKey) {
                return {
                    ...state,
                    isPending: false,
                };
            }

            return {
                ...state,
                chatsByPage: {
                    ...state.chatsByPage,
                    [pageKey]: action.payload?.messages || [],
                },
                isPending: false,
                isError: false,
            };
        },
        [ChatActionEnums.ClearPageChats]: (
            state,
            action: Action<Partial<IClearPageChatsPayload>>
        ) => {
            const pageKey = action.payload?.pageKey;
            if (!pageKey) {
                return state;
            }

            const nextChatsByPage = { ...state.chatsByPage };
            delete nextChatsByPage[pageKey];

            return {
                ...state,
                chatsByPage: nextChatsByPage,
                isPending: false,
                isError: false,
            };
        },
    },
    INITIAL_STATE
);
