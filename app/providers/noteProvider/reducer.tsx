import { INoteStateContext, INote,INITIAL_STATE } from "./context";
import { NoteActions } from "./actions";

export const noteReducer = (state: INoteStateContext, action: any): INoteStateContext => {
    switch (action.type) {
        case NoteActions.SetPending:
            return { ...state, isPending: true };
        case NoteActions.AddNote:
            return { 
                ...state, 
                // Ensure state.notes is an array before spreading
                notes: [action.payload, ...(Array.isArray(state.notes) ? state.notes : [])], 
                isPending: false 
            };

        case NoteActions.SetNotes:
            console.log("Reducer received payload:", action.payload); // <--- Add this
            return { 
                ...state, 
                notes: Array.isArray(action.payload) ? action.payload : (action.payload?.items || []), 
                isPending: false 
            };
        case NoteActions.UpdateNote:
            return { 
                ...state, 
                notes: state.notes.map(n => n.id === action.payload.id ? action.payload : n),
                isPending: false 
            };
        case NoteActions.DeleteNote:
            return { 
                ...state, 
                notes: state.notes.filter(n => n.id !== action.payload),
                isPending: false 
            };
        case NoteActions.Clear:
            return INITIAL_STATE;
        default:
            return state;
    }
};