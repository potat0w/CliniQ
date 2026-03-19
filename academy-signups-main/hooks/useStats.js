import { useState } from 'react';

const API_URL = (import.meta.env?.VITE_API_URL) || 'http://localhost:5000/api';

export const useStats = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);

    const getToken = () => localStorage.getItem('token');

    const getCourseStats = async (courseId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/attendance/stats/course/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch statistics');
            }
            
            setStats(result);
            setLoading(false);
            return result;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const getStudentStats = async (studentId, courseId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/attendance/stats/student/${studentId}/course/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch statistics');
            }
            
            setStats(result);
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
        stats,
        getCourseStats,
        getStudentStats
    };
};

