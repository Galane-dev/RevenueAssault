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
                await getAxiosInstance().post("/api/documents/upload", formData, {
                    // THE FIX: Explicitly tell Axios NOT to handle content-type. 
                    // The browser must set the boundary itself.
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    // Prevent global interceptors from trying to JSON.stringify this
                    transformRequest: [(data) => data], 
                });
                
                // Refresh the list after successful upload
                const response = await getAxiosInstance().get("/api/documents", { params: state.filters });
                dispatch(setDocuments(response.data));
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