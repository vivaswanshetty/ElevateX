import api from './axios';

export const createTask = async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
};

export const getTasks = async () => {
    const response = await api.get('/tasks');
    return response.data;
};

export const getTaskById = async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
};

export const applyForTask = async (id) => {
    const response = await api.put(`/tasks/${id}/apply`);
    return response.data;
};

export const assignTask = async (id, applicantId) => {
    const response = await api.put(`/tasks/${id}/assign`, { applicantId });
    return response.data;
};

export const completeTask = async (id) => {
    const response = await api.put(`/tasks/${id}/complete`);
    return response.data;
};

export const addTaskMessage = async (id, text) => {
    const response = await api.post(`/tasks/${id}/chat`, { text });
    return response.data;
};

export const updateTask = async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
};

export const deleteTask = async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
};
