// API Client for SmartTask

const API_BASE_URL = window.location.origin;

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Set token in localStorage
const setToken = (token) => localStorage.setItem('token', token);

// Remove token from localStorage
const removeToken = () => localStorage.removeItem('token');

// Get user from localStorage
const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

// Set user in localStorage
const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));

// Remove user from localStorage
const removeUser = () => localStorage.removeItem('user');

// Make authenticated API request
const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();
    
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Auth API
const authAPI = {
    register: async (username, email, password) => {
        return apiRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password }),
        });
    },

    login: async (username, password) => {
        return apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    },

    getCurrentUser: async () => {
        return apiRequest('/api/auth/me');
    },

    getAllUsers: async () => {
        return apiRequest('/api/auth/users');
    },
};

// Tasks API
const tasksAPI = {
    getAll: async () => {
        return apiRequest('/api/tasks');
    },

    getById: async (id) => {
        return apiRequest(`/api/tasks/${id}`);
    },

    create: async (taskData) => {
        return apiRequest('/api/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData),
        });
    },

    update: async (id, taskData) => {
        return apiRequest(`/api/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(taskData),
        });
    },

    delete: async (id) => {
        return apiRequest(`/api/tasks/${id}`, {
            method: 'DELETE',
        });
    },

    addComment: async (taskId, content) => {
        return apiRequest(`/api/tasks/${taskId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        });
    },
};

// Check if user is authenticated
const isAuthenticated = () => {
    return !!getToken();
};

// Logout user
const logout = () => {
    removeToken();
    removeUser();
    window.location.href = '/';
};
