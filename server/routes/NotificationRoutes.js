import express from 'express';
import { 
    getCustomerNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
} from '../controllers/NotificationController.js';

const router = express.Router();

router.get('/customer/:customerId', getCustomerNotifications);
router.patch('/read/:notificationId', markAsRead);
router.patch('/read-all/customer/:customerId', markAllAsRead);
router.delete('/:notificationId', deleteNotification);

export default router;
