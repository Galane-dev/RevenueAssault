import { useContext, useEffect, useState } from 'react';
import { List, Input, Button, Checkbox, Avatar, Typography, message } from 'antd';
import { NoteStateContext, NoteActionContext } from '@/app/providers/noteProvider';
import { INoteStateContext, INoteActionContext } from '@/app/providers/noteProvider/context';
import { useStyles } from '../../dashboard/style';

const { Text } = Typography;

export const NoteSection = ({ type, id }: { type: number, id: string }) => {
    // 1. Force type assertion to prevent 'unknown' issues
    const { notes, isPending } = useContext(NoteStateContext) as INoteStateContext;
    const noteActions = useContext(NoteActionContext) as INoteActionContext;
    const { styles } = useStyles();
    
    const [content, setContent] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);

    useEffect(() => {
        if (id) {
            noteActions?.getNotes({ relatedToType: type, relatedToId: id });
        }
    }, [id, type]);

    const onSave = async () => {
        if (!content.trim()) return message.warning("Please enter some text");
        await noteActions?.addNote({ content, relatedToType: type, relatedToId: id, isPrivate });
        setContent('');
    };

    return (
        <div>
            <Input.TextArea 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="Log an interaction..." 
                rows={3} 
                style={{ background: '#1f1f1f', color: '#fff', borderColor: '#303030' }}
            />
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                
                <Button className={styles.primaryButton} type="primary" onClick={onSave} loading={isPending}>Add Note</Button>
            </div>
            
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