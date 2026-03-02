"use client";

import React, { useReducer, useMemo, useCallback } from 'react';
import { userReducer } from './reducer';
import { UserStateContext, UserActionContext, INITIAL_STATE, IUser } from './context';
import { setPending, setUsers, setError, setFilters } from './actions';
import { getAxiosInstance } from '../../utils/axiosInstance';

export { UserStateContext, UserActionContext };

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(userReducer, INITIAL_STATE);

    const getUsers = useCallback(async (filters: any) => {
        // Updated to pass 'true'
        dispatch(setPending(true)); 
        try {
            const response = await getAxiosInstance().get("/api/users", { params: filters });
            // dispatching setUsers sets isPending to false automatically based on your actions.ts
            dispatch(setUsers(response.data)); 
        } catch (e) {
            dispatch(setError());
        }
    }, []);

    const actions = useMemo(() => ({
        getUsers,

        getUserById: async (id: string): Promise<IUser | undefined> => {
            // Updated to pass 'true'
            dispatch(setPending(true)); 
            try {
                const response = await getAxiosInstance().get(`/api/users/${id}`);
                
                // Explicitly set to false since we aren't calling setUsers here
                dispatch(setPending(false)); 
                return response.data;
            } catch (e) {
                dispatch(setError());
                return undefined;
            }
        },

        updateFilters: (newFilters: any) => {
            dispatch(setFilters({ filters: newFilters }));
        }
    }), [getUsers]);

    return (
        <UserStateContext.Provider value={state}>
            <UserActionContext.Provider value={actions}>
                {children}
            </UserActionContext.Provider>
        </UserStateContext.Provider>
    );
};