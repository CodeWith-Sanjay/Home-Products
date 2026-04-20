import { pool } from '../configs/db.js';

import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import { 
  customerOnboarding, 
  getCustomerById, 
  loginCustomer, 
  logoutCustomer,
  registerCustomer, 
  updateCustomer, 
  getCustomerStats, 
  getCustomerOrders, 
  getCustomerAddresses,
  sendOTP,
  verifyOTP 
} from '../controllers/AuthController/customerController.js';
import { registerSeller, sellerOnboarding, loginSeller, logoutSeller, getSellerStats, getSellerDashboardData, getSellerOrders, getSellerCustomers, getSellerProfile, updateSellerProfile, getSellerPayments, getSellerFinanceAnalytics, getSellerNotifications, markNotificationRead } from '../controllers/AuthController/sellerController.js';

const authRoutes = express.Router();

authRoutes.post('/customer/register', registerCustomer);
authRoutes.post('/customer/login', loginCustomer);
authRoutes.post('/customer/logout', logoutCustomer);
authRoutes.post('/customer-onboarding/:id', customerOnboarding);
authRoutes.put('/customer/update/:id', updateCustomer);
authRoutes.get('/customer/:id', getCustomerById);
authRoutes.get('/customer/stats/:id', getCustomerStats);
authRoutes.get('/customer/orders/:id', getCustomerOrders);
authRoutes.get('/customer/addresses/:id', getCustomerAddresses);
authRoutes.post('/customer/send-otp', sendOTP);
authRoutes.post('/customer/verify-otp', verifyOTP);

authRoutes.post('/seller/register', registerSeller);
authRoutes.post('/seller/login', loginSeller);
authRoutes.post('/seller/logout', logoutSeller);
authRoutes.post('/seller-onboarding/:id', sellerOnboarding);
authRoutes.get('/seller/stats/:id', getSellerStats);
authRoutes.get('/seller/dashboard/:id', getSellerDashboardData);
authRoutes.get('/seller/orders/:id', getSellerOrders);
authRoutes.get('/seller/customers/:id', getSellerCustomers);
authRoutes.get('/seller/profile/:id', getSellerProfile);
authRoutes.put('/seller/profile/:id', updateSellerProfile);
authRoutes.get('/seller/payments/:id', getSellerPayments);
authRoutes.get('/seller/finance-analytics/:id', getSellerFinanceAnalytics);
authRoutes.post('/seller/send-otp', sendOTP);
authRoutes.post('/seller/verify-otp', verifyOTP);

authRoutes.get('/seller/notifications/:id', getSellerNotifications);
authRoutes.patch('/seller/notifications/:notification_id/read', markNotificationRead);

export default authRoutes