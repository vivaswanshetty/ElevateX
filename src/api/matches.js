import api from './axios';

export const getAIMatches = async () => {
    const response = await api.get('/matches');
    return response.data;
};
