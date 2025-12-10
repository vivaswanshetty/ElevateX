import api from './axios';

export const getTransactions = async () => {
    const response = await api.get(`/transactions?t=${Date.now()}`);
    return response.data;
};

export const depositCoins = async (amount) => {
    const response = await api.post('/transactions/deposit', { amount });
    return response.data;
};

export const withdrawCoins = async (amount) => {
    const response = await api.post('/transactions/withdraw', { amount });
    return response.data;
};
