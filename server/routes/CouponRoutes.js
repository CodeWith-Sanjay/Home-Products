import express from 'express';
import { getActiveCoupons, validateCoupon, getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from '../controllers/CouponController.js';

const router = express.Router();

router.get('/active', getActiveCoupons);
router.post('/validate', validateCoupon);
router.get('/all', getAllCoupons);
router.post('/create', createCoupon);
router.put('/update/:id', updateCoupon);
router.delete('/delete/:id', deleteCoupon);

export default router;
