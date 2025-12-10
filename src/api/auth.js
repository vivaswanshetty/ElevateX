import api from './axios';

export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const register = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get(`/users/profile?t=${Date.now()}`);
    return response.data;
};

export const updateProfile = async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
};

export const getAllUsers = async () => {
    const response = await api.get(`/users?t=${Date.now()}`);
    return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
    const response = await api.put('/users/password', { currentPassword, newPassword });
    return response.data;
};

export const deleteAccount = async () => {
    const response = await api.delete('/users/account');
    return response.data;
};
