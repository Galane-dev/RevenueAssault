"use client";

import React, { useReducer, useMemo, useCallback } from 'react';
import { contactReducer } from './reducer';
import { ContactStateContext, ContactActionContext, INITIAL_STATE } from './context';
import { setPending, setContacts, setError, setFilters } from './actions';
import { getAxiosInstance } from '../../utils/axiosInstance';

export { ContactStateContext, ContactActionContext };

export const ContactProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(contactReducer, INITIAL_STATE);

    const getContacts = useCallback(async (filters: any) => {
        dispatch(setPending());
        try {
            const response = await getAxiosInstance().get("/api/contacts", { params: filters });
            // API expected response: { items: IContact[], totalCount: number }
            dispatch(setContacts(response.data));
        } catch (e) {
            dispatch(setError());
        }
    }, []);

    const actions = useMemo(() => ({
        getContacts,
        createContact: async (values: any) => {
            dispatch(setPending());
            try {
                await getAxiosInstance().post("/api/contacts", values);
                getContacts(state.filters);
            } catch (e) {
                dispatch(setError());
                throw e;
            }
        },
        setPrimary: async (id: string) => {
            try {
                await getAxiosInstance().put(`/api/contacts/${id}/set-primary`);
                getContacts(state.filters);
            } catch (e) {
                dispatch(setError());
            }
        },
        updateFilters: (newFilters: any) => {
            dispatch(setFilters({ filters: newFilters }));
        }
    }), [getContacts, state.filters]);

    return (
        <ContactStateContext.Provider value={state}>
            <ContactActionContext.Provider value={actions}>
                {children}
            </ContactActionContext.Provider>
        </ContactStateContext.Provider>
    );
};