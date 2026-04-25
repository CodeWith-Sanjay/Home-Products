import { api } from './api';

export const getActiveCoupons = async () => {
    try {
        const res = await api.get('/coupon/active');
        return res.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Network error" };
    }
};

export const validateCoupon = async (code, subtotal) => {
    try {
        const res = await api.post('/coupon/validate', { code, subtotal });
        return res.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Network error" };
    }
};

export const getAllCoupons = async () => {
    try {
        const res = await api.get('/coupon/all');
        return res.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Network error" };
    }
};

export const createCoupon = async (couponData) => {
    try {
        const res = await api.post('/coupon/create', couponData);
        return res.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Network error" };
    }
};

export const updateCoupon = async (id, couponData) => {
    try {
        const res = await api.put(`/coupon/update/${id}`, couponData);
        return res.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Network error" };
    }
};

export const deleteCoupon = async (id, admin_id) => {
    try {
        const res = await api.delete(`/coupon/delete/${id}?admin_id=${admin_id}`);
        return res.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Network error" };
    }
};
