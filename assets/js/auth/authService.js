import { AUTH_TOKEN_KEY } from '../utils/constants.js';

export const authService = {
    saveToken: (token) => {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
    },
    getToken: () => {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    },
    logout: () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        window.location.href = "/pages/auth/login.html";
    }
};