import { useState } from 'react';

const API_URL = (import.meta.env?.VITE_API_URL) || 'http://localhost:5000/api';

export const useSessions = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sessions, setSessions] = useState([]);

    const getToken = () => localStorage.getItem('token');

    const createSession = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to create session');
            }
            
            setLoading(false);
            return result;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const getCourseSessions = async (courseId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/sessions/course/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch sessions');
            }
            
            setSessions(result.sessions);
            setLoading(false);
            return result.sessions;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const getSessionById = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/sessions/${id}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch session');
            }
            
            setLoading(false);
            return result.session;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const updateSession = async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/sessions/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to update session');
            }
            
            setLoading(false);
            return result;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const deleteSession = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/sessions/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to delete session');
            }
            
            setLoading(false);
            return result;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    return {
        loading,
        error,
        sessions,
        createSession,
        getCourseSessions,
        getSessionById,
        updateSession,
        deleteSession
    };
};

