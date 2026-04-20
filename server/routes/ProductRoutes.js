import express from 'express';
import { addProduct, getProducts, getProductsById, getCategories, getProductBySlug, addVariants, updateProduct, deleteProduct } from '../controllers/ProductController.js';

const productRoutes = express.Router();

productRoutes.post('/add', addProduct);
productRoutes.post('/add-variants', addVariants);
productRoutes.get('/allproducts', getProducts);
productRoutes.get('/categories', getCategories);
productRoutes.get('/slug/:slug', getProductBySlug);
productRoutes.put('/:product_id', updateProduct);
productRoutes.delete('/:product_id', deleteProduct);
productRoutes.get('/:product_id', getProductsById);

export default productRoutes