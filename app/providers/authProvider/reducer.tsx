import { handleActions } from "redux-actions";
import { IAuthStateContext, INITIAL_AUTH_STATE } from "./context";
import { AuthActionEnums } from "./actions";

export const AuthReducer = handleActions<IAuthStateContext, any>(
    {
        [AuthActionEnums.authPending]: (state, action) => ({
            ...state,
            ...action.payload,
        }),
        [AuthActionEnums.authError]: (state, action) => ({
            ...state,
            ...action.payload,
        }),
        [AuthActionEnums.loginSuccess]: (state, action) => ({
            ...state,
            ...action.payload,
        }),
        [AuthActionEnums.logout]: () => INITIAL_AUTH_STATE,
    },
    INITIAL_AUTH_STATE
);