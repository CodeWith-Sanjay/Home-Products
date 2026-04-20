import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const generateAccessToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {expiresIn: '1h'})
}