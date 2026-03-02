'use client';

import React from 'react';
import { Modal, Typography, Space, Button, Spin } from 'antd';

const { Text, Paragraph } = Typography;

interface RectifyAndImproveSuggestionProps {
    open: boolean;
    loading?: boolean;
    originalText: string;
    improvedText: string;
    onAcceptImproved: () => void;
    onUseOriginal: () => void;
    onCancel: () => void;
}

export const RectifyAndImproveSuggestion: React.FC<RectifyAndImproveSuggestionProps> = ({
    open,
    loading = false,
    originalText,
    improvedText,
    onAcceptImproved,
    onUseOriginal,
    onCancel,
}) => {
    return (
        <Modal
            open={open}
            title="AI Suggestion for Your Note"
            onCancel={onCancel}
            footer={null}
            destroyOnClose
        >
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
                    <Spin tip="Improving your note..." />
                </div>
            ) : (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                        <Text strong>Original note</Text>
                        <Paragraph
                            style={{
                                marginTop: 8,
                                padding: 12,
                                border: '1px solid #303030',
                                borderRadius: 8,
                                background: '#141414',
                            }}
                        >
                            {originalText}
                        </Paragraph>
                    </div>

                    <div>
                        <Text strong>AI rectified & improved</Text>
                        <Paragraph
                            style={{
                                marginTop: 8,
                                padding: 12,
                                border: '1px solid #1f7a47',
                                borderRadius: 8,
                                background: '#0f1f15',
                            }}
                        >
                            {improvedText}
                        </Paragraph>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Button onClick={onCancel}>Cancel</Button>
                        <Button onClick={onUseOriginal}>Save Original</Button>
                        <Button type="primary" onClick={onAcceptImproved}>
                            Accept & Save Improved
                        </Button>
                    </div>
                </Space>
            )}
        </Modal>
    );
};

export default RectifyAndImproveSuggestion;
