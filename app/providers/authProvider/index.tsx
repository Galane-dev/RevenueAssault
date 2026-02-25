"use client";

import { useReducer, useContext, useEffect } from "react";
import { AuthReducer } from "./reducer";
import { INITIAL_AUTH_STATE, AuthStateContext, AuthActionContext, IUser } from "./context";
import { authPending, authError, loginSuccess, logoutAction } from "./actions";
import { getAxiosInstance } from "../../utils/axiosInstance";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(AuthReducer, INITIAL_AUTH_STATE);
    const instance = getAxiosInstance();

    // Log in and get a JWT token
    const login = async (credentials: any) => {
        dispatch(authPending());
        const endpoint = "/auth/login";
        await instance.post(endpoint, credentials)
            .then((response) => {
                const user: IUser = response.data;
                // Store token for session persistence
                localStorage.setItem("token", user.token || "");
                dispatch(loginSuccess(user));
            })
            .catch(() => {
                dispatch(authError());
            });
    };

    // Register a new user
    const register = async (details: any) => {
        dispatch(authPending());
        const endpoint = "/auth/register";
        await instance.post(endpoint, details)
            .then((response) => {
                const user: IUser = response.data;
                localStorage.setItem("token", user.token || "");
                dispatch(loginSuccess(user));
            })
            .catch(() => {
                dispatch(authError());
            });
    };

    // Log out user
    const logout = () => {
        localStorage.removeItem("token");
        dispatch(logoutAction());
    };

    // Get current logged-in user info
    const getCurrentUser = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        dispatch(authPending());
        const endpoint = "/auth/me";
        // Header handled by axiosInstance or passed explicitly if required
        await instance.get(endpoint)
            .then((response) => {
                dispatch(loginSuccess(response.data));
            })
            .catch(() => {
                dispatch(authError());
                localStorage.removeItem("token");
            });
    };

    // Initialize auth state on load
    useEffect(() => {
        getCurrentUser();
    }, []);

    return (
        <AuthStateContext.Provider value={state}>
            <AuthActionContext.Provider value={{ login, register, logout, getCurrentUser }}>
                {children}
            </AuthActionContext.Provider>
        </AuthStateContext.Provider>
    );
};

// Custom hooks following the MachineProvider standard
export const useAuthState = () => {
    const context = useContext(AuthStateContext);
    if (!context) {
        throw new Error("useAuthState must be used within an AuthProvider");
    }
    return context;
};

export const useAuthActions = () => {
    const context = useContext(AuthActionContext);
    if (!context) {
        throw new Error("useAuthActions must be used within an AuthProvider");
    }
    return context;
};