import express from 'express';
import { initiateShipment, syncTracking } from '../controllers/ShipmentController.js';

const router = express.Router();

router.post('/initiate/:orderId', initiateShipment);
router.get('/track/:orderId', syncTracking);

export default router;
