"use client";

import React, { useContext } from "react";
import { Modal, Form, Input, Select, Button, message, Typography, Checkbox } from "antd";
import { ContactActionContext, ContactStateContext } from "@/app/providers/contactProvider";
import { ClientStateContext } from "@/app/providers/clientProvider";
import { useStyles } from "../../dashboard/style";

const { Text } = Typography;

interface Props {
    open: boolean;
    onCancel: () => void;
}

export default function AddContactModal({ open, onCancel }: Props) {
    const { styles } = useStyles();
    const [form] = Form.useForm();
    const { isPending } = useContext(ContactStateContext);
    const contactActions = useContext(ContactActionContext);
    const { clients } = useContext(ClientStateContext);

    const onFinish = async (values: any) => {
        try {
            // Values now contain phoneNumber, position, and isPrimaryContact
            await contactActions?.createContact(values);
            message.success("Contact added successfully");
            form.resetFields();
            onCancel();
        } catch (error) {
            message.error("Failed to create contact");
        }
    };

    return (
        <Modal
            title={<span style={{ color: '#fff', letterSpacing: '1px' }}>NEW CONTACT RECORD</span>}
            open={open}
            onCancel={onCancel}
            footer={null}
            
        >
            <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ isPrimaryContact: false }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item 
                        name="firstName" 
                        label={<Text style={{ color: '#8c8c8c', fontSize: '11px' }}>FIRST NAME</Text>} 
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <Input  placeholder="John" />
                    </Form.Item>
                    <Form.Item 
                        name="lastName" 
                        label={<Text style={{ color: '#8c8c8c', fontSize: '11px' }}>LAST NAME</Text>} 
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <Input  placeholder="Doe" />
                    </Form.Item>
                </div>

                <Form.Item 
                    name="clientId" 
                    label={<Text style={{ color: '#8c8c8c', fontSize: '11px' }}>ASSIGN TO CLIENT</Text>}
                    rules={[{ required: true, message: 'Please select a client' }]}
                >
                    <Select 
                         
                        placeholder="Select a company"
                        showSearch
                        optionFilterProp="children"
                        popupClassName={styles.drawerSelectPopup}
                    >
                        {clients?.map(c => (
                            <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item 
                    name="email" 
                    label={<Text style={{ color: '#8c8c8c', fontSize: '11px' }}>EMAIL ADDRESS</Text>}
                    rules={[{ required: true, type: 'email' }]}
                >
                    <Input  placeholder="john.doe@company.com" />
                </Form.Item>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item 
                        name="phoneNumber" // Updated
                        label={<Text style={{ color: '#8c8c8c', fontSize: '11px' }}>PHONE NUMBER</Text>}
                        style={{ flex: 1 }}
                    >
                        <Input  placeholder="+27..." />
                    </Form.Item>
                    <Form.Item 
                        name="position" // Added
                        label={<Text style={{ color: '#8c8c8c', fontSize: '11px' }}>POSITION</Text>}
                        style={{ flex: 1 }}
                    >
                        <Input  placeholder="Manager" />
                    </Form.Item>
                </div>

                <Form.Item name="isPrimaryContact" valuePropName="checked">
                    <Checkbox><Text style={{ color: '#8c8c8c', fontSize: '12px' }}>SET AS PRIMARY CONTACT</Text></Checkbox>
                </Form.Item>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                    <Button onClick={onCancel} ghost>Cancel</Button>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={isPending} 
                        className={styles.primaryButton}
                    >
                        Create Contact
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}