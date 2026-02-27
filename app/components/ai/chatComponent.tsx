'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Drawer, Input, Button, Space, Spin, Empty, message, Tooltip, Divider, Tag } from 'antd';
import { SendOutlined, DeleteOutlined, CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { useStyles } from './style';

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
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setLoading(true);

        try {
            // Prepare messages for API
            const apiMessages = messages.map((msg) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                content: msg.content,
            }));
            apiMessages.push({
                role: 'user',
                content: userMessage.content,
            });

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
                setMessages((prev) => [...prev, assistantMessage]);
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

    const clearMessages = () => {
        setMessages([]);
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
                                <div>{msg.content}</div>
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
