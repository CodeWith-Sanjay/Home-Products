import { api } from "./api";

export const addProduct = async (productData) => {
    try {
        const res = await api.post('/product/add', productData);
        return res.data
    } catch (error) {
        return { success: false, error: error?.response?.data?.message || error.message }
    }
}

export const addVariants = async (variantData) => {
    try {
        const res = await api.post('/product/add-variants', variantData);
        return res.data
    } catch (error) {
        return { success: false, error: error?.response?.data?.message || error.message }
    }
}

export const getProducts = async () => {
    try {
        const res = await api.get('/product/allproducts');
        return res.data
    } catch (error) {
        return { success: false, error: error?.response?.data?.message || error.message }
    }
}

export const getProductById = async (id) => {
    try {
        const res = await api.get(`/product/${id}`);
        return res.data
    } catch (error) {
        return { success: false, error: error?.response?.data?.message || error.message }
    }
}

export const getProductBySlug = async (slug) => {
    try {
        const res = await api.get(`/product/slug/${slug}`);
        return res.data
    } catch (error) {
        return { success: false, error: error?.response?.data?.message || error.message }
    }
}

export const getCategories = async () => {
    try {
        const res = await api.get('/product/categories');
        return res.data
    } catch (error) {
        return { success: false, error: error?.response?.data?.message || error.message }
    }
}

export const updateProduct = async (id, productData) => {
    try {
        const res = await api.put(`/product/${id}`, productData);
        return res.data
    } catch (error) {
        return { success: false, error: error?.response?.data?.message || error.message }
    }
}

export const deleteProduct = async (id) => {
    try {
        const res = await api.delete(`/product/${id}`);
        return res.data
    } catch (error) {
        return { success: false, error: error?.response?.data?.message || error.message }
    }
}