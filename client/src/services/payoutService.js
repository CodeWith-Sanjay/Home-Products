import { api } from './api';

export const getSellerEarningsSummary = async (sellerId) => {
    try {
        const res = await api.get(`/payout/summary/${sellerId}`);
        return res.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Network error" };
    }
};

export const getSellerPayoutHistory = async (sellerId) => {
    try {
        const res = await api.get(`/payout/history/${sellerId}`);
        return res.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Network error" };
    }
};

export const getPendingCommissions = async (sellerId) => {
    try {
        const res = await api.get(`/payout/pending/${sellerId}`);
        return res.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Network error" };
    }
};

export const initiatePayout = async (payoutData) => {
    try {
        const res = await api.post('/payout/initiate', payoutData);
        return res.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Network error" };
    }
};
