import express from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/CartController.js';

const cartRoutes = express.Router();

cartRoutes.get('/:customer_id', getCart);
cartRoutes.post('/add', addToCart);
cartRoutes.patch('/update', updateCartItem);
cartRoutes.delete('/remove/:cart_item_id', removeFromCart);
cartRoutes.delete('/clear/:customer_id', clearCart);

export default cartRoutes;
