import express from 'express';
import { 
    getSellerEarningsSummary, 
    getSellerPayoutHistory, 
    getPendingCommissions, 
    initiatePayout 
} from '../controllers/PayoutController.js';

const router = express.Router();

router.get('/summary/:sellerId', getSellerEarningsSummary);
router.get('/history/:sellerId', getSellerPayoutHistory);
router.get('/pending/:sellerId', getPendingCommissions);
router.post('/initiate', initiatePayout);

export default router;
