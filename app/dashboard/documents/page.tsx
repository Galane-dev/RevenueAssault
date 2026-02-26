"use client";

import React, { useEffect, useContext, useState, useRef } from "react";
import { 
    Table, Typography, Button, Select, Space, 
    Tag, Card, message, Tooltip, Empty, Spin 
} from "antd";
import { 
    InboxOutlined, 
    DownloadOutlined, 
    DeleteOutlined, 
    FileTextOutlined,
    FilePdfOutlined,
    FileExcelOutlined,
    FileImageOutlined,
    CloudUploadOutlined
} from "@ant-design/icons";
import { useStyles } from "../style";
import dayjs from "dayjs";

// Providers
import { DocumentProvider, DocumentStateContext, DocumentActionContext } from "@/app/providers/documentProvider";
import { DocumentCategory } from "@/app/providers/documentProvider/context";

import relativeTime from "dayjs/plugin/relativeTime"; // 1. Import the plugin

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

/**
 * UI Mapping for File Icons based on extension
 */
const getFileIcon = (ext: string) => {
    const e = ext?.toLowerCase() || '';
    if (e.includes('pdf')) return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
    if (e.includes('xls') || e.includes('csv')) return <FileExcelOutlined style={{ color: '#52c41a' }} />;
    if (e.includes('png') || e.includes('jpg') || e.includes('jpeg')) return <FileImageOutlined style={{ color: '#1890ff' }} />;
    return <FileTextOutlined style={{ color: '#8c8c8c' }} />;
};

const categoryMap: Record<number, { color: string, label: string }> = {
    [DocumentCategory.Contract || 1]: { color: "purple", label: "Contract" },
    [DocumentCategory.Proposal || 2]: { color: "blue", label: "Proposal" },
    [DocumentCategory.Presentation || 3]: { color: "orange", label: "Presentation" },
    [DocumentCategory.Quote || 4]: { color: "green", label: "Quote" },
    [DocumentCategory.Report || 5]: { color: "cyan", label: "Report" },
    [6]: { color: "default", label: "Other" },
};

function DocumentManagerContent() {
    const { styles } = useStyles();
    const { documents, filters, totalCount, isPending } = useContext(DocumentStateContext);
    const documentActions = useContext(DocumentActionContext);
    
    const [selectedCategory, setSelectedCategory] = useState<number>(1);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        documentActions?.getDocuments(filters);
    }, [filters, documentActions]);

    /**
     * Native Upload Handler
     * Bypasses Ant Design Upload to ensure raw binary stream is preserved
     */
    const handleNativeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;

        const actualFile = fileList[0];
        const formData = new FormData();
        
        // Match Swagger PascalCase Exactly
        formData.append("File", actualFile);
        formData.append("Category", selectedCategory.toString());
        formData.append("Description", `Uploaded on ${dayjs().format('YYYY-MM-DD HH:mm')}`);

        // Only append polymorphic fields if they have valid values
        if (filters.relatedToType) {
            formData.append("RelatedToType", filters.relatedToType.toString());
        }
        if (filters.relatedToId && filters.relatedToId.length > 10) {
            formData.append("RelatedToId", filters.relatedToId);
        }

        try {
            message.loading({ content: `Uploading ${actualFile.name}...`, key: 'uploading' });
            await documentActions?.uploadDocument(formData);
            message.success({ content: 'Upload complete!', key: 'uploading' });
            
            // Clear input for next use
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) {
            message.error({ content: 'Upload failed. Check file size and type.', key: 'uploading' });
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
                            {(record.fileSize / 1024 / 1024).toFixed(2)} MB • {record.fileExtension?.toUpperCase()}
                        </Text>
                    </div>
                </Space>
            )
        },
        {
            title: "CATEGORY",
            dataIndex: "category",
            key: "category",
            render: (cat: number) => (
                <Tag color={categoryMap[cat]?.color || 'default'} bordered={false}>
                    {categoryMap[cat]?.label || 'General'}
                </Tag>
            )
        },
        {
            title: "UPLOADED",
            dataIndex: "uploadedAt",
            key: "uploadedAt",
            render: (date: string) => (
                <Tooltip title={dayjs(date).format('LLLL')}>
                    <Text style={{ color: '#8c8c8c' }}>{dayjs(date).fromNow()}</Text>
                </Tooltip>
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
                            onClick={() => {
                                if (confirm("Are you sure you want to delete this document?")) {
                                    documentActions?.deleteDocument(record.id);
                                }
                            }}
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
                    ASSET MANAGEMENT
                </Text>
                <Title level={2} className={styles.pageTitle} style={{ margin: 0, marginTop: 4 }}>
                    DOCUMENT REPOSITORY
                </Title>
            </div>

            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                {/* Fixed Upload Card */}
                <Card style={{ width: 350, background: '#141414', border: '1px solid #303030', borderRadius: '8px' }}>
                    <Title level={5} style={{ color: '#d9d9d9', marginBottom: 20 }}>Upload Center</Title>
                    
                    {/* Native Hidden Input */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        onChange={handleNativeUpload} 
                    />

                    <div style={{ marginBottom: 20 }}>
                        <Text style={{ color: '#8c8c8c', fontSize: '11px', display: 'block', marginBottom: 8 }}>
                            ASSIGN CATEGORY
                        </Text>
                        <Select 
                            style={{ width: '100%' }} 
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                        >
                            <Select.Option value={DocumentCategory.Contract}>Contract</Select.Option>
                            <Select.Option value={DocumentCategory.Proposal}>Proposal</Select.Option>
                            <Select.Option value={DocumentCategory.Presentation}>Presentation</Select.Option>
                            <Select.Option value={DocumentCategory.Quote}>Quote</Select.Option>
                            <Select.Option value={DocumentCategory.Report}>Report</Select.Option>
                            <Select.Option value={DocumentCategory.Other}>Other</Select.Option>
                        </Select>
                    </div>

                    <div 
                        style={{ 
                            border: '1px dashed #434343', 
                            padding: '32px 16px', 
                            textAlign: 'center', 
                            borderRadius: '4px',
                            background: '#0a0a0a',
                            cursor: 'pointer'
                        }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <CloudUploadOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: 12 }} />
                        <p style={{ color: '#d9d9d9', margin: 0 }}>Select File to Upload</p>
                        <p style={{ color: '#595959', fontSize: '12px', marginTop: 4 }}>PDF, DOCX, XLSX up to 50MB</p>
                    </div>

                    <Button 
                        type="primary" 
                        block 
                        style={{ marginTop: 16 }}
                        onClick={() => fileInputRef.current?.click()}
                        loading={isPending}
                        className={styles.primaryButton}
                    >
                        BROWSE FILES
                    </Button>
                </Card>

                {/* Main Table */}
                <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                        <Select 
                            placeholder="Filter by Category" 
                            style={{ width: 220 }}
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
                            onChange: (page) => documentActions?.updateFilters({ pageNumber: page }),
                            showSizeChanger: false
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