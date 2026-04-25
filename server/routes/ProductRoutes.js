import express from 'express';
import { addProduct, getProducts, getProductsById, getCategories, getProductBySlug, addVariants, updateProduct, deleteProduct, searchProducts, updateVariant } from '../controllers/ProductController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const productRoutes = express.Router();

productRoutes.post('/add', verifyToken, addProduct);
productRoutes.post('/add-variants', verifyToken, addVariants);
productRoutes.get('/allproducts', getProducts);
productRoutes.get('/categories', getCategories);
productRoutes.get('/search', searchProducts);
productRoutes.get('/slug/:slug', getProductBySlug);
productRoutes.put('/variant/:variant_id', verifyToken, updateVariant);
productRoutes.put('/:product_id', verifyToken, updateProduct);
productRoutes.delete('/:product_id', verifyToken, deleteProduct);
productRoutes.get('/:product_id', getProductsById);

export default productRoutes