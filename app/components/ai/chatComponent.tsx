'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Drawer, Input, Button, Space, Spin, Empty, message, Tooltip, Divider, Tag } from 'antd';
import { SendOutlined, DeleteOutlined, CopyOutlined, CheckOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { useStyles } from './style';
import { useChatActions, useChatState } from '@/app/providers/chatProvider';
import { getChatPageKey } from '@/app/providers/chatProvider/context';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface ChatComponentProps {
    open: boolean;
    onClose: () => void;
    context?: Record<string, any>;
    title?: string;
    pageTitle?: string;
}

export const AIChatComponent: React.FC<ChatComponentProps> = ({
    open,
    onClose,
    context,
    title = 'AI Assistant',
    pageTitle,
}) => {
    const { styles } = useStyles();
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { chatsByPage } = useChatState();
    const { loadPageChats, appendMessage, clearPageMessages } = useChatActions();

    const effectivePageTitle = useMemo(() => pageTitle || title || 'general', [pageTitle, title]);
    const pageKey = useMemo(() => getChatPageKey(effectivePageTitle), [effectivePageTitle]);
    const messages = useMemo(() => chatsByPage[pageKey] || [], [chatsByPage, pageKey]);

    useEffect(() => {
        if (!open) {
            return;
        }

        loadPageChats(effectivePageTitle);
    }, [open, effectivePageTitle, loadPageChats]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!inputValue.trim()) {
            return;
        }

        const userMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: inputValue,
            timestamp: new Date(),
        };

        const messagesForApi = [...messages, userMessage];
        await appendMessage(effectivePageTitle, userMessage);
        setInputValue('');
        setLoading(true);

        try {
            // Prepare messages for API
            const apiMessages = messagesForApi.map((msg) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                content: msg.content,
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: apiMessages,
                    context: {
                        ...context,
                        pageTitle,
                        timestamp: new Date().toISOString(),
                    },
                }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                const assistantMessage: ChatMessage = {
                    id: `msg-${Date.now()}-ai`,
                    role: 'assistant',
                    content: data.message,
                    timestamp: new Date(),
                };
                await appendMessage(effectivePageTitle, assistantMessage);
            } else {
                message.error(data.error || 'Failed to get response');
            }
        } catch (error) {
            console.error('Chat error:', error);
            message.error('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            sendMessage();
        }
    };

    const clearMessages = async () => {
        await clearPageMessages(effectivePageTitle);
    };

    const copyToClipboard = (content: string, id: string) => {
        navigator.clipboard.writeText(content);
        setCopiedId(id);
        message.success('Copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <Drawer
            title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <span>{title}</span>
                        {pageTitle && (
                            <Tag color="blue" className={styles.tagContainer}>
                                {pageTitle}
                            </Tag>
                        )}
                    </div>
                </div>
            }
            placement="right"
            onClose={onClose}
            open={open}
            width={450}
            bodyStyle={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}
            headerStyle={{ backgroundColor: '#262626', borderBottom: '1px solid #434343' }}
            drawerStyle={{ backgroundColor: '#1f1f1f' }}
        >
            {/* Chat Messages */}
            <div className={styles.messagesContainer}>
                {messages.length === 0 ? (
                    <Empty
                        description="Start a conversation"
                        className={styles.emptyState}
                    />
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`${styles.messageGroup} ${
                                msg.role === 'user' ? styles.userMessage : styles.assistantMessage
                            }`}
                        >
                            <div
                                className={`${styles.messageBubble} ${
                                    msg.role === 'user' ? styles.userBubble : styles.assistantBubble
                                }`}
                                onMouseEnter={(e) => {
                                    const btn = e.currentTarget.querySelector(
                                        '[data-action-btn]'
                                    ) as HTMLElement;
                                    if (btn) btn.style.opacity = '1';
                                }}
                                onMouseLeave={(e) => {
                                    const btn = e.currentTarget.querySelector(
                                        '[data-action-btn]'
                                    ) as HTMLElement;
                                    if (btn) btn.style.opacity = '0';
                                }}
                            >
                                {msg.role === 'assistant' ? (
                                    <div className={styles.markdownContent}>
                                        <ReactMarkdown
                                            components={{
                                                p: ({ children }) => <p style={{ margin: 0 }}>{children}</p>,
                                                ul: ({ children }) => <ul style={{ marginTop: 4, marginBottom: 4 }}>{children}</ul>,
                                                ol: ({ children }) => <ol style={{ marginTop: 4, marginBottom: 4 }}>{children}</ol>,
                                                li: ({ children }) => <li>{children}</li>,
                                                h1: ({ children }) => <h1>{children}</h1>,
                                                h2: ({ children }) => <h2>{children}</h2>,
                                                h3: ({ children }) => <h3>{children}</h3>,
                                                code: ({ node, children, ...props }: any) =>
                                                    node?.parent?.type === 'paragraph' ? (
                                                        <code>{children}</code>
                                                    ) : (
                                                        <pre><code>{children}</code></pre>
                                                    ),
                                                blockquote: ({ children }) => <blockquote>{children}</blockquote>,
                                                a: ({ href, children }) => (
                                                    <a href={href} target="_blank" rel="noopener noreferrer">
                                                        {children}
                                                    </a>
                                                ),
                                                table: ({ children }) => <table>{children}</table>,
                                                thead: ({ children }) => <thead>{children}</thead>,
                                                tbody: ({ children }) => <tbody>{children}</tbody>,
                                                tr: ({ children }) => <tr>{children}</tr>,
                                                th: ({ children }) => <th>{children}</th>,
                                                td: ({ children }) => <td>{children}</td>,
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <div>{msg.content}</div>
                                )}
                                {msg.role === 'assistant' && (
                                    <Button
                                        data-action-btn
                                        type="text"
                                        size="small"
                                        icon={
                                            copiedId === msg.id ? (
                                                <CheckOutlined style={{ color: '#52c41a' }} />
                                            ) : (
                                                <CopyOutlined style={{ color: '#8c8c8c' }} />
                                            )
                                        }
                                        onClick={() => copyToClipboard(msg.content, msg.id)}
                                        className={styles.messageActions}
                                    />
                                )}
                            </div>
                        </div>
                    ))
                )}
                {loading && (
                    <div className={styles.spinnerWrapper}>
                        <Spin size="small" />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <Divider className={styles.divider} />

            {/* Input Area */}
            <div className={styles.inputContainer}>
                <Input.TextArea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about your data... (Ctrl+Enter to send)"
                    disabled={loading}
                    rows={3}
                />
            </div>

            {/* Actions */}
            <Space className={styles.actionButtons}>
                <Tooltip title="Clear conversation">
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={clearMessages}
                        disabled={messages.length === 0}
                        size="small"
                    >
                        Clear
                    </Button>
                </Tooltip>
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={sendMessage}
                    loading={loading}
                    disabled={!inputValue.trim() || loading}
                >
                    Send
                </Button>
            </Space>
        </Drawer>
    );
};

export default AIChatComponent;
