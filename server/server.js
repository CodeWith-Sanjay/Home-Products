import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import twilio from 'twilio';

import { testDB } from './configs/db.js';
import authRoutes from './routes/AuthRoutes.js';
import couponRoutes from './routes/CouponRoutes.js';
import payoutRoutes from './routes/PayoutRoutes.js';
import notificationRoutes from './routes/NotificationRoutes.js';
import pickupRoutes from './routes/PickupRoutes.js';
import productRoutes from './routes/ProductRoutes.js';
import cartRoutes from './routes/CartRoutes.js';
import wishlistRoutes from './routes/WishlistRoutes.js';
import orderRoutes from './routes/OrderRoutes.js';
import shiprocketRoutes from './routes/shiprocketRoutes.js';

const app = express();
const port = process.env.PORT || 5000

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use('/user', authRoutes);
app.use('/coupon', couponRoutes);
app.use('/payout', payoutRoutes);
app.use('/notification', notificationRoutes);
app.use('/pickup', pickupRoutes);
app.use('/product', productRoutes);
app.use('/cart', cartRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/order', orderRoutes);
app.use('/shipping', shiprocketRoutes);

app.get('/', (req, res) => res.send('SERVER IS ALIVE'));

app.listen(port, () => {
    console.log(`Server is running on localhost: ${port}`)
})

testDB()
    .catch((err) => {
        console.log('DB error: ', err)
    })