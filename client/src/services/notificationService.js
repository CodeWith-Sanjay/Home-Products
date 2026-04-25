import { api } from './api';

export const getCustomerNotifications = async (customerId) => {
    try {
        const res = await api.get(`/notification/customer/${customerId}`);
        return res.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Network error" };
    }
};

export const markNotificationAsRead = async (notificationId) => {
    try {
        const res = await api.patch(`/notification/read/${notificationId}`);
        return res.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Network error" };
    }
};

export const markAllNotificationsAsRead = async (customerId) => {
    try {
        const res = await api.patch(`/notification/read-all/customer/${customerId}`);
        return res.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Network error" };
    }
};

export const deleteNotification = async (notificationId) => {
    try {
        const res = await api.delete(`/notification/${notificationId}`);
        return res.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Network error" };
    }
};
