"use client";

import React, { useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { AuthStateContext } from '@/app/providers/authProvider/context';
import { clearPageChats, setError, setPageChats, setPending } from './actions';
import {
    ChatActionContext,
    ChatStateContext,
    getChatPageKey,
    IChatMessage,
    INITIAL_STATE,
} from './context';
import { chatReducer } from './reducer';

const normalizeTimestamp = (timestamp: any): Date => {
    if (!timestamp) return new Date();
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp?.toDate === 'function') return timestamp.toDate();

    const parsed = new Date(timestamp);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const normalizeMessages = (messages: any[]): IChatMessage[] =>
    (messages || []).map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: normalizeTimestamp(message.timestamp),
    }));

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);
    const { user } = useContext(AuthStateContext);
    const userId = user?.userId;
    const chatsByPageRef = useRef(state.chatsByPage);

    useEffect(() => {
        chatsByPageRef.current = state.chatsByPage;
    }, [state.chatsByPage]);

    const actions = useMemo(
        () => ({
            loadPageChats: async (pageTitle: string) => {
                const pageKey = getChatPageKey(pageTitle);

                if (!userId) {
                    chatsByPageRef.current = {
                        ...chatsByPageRef.current,
                        [pageKey]: [],
                    };
                    dispatch(setPageChats({ pageKey, messages: [] }));
                    return;
                }

                dispatch(setPending());
                try {
                    const pageRef = doc(db, 'chats', userId, 'pages', pageKey);
                    const pageSnap = await getDoc(pageRef);
                    const messages = pageSnap.exists()
                        ? normalizeMessages(pageSnap.data().messages || [])
                        : [];

                    chatsByPageRef.current = {
                        ...chatsByPageRef.current,
                        [pageKey]: messages,
                    };
                    dispatch(setPageChats({ pageKey, messages }));
                } catch (error) {
                    console.error('Failed to load chat messages:', error);
                    dispatch(setError());
                }
            },

            savePageChats: async (pageTitle: string, messages: IChatMessage[]) => {
                const pageKey = getChatPageKey(pageTitle);
                chatsByPageRef.current = {
                    ...chatsByPageRef.current,
                    [pageKey]: messages,
                };
                dispatch(setPageChats({ pageKey, messages }));

                if (!userId) {
                    return;
                }

                dispatch(setPending());
                try {
                    const chatRef = doc(db, 'chats', userId);
                    const pageRef = doc(db, 'chats', userId, 'pages', pageKey);

                    await setDoc(
                        chatRef,
                        {
                            userId,
                            updatedAt: serverTimestamp(),
                        },
                        { merge: true }
                    );

                    await setDoc(
                        pageRef,
                        {
                            pageTitle,
                            messages: messages.map((message) => ({
                                ...message,
                                timestamp: normalizeTimestamp(message.timestamp),
                            })),
                            updatedAt: serverTimestamp(),
                        },
                        { merge: true }
                    );

                    chatsByPageRef.current = {
                        ...chatsByPageRef.current,
                        [pageKey]: messages,
                    };
                    dispatch(setPageChats({ pageKey, messages }));
                } catch (error) {
                    console.error('Failed to save chat messages:', error);
                    dispatch(setError());
                }
            },

            setPageMessages: (pageTitle: string, messages: IChatMessage[]) => {
                const pageKey = getChatPageKey(pageTitle);
                chatsByPageRef.current = {
                    ...chatsByPageRef.current,
                    [pageKey]: messages,
                };
                dispatch(setPageChats({ pageKey, messages }));
            },

            appendMessage: async (pageTitle: string, message: IChatMessage) => {
                const pageKey = getChatPageKey(pageTitle);
                const currentMessages = chatsByPageRef.current[pageKey] || [];
                const nextMessages = [...currentMessages, message];

                chatsByPageRef.current = {
                    ...chatsByPageRef.current,
                    [pageKey]: nextMessages,
                };
                dispatch(setPageChats({ pageKey, messages: nextMessages }));

                if (!userId) {
                    return;
                }

                dispatch(setPending());
                try {
                    const chatRef = doc(db, 'chats', userId);
                    const pageRef = doc(db, 'chats', userId, 'pages', pageKey);

                    await setDoc(
                        chatRef,
                        {
                            userId,
                            updatedAt: serverTimestamp(),
                        },
                        { merge: true }
                    );

                    await setDoc(
                        pageRef,
                        {
                            pageTitle,
                            messages: nextMessages.map((item) => ({
                                ...item,
                                timestamp: normalizeTimestamp(item.timestamp),
                            })),
                            updatedAt: serverTimestamp(),
                        },
                        { merge: true }
                    );

                    chatsByPageRef.current = {
                        ...chatsByPageRef.current,
                        [pageKey]: nextMessages,
                    };
                    dispatch(setPageChats({ pageKey, messages: nextMessages }));
                } catch (error) {
                    console.error('Failed to append chat message:', error);
                    dispatch(setError());
                }
            },

            clearPageMessages: async (pageTitle: string) => {
                const pageKey = getChatPageKey(pageTitle);

                chatsByPageRef.current = {
                    ...chatsByPageRef.current,
                    [pageKey]: [],
                };
                dispatch(clearPageChats({ pageKey }));

                if (!userId) {
                    return;
                }

                dispatch(setPending());
                try {
                    const chatRef = doc(db, 'chats', userId);
                    const pageRef = doc(db, 'chats', userId, 'pages', pageKey);

                    await setDoc(
                        chatRef,
                        {
                            userId,
                            updatedAt: serverTimestamp(),
                        },
                        { merge: true }
                    );

                    await setDoc(
                        pageRef,
                        {
                            pageTitle,
                            messages: [],
                            updatedAt: serverTimestamp(),
                        },
                        { merge: true }
                    );

                    chatsByPageRef.current = {
                        ...chatsByPageRef.current,
                        [pageKey]: [],
                    };
                    dispatch(setPageChats({ pageKey, messages: [] }));
                } catch (error) {
                    console.error('Failed to clear chat messages:', error);
                    dispatch(setError());
                }
            },
        }),
        [userId]
    );

    return (
        <ChatStateContext.Provider value={state}>
            <ChatActionContext.Provider value={actions}>{children}</ChatActionContext.Provider>
        </ChatStateContext.Provider>
    );
};

export const useChatState = () => useContext(ChatStateContext);
export const useChatActions = () => {
    const context = useContext(ChatActionContext);
    if (!context) {
        throw new Error('useChatActions must be used within a ChatProvider');
    }
    return context;
};
