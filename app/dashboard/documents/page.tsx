"use client";

import React, { useEffect, useContext, useState } from "react";
import { 
    Table, Typography, Button, Select, Space, 
    Tag, Card, Upload, message, Tooltip, Empty 
} from "antd";
import { 
    InboxOutlined, 
    DownloadOutlined, 
    DeleteOutlined, 
    FileTextOutlined,
    FilePdfOutlined,
    FileExcelOutlined,
    FileImageOutlined,
    FilterOutlined
} from "@ant-design/icons";
import { useStyles } from "../style";
import dayjs from "dayjs";

// Providers
import { DocumentProvider, DocumentStateContext, DocumentActionContext } from "../../providers/documentProvider";
import { DocumentCategory } from "@/app/providers/documentProvider/context";

const { Title, Text } = Typography;
const { Dragger } = Upload;

/**
 * UI Mapping for File Icons based on extension
 */
const getFileIcon = (ext: string) => {
    const e = ext.toLowerCase();
    if (e.includes('pdf')) return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
    if (e.includes('xls') || e.includes('csv')) return <FileExcelOutlined style={{ color: '#52c41a' }} />;
    if (e.includes('png') || e.includes('jpg')) return <FileImageOutlined style={{ color: '#1890ff' }} />;
    return <FileTextOutlined style={{ color: '#8c8c8c' }} />;
};

const categoryMap = {
    [DocumentCategory.General]: { color: "default", label: "General" },
    [DocumentCategory.Contract]: { color: "purple", label: "Contract" },
    [DocumentCategory.Proposal]: { color: "blue", label: "Proposal" },
    [DocumentCategory.Invoice]: { color: "green", label: "Invoice" },
    [DocumentCategory.Technical_Spec]: { color: "orange", label: "Technical" },
};

function DocumentManagerContent() {
    const { styles } = useStyles();
    const { documents, filters, totalCount, isPending } = useContext(DocumentStateContext);
    const documentActions = useContext(DocumentActionContext);
    
    const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);

    useEffect(() => {
        documentActions?.getDocuments(filters);
    }, [filters, documentActions]);

    // Manual Upload Handler
    const handleUpload = async (options: any) => {
        const { file, onSuccess, onError } = options;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("documentCategory", (selectedCategory || DocumentCategory.General).toString());
        
        try {
            await documentActions?.uploadDocument(formData);
            onSuccess("Ok");
            message.success(`${file.name} uploaded successfully.`);
        } catch (err) {
            onError(err);
            message.error(`${file.name} upload failed.`);
        }
    };

    const columns = [
        {
            title: "FILE NAME",
            key: "fileName",
            render: (record: any) => (
                <Space>
                    {getFileIcon(record.fileExtension)}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text strong style={{ color: '#fff' }}>{record.fileName}</Text>
                        <Text style={{ color: '#595959', fontSize: '11px' }}>
                            {(record.fileSize / 1024 / 1024).toFixed(2)} MB • {record.fileExtension.toUpperCase()}
                        </Text>
                    </div>
                </Space>
            )
        },
        {
            title: "CATEGORY",
            dataIndex: "category",
            key: "category",
            render: (cat: DocumentCategory) => (
                <Tag bordered={false}>
                </Tag>
            )
        },
        {
            title: "UPLOADED AT",
            dataIndex: "uploadedAt",
            key: "uploadedAt",
            render: (date: string) => (
                <Text style={{ color: '#8c8c8c' }}>{dayjs(date).format('DD MMM YYYY')}</Text>
            )
        },
        {
            title: "ACTIONS",
            key: "actions",
            align: 'right' as const,
            render: (record: any) => (
                <Space>
                    <Tooltip title="Download">
                        <Button 
                            type="text" 
                            icon={<DownloadOutlined />} 
                            style={{ color: '#1890ff' }}
                            onClick={() => documentActions?.downloadDocument(record.id, record.fileName)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />} 
                            onClick={() => documentActions?.deleteDocument(record.id)}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '0 24px' }}>
            <div style={{ marginBottom: 32 }}>
                <Text style={{ color: '#595959', letterSpacing: '2px', fontSize: '10px', fontWeight: 700 }}>
                    KNOWLEDGE BASE
                </Text>
                <Title level={2} className={styles.pageTitle} style={{ margin: 0, marginTop: 4 }}>
                    DOCUMENT REPOSITORY
                </Title>
            </div>

            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                {/* Upload Section */}
                <Card style={{ width: 350, background: '#141414', border: '1px solid #303030' }}>
                    <Title level={5} style={{ color: '#d9d9d9', marginBottom: 16 }}>Upload Files</Title>
                    <div style={{ marginBottom: 16 }}>
                        <Text style={{ color: '#8c8c8c', fontSize: '11px', display: 'block', marginBottom: 8 }}>TARGET CATEGORY</Text>
                        <Select 
                            style={{ width: '100%' }} 
                            placeholder="Select Category"
                            defaultValue={DocumentCategory.General}
                            onChange={(val) => setSelectedCategory(val)}
                        >
                            <Select.Option value={DocumentCategory.General}>General</Select.Option>
                            <Select.Option value={DocumentCategory.Contract}>Contract</Select.Option>
                            <Select.Option value={DocumentCategory.Proposal}>Proposal</Select.Option>
                            <Select.Option value={DocumentCategory.Invoice}>Invoice</Select.Option>
                        </Select>
                    </div>
                    <Dragger 
                        customRequest={handleUpload}
                        showUploadList={false}
                        multiple={false}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined style={{ color: '#1890ff' }} />
                        </p>
                        <p className="ant-upload-text" style={{ color: '#d9d9d9' }}>Click or drag to upload</p>
                        <p className="ant-upload-hint" style={{ color: '#595959', fontSize: '12px' }}>
                            Support for PDF, DOCX, XLSX (Max 50MB)
                        </p>
                    </Dragger>
                </Card>

                {/* List Section */}
                <div style={{ flex: 1 }}>
                    <div className={styles.filterSection} style={{ marginBottom: 16 }}>
                        <Select 
                            placeholder="Filter by Category" 
                            style={{ width: 200 }}
                            allowClear
                            onChange={(val) => documentActions?.updateFilters({ category: val, pageNumber: 1 })}
                        >
                            {Object.entries(categoryMap).map(([key, val]) => (
                                <Select.Option key={key} value={parseInt(key)}>{val.label}</Select.Option>
                            ))}
                        </Select>
                    </div>

                    <Table 
                        columns={columns} 
                        dataSource={documents} 
                        loading={isPending}
                        rowKey="id"
                        className={styles.customTable}
                        pagination={{
                            total: totalCount,
                            current: filters.pageNumber,
                            pageSize: filters.pageSize,
                            onChange: (page) => documentActions?.updateFilters({ pageNumber: page })
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default function DocumentPage() {
    return (
        <DocumentProvider>
            <DocumentManagerContent />
        </DocumentProvider>
    );
}