"use client";

import React from "react";
import { Modal, Form, Input, Select, Button, message } from "antd";
import { useContext } from "react";
import { ClientActionContext, ClientStateContext } from "@/app/providers/clientProvider/context";
import { useStyles } from "../../dashboard/style";

interface Props {
    open: boolean;
    onCancel: () => void;
}

export default function AddClientModal({ open, onCancel }: Props) {
    const { styles } = useStyles();
    const [form] = Form.useForm();
    const actions = useContext(ClientActionContext);
    const { isPending } = useContext(ClientStateContext);

    const onFinish = async (values: any) => {
        try {
            await actions?.createClient({ ...values, clientType: Number(values.clientType) });
            message.success("Client created successfully");
            form.resetFields();
            onCancel();
        } catch (error) {
            message.error("Failed to create client.");
        }
    };

    return (
        <Modal
            title={<span style={{ color: '#fff' }}>NEW CLIENT RELATIONSHIP</span>}
            open={open}
            onCancel={onCancel}
            footer={null}
            styles={{ 
                mask: { backdropFilter: 'blur(4px)' },
                body: { background: '#0a0a0a', border: '1px solid #1a1a1a' },
                header: { background: '#0a0a0a' }
            }}
            modalRender={(modal) => (
            <div style={{ border: '1px solid #1a1a1a', borderRadius: '8px', overflow: 'hidden' }}>
                {modal}
            </div>
        )}
        >
            <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 24 }}>
                <Form.Item name="name" label={<Text color="#8c8c8c">COMPANY NAME</Text>} rules={[{ required: true }]}>
                    <Input className={styles.searchInput} placeholder="e.g. Acme Corp" />
                </Form.Item>

                <Form.Item name="industry" label={<Text color="#8c8c8c">INDUSTRY</Text>} rules={[{ required: true }]}>
                    <Input className={styles.searchInput} placeholder="e.g. Finance" />
                </Form.Item>

                <Form.Item name="clientType" label={<Text color="#8c8c8c">TYPE</Text>} initialValue="1">
                    <Select className={styles.searchInput} popupClassName={styles.drawerSelectPopup}>
                        <Select.Option value="1">Corporate</Select.Option>
                        <Select.Option value="2">SME</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item name="website" label={<Text color="#8c8c8c">WEBSITE URL</Text>}>
                    <Input className={styles.searchInput} placeholder="https://..." />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 32 }}>
                    <Button onClick={onCancel} style={{ marginRight: 8 }} ghost>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={isPending} className={styles.primaryButton}>
                        Create Client
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
}

const Text = ({ children, color }: any) => <span style={{ color, fontSize: '12px', fontWeight: 600 }}>{children}</span>;