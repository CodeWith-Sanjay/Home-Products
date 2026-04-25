import axios from 'axios';

const API_URL = 'http://localhost:5000/order';

export const createOrder = async (orderData) => {
    try {
        const response = await axios.post(`${API_URL}/create`, orderData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

export const getMyOrders = async (customerId) => {
    try {
        const response = await axios.get(`${API_URL}/customer/${customerId}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

export const getOrderDetails = async (orderId) => {
    try {
        const response = await axios.get(`${API_URL}/order/${orderId}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

export const cancelOrder = async (orderId, customerId, reason) => {
    try {
        const response = await axios.patch(`${API_URL}/status/${orderId}`, {
            status: 'Cancelled',
            changed_by: customerId,
            notes: reason || 'Order cancelled by customer'
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};
