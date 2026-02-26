"use client";

import React, { useReducer, useMemo, useCallback } from 'react';
import { noteReducer } from './reducer';
import { NoteStateContext, NoteActionContext, INITIAL_STATE, INote } from './context';
import { getAxiosInstance } from '../../utils/axiosInstance';
import { message } from 'antd';
import { NoteActions } from './actions';

export { NoteStateContext, NoteActionContext };

export const NoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(noteReducer, INITIAL_STATE);

    const getNotes = useCallback(async (params: any) => {
        dispatch({ type: NoteActions.SetPending });
        try {
            const res = await getAxiosInstance().get("/api/notes", { params });
            console.log("Notes from server:", res.data);
            dispatch({ type: NoteActions.SetNotes, payload: res.data });
        } catch (e) { console.error(e); }
    }, []);

    const addNote = async (noteData: Partial<INote>) => {
        dispatch({ type: NoteActions.SetPending });
        try {
            const res = await getAxiosInstance().post("/api/notes", noteData);
            dispatch({ type: NoteActions.AddNote, payload: res.data });
            message.success("Note added");
        } catch (e) { message.error("Failed to add note"); }
    };

    const updateNote = async (id: string, content: string, isPrivate: boolean) => {
        try {
            const res = await getAxiosInstance().put(`/api/notes/${id}`, { content, isPrivate });
            dispatch({ type: NoteActions.UpdateNote, payload: res.data });
            message.success("Note updated");
        } catch (e) { message.error("Update failed"); }
    };

    const deleteNote = async (id: string) => {
        try {
            await getAxiosInstance().delete(`/api/notes/${id}`);
            dispatch({ type: NoteActions.DeleteNote, payload: id });
            message.success("Note deleted");
        } catch (e) { message.error("Delete failed"); }
    };

    const actions = useMemo(() => ({
        getNotes,
        addNote,
        updateNote,
        deleteNote,
        clearNotes: () => dispatch({ type: NoteActions.Clear })
    }), [getNotes]);

    return (
        <NoteStateContext.Provider value={state}>
            <NoteActionContext.Provider value={actions}>
                {children}
            </NoteActionContext.Provider>
        </NoteStateContext.Provider>
    );
};