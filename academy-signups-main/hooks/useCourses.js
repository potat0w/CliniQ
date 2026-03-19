import { useState } from "react";

const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

export const useCourses = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);

  const getToken = () => localStorage.getItem("token");

  const createCourse = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setLoading(false);
        throw new Error("Not authenticated");
      }
      const body = JSON.stringify(data);
      const response = await fetch(`${API_URL}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });
      const text = await response.text();
      const result = text
        ? (() => {
            try {
              return JSON.parse(text);
            } catch {
              return {};
            }
          })()
        : {};
      if (!response.ok) {
        const msg =
          result.message ||
          result.error ||
          (Array.isArray(result.errors) && result.errors[0]?.message) ||
          (result.errors && typeof result.errors === "string") ||
          (result.errors &&
            typeof result.errors === "object" &&
            Object.values(result.errors).flat()[0]) ||
          `Server error (${response.status}). Try again or check the backend.`;
        throw new Error(msg);
      }
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const getAllCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/courses`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch courses");
      }

      setCourses(result.courses);
      setLoading(false);
      return result.courses;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const getTeacherCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/courses/teacher`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch courses");
      }

      setCourses(result.courses);
      setLoading(false);
      return result.courses;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const getCourseById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/courses/${id}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch course");
      }

      setLoading(false);
      return result.course;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const updateCourse = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/courses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update course");
      }

      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const deleteCourse = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/courses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete course");
      }

      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const enrollCourse = async (courseId) => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setLoading(false);
        throw new Error("Not authenticated");
      }
      const response = await fetch(`${API_URL}/courses/${courseId}/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const text = await response.text();
      const result = text
        ? (() => {
            try {
              return JSON.parse(text);
            } catch {
              return {};
            }
          })()
        : {};
      if (!response.ok) {
        const msg =
          result.message ||
          result.error ||
          `Failed to join course (${response.status})`;
        throw new Error(msg);
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
    courses,
    createCourse,
    getAllCourses,
    getTeacherCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    enrollCourse,
  };
};
