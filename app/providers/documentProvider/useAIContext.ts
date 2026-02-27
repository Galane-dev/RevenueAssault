import { useContext, useMemo } from 'react';
import { DocumentStateContext, DocumentCategory } from './context';

export const useAIDocumentsContext = () => {
    const { documents, filters, totalCount } = useContext(DocumentStateContext);

    return useMemo(() => {
        const list = documents || [];

        return {
            totalDocuments: totalCount,
            displayedDocuments: list.length,
            documents: list.map((doc) => ({
                id: doc.id,
                fileName: doc.fileName,
                fileExtension: doc.fileExtension,
                fileSize: doc.fileSize,
                category: DocumentCategory[doc.category],
                uploadedAt: doc.uploadedAt,
            })),
            summary: {
                byCategory: Object.values(DocumentCategory)
                    .filter((value) => typeof value === 'number')
                    .map((categoryValue) => ({
                        category: DocumentCategory[categoryValue as number],
                        count: list.filter((doc) => Number(doc.category) === Number(categoryValue)).length,
                    })),
            },
            filters: {
                category: filters.category ? DocumentCategory[filters.category] : null,
                relatedToType: filters.relatedToType ?? null,
                pageNumber: filters.pageNumber,
            },
        };
    }, [documents, totalCount, filters]);
};

export default useAIDocumentsContext;