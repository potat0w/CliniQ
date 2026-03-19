import { useState } from 'react';

const API_URL = (import.meta.env?.VITE_API_URL) || 'http://localhost:5000/api';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const signup = async (data, role) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/auth/${role}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Signup failed');
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            localStorage.setItem('role', role);
            setLoading(false);
            return result;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const login = async (email, password, role) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/auth/${role}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Login failed');
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            localStorage.setItem('role', role);
            setLoading(false);
            return result;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
    };

    const getToken = () => localStorage.getItem('token');
    const getUser = () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    };
    const getRole = () => localStorage.getItem('role');
    const isAuthenticated = () => !!localStorage.getItem('token');

    return { loading, error, signup, login, logout, getToken, getUser, getRole, isAuthenticated };
};
