import express from 'express';
import { 
    getSellerPickups, 
    addPickupLocation, 
    updatePickupLocation, 
    deletePickupLocation 
} from '../controllers/PickupController.js';

const router = express.Router();

router.get('/seller/:sellerId', getSellerPickups);
router.post('/add', addPickupLocation);
router.patch('/update/:pickupId', updatePickupLocation);
router.delete('/:pickupId', deletePickupLocation);

export default router;
