import { createAction } from "redux-actions";
import { IUser, IAuthStateContext } from "./context";

export enum AuthActionEnums {
    authPending = "AUTH_PENDING",
    authError = "AUTH_ERROR",
    loginSuccess = "LOGIN_SUCCESS",
    registerSuccess = "REGISTER_SUCCESS",
    logout = "LOGOUT",
    setUser = "SET_USER"
}

export const authPending = createAction<IAuthStateContext>(
    AuthActionEnums.authPending,
    () => ({ isPending: true, isSuccess: false, isError: false, isAuthenticated: false })
);

export const authError = createAction<IAuthStateContext>(
    AuthActionEnums.authError,
    () => ({ isError: true, isPending: false, isSuccess: false, isAuthenticated: false })
);

export const loginSuccess = createAction<IAuthStateContext, IUser>(
    AuthActionEnums.loginSuccess,
    (user: IUser) => ({ isSuccess: true, isPending: false, isError: false, user, isAuthenticated: true })
);

export const logoutAction = createAction<IAuthStateContext>(
    AuthActionEnums.logout,
    () => ({ isPending: false, isSuccess: false, isError: false, isAuthenticated: false, user: undefined })
);