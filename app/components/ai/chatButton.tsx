'use client';

import React from 'react';
import { Button, Tooltip } from 'antd';
import { MessageOutlined } from '@ant-design/icons';

interface ChatButtonProps {
    onClick: () => void;
    title?: string;
    style?: React.CSSProperties;
}

export const ChatButton: React.FC<ChatButtonProps> = ({
    onClick,
    title = 'Ask AI Assistant',
    style,
}) => {
    return (
        <Tooltip title={title}>
            <Button
                type="primary"
                shape="circle"
                icon={<MessageOutlined />}
                onClick={onClick}
                size="large"
                style={{
                    ...style,
                }}
            />
        </Tooltip>
    );
};

export default ChatButton;
