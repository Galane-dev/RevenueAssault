"use client";

import React, { useReducer, useMemo, useCallback } from 'react';
import { documentReducer } from './reducer';
import { DocumentStateContext, DocumentActionContext, INITIAL_STATE } from './context';
import { setPending, setDocuments, setError, setFilters } from './actions';
import { getAxiosInstance } from '../../utils/axiosInstance';


export { DocumentStateContext, DocumentActionContext };

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(documentReducer, INITIAL_STATE);

    const getDocuments = useCallback(async (filters: any) => {
        dispatch(setPending());
        try {
            const response = await getAxiosInstance().get("/api/documents", { params: filters });
            dispatch(setDocuments(response.data));
        } catch (e) {
            dispatch(setError());
        }
    }, []);

    const actions = useMemo(() => ({
        getDocuments,
        uploadDocument: async (formData: FormData) => {
            dispatch(setPending());
            try {
                // Axios automatically sets multipart/form-data headers when sending FormData
                await getAxiosInstance().post("/api/documents/upload", formData);
                getDocuments(state.filters);
            } catch (e) {
                dispatch(setError());
                throw e;
            }
        },
        downloadDocument: async (id: string, fileName: string) => {
            try {
                const response = await getAxiosInstance().get(`/api/documents/${id}/download`, {
                    responseType: 'blob', // Critical for file downloads
                });
                
                // Create a temporary link to trigger the browser download
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                link.remove();
            } catch (e) {
                console.error("Download failed", e);
            }
        },
        deleteDocument: async (id: string) => {
            try {
                await getAxiosInstance().delete(`/api/documents/${id}`);
                getDocuments(state.filters);
            } catch (e) {
                dispatch(setError());
            }
        },
        updateFilters: (newFilters: any) => {
            dispatch(setFilters({ filters: newFilters }));
        }
    }), [getDocuments, state.filters]);

    return (
        <DocumentStateContext.Provider value={state}>
            <DocumentActionContext.Provider value={actions}>
                {children}
            </DocumentActionContext.Provider>
        </DocumentStateContext.Provider>
    );
};