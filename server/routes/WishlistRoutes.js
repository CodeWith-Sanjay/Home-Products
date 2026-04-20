import express from 'express';
import { getWishlist, addToWishlist, removeFromWishlist, clearWishlist } from '../controllers/WishlistController.js';

const wishlistRoutes = express.Router();

wishlistRoutes.get('/:customer_id', getWishlist);
wishlistRoutes.post('/add', addToWishlist);
wishlistRoutes.delete('/remove/:wishlist_item_id', removeFromWishlist);
wishlistRoutes.delete('/clear/:customer_id', clearWishlist);

export default wishlistRoutes;
