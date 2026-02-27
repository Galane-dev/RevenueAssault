import { useState, useCallback } from 'react';

interface UseChatOptions {
    pageTitle?: string;
    initialContext?: Record<string, any>;
}

export const useAIChat = (options?: UseChatOptions) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatContext, setChatContext] = useState<Record<string, any> | undefined>(
        options?.initialContext
    );

    const openChat = useCallback((context?: Record<string, any>) => {
        if (context) {
            setChatContext(context);
        }
        setIsChatOpen(true);
    }, []);

    const closeChat = useCallback(() => {
        setIsChatOpen(false);
    }, []);

    const updateChatContext = useCallback((context: Record<string, any>) => {
        setChatContext(prevContext => ({
            ...prevContext,
            ...context,
        }));
    }, []);

    return {
        isChatOpen,
        chatContext,
        openChat,
        closeChat,
        updateChatContext,
        pageTitle: options?.pageTitle,
    };
};

export default useAIChat;
