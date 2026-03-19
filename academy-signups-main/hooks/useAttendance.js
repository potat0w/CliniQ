import { useState } from 'react';

const API_URL = (import.meta.env?.VITE_API_URL) || 'http://localhost:5000/api';

export const useAttendance = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [attendance, setAttendance] = useState([]);

    const getToken = () => localStorage.getItem('token');

    const markAttendance = async (qrToken) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/attendance/mark`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ qr_token: qrToken })
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to mark attendance');
            }

            setLoading(false);
            return result;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const getSessionAttendance = async (sessionId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/attendance/session/${sessionId}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch attendance');
            }

            setAttendance(result.attendance);
            setLoading(false);
            return result;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const getCourseAttendance = async (courseId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/attendance/course/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch attendance');
            }

            setAttendance(result.attendance);
            setLoading(false);
            return result;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const getStudentAttendance = async (studentId, courseId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/attendance/student/${studentId}/course/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch attendance');
            }

            setAttendance(result.attendance);
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
        attendance,
        markAttendance,
        getSessionAttendance,
        getCourseAttendance,
        getStudentAttendance
    };
};

