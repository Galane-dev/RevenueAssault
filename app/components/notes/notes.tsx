import { useContext, useEffect, useState } from 'react';
import { List, Input, Button, Checkbox, Avatar, Typography, message } from 'antd';
import { NoteStateContext, NoteActionContext } from '@/app/providers/noteProvider';
import { INoteStateContext, INoteActionContext } from '@/app/providers/noteProvider/context';
import { useStyles } from '../../dashboard/style';
import { RectifyAndImproveSuggestion } from '../ai/rectifyAndImproveSuggestion';

const { Text } = Typography;

export const NoteSection = ({ type, id }: { type: number, id: string }) => {
    // 1. Force type assertion to prevent 'unknown' issues
    const { notes, isPending } = useContext(NoteStateContext) as INoteStateContext;
    const noteActions = useContext(NoteActionContext) as INoteActionContext;
    const { styles } = useStyles();
    
    const [content, setContent] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [isImproving, setIsImproving] = useState(false);
    const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
    const [originalText, setOriginalText] = useState('');
    const [improvedText, setImprovedText] = useState('');

    useEffect(() => {
        if (id) {
            noteActions?.getNotes({ relatedToType: type, relatedToId: id });
        }
    }, [id, type, noteActions]);

    const saveNote = async (textToSave: string) => {
        await noteActions?.addNote({
            content: textToSave,
            relatedToType: type,
            relatedToId: id,
            isPrivate,
        });

        setContent('');
        setIsPrivate(false);
        setOriginalText('');
        setImprovedText('');
        setIsSuggestionOpen(false);
    };

    const onSave = async () => {
        const trimmedContent = content.trim();

        if (!trimmedContent) return message.warning("Please enter some text");

        setIsImproving(true);

        try {
            const response = await fetch('/api/ai/rectify-note', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: trimmedContent }),
            });

            if (!response.ok) {
                throw new Error(`AI request failed with status ${response.status}`);
            }

            const data = await response.json();
            const aiText = data?.improvedText?.trim();

            if (!aiText) {
                throw new Error('No AI suggestion returned');
            }

            setOriginalText(trimmedContent);
            setImprovedText(aiText);
            setIsSuggestionOpen(true);
        } catch (error) {
            console.error('Failed to rectify note:', error);
            message.error('Could not generate AI suggestion. Please try again.');
        } finally {
            setIsImproving(false);
        }
    };

    const handleUseOriginal = async () => {
        await saveNote(originalText || content.trim());
    };

    const handleAcceptImproved = async () => {
        await saveNote(improvedText || content.trim());
    };

    const handleCloseSuggestion = () => {
        setIsSuggestionOpen(false);
    };

    return (
        <div>
            <Input.TextArea 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="Log an interaction..." 
                rows={3} 
                disabled={isPending || isImproving}
                style={{ background: '#1f1f1f', color: '#fff', borderColor: '#303030' }}
            />
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Checkbox
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    style={{ color: '#d9d9d9' }}
                    disabled={isPending || isImproving}
                >
                    Private note
                </Checkbox>
                <Button
                    className={styles.primaryButton}
                    type="primary"
                    onClick={onSave}
                    loading={isPending || isImproving}
                >
                    Add Note
                </Button>
            </div>

            <RectifyAndImproveSuggestion
                open={isSuggestionOpen}
                loading={isImproving}
                originalText={originalText}
                improvedText={improvedText}
                onUseOriginal={handleUseOriginal}
                onAcceptImproved={handleAcceptImproved}
                onCancel={handleCloseSuggestion}
            />
            
            <List
                style={{ marginTop: 24 }}
                loading={isPending}
                // 2. CRITICAL FIX: Ensure notes is an array with a fallback
                dataSource={Array.isArray(notes) ? notes : []} 
                renderItem={(item) => (
                    <List.Item 
                        key={item.id}
                        actions={[
                            <Button 
                                key={`delete-${item.id}`}
                                type="link" 
                                danger 
                                size="small" 
                                onClick={() => noteActions?.deleteNote(item.id)}
                            >
                                Delete
                            </Button>
                        ]}
                        style={{ borderBottom: '1px solid #303030' }}
                    >
                        <List.Item.Meta
                            avatar={<Avatar style={{ backgroundColor: '#2c2c2c' }}>{item.createdBy?.[0] || 'U'}</Avatar>}
                            title={<Text style={{ color: '#d9d9d9' }}>{item.createdBy}</Text>}
                            description={
                                <div>
                                    <Text style={{ color: '#fff' }}>{item.content}</Text>
                                    <br />
                                    <Text type="secondary" style={{ fontSize: '11px' }}>
                                        {new Date(item.createdAt).toLocaleString()}
                                    </Text>
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />
        </div>
    );
};