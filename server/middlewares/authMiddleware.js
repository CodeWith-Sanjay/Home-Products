import { pool } from '../configs/db.js';
import crypto from 'crypto';

export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // If no token, we can still proceed but req.user will be undefined
            // and logAction will skip logging.
            return next();
        }

        const token = authHeader.split(' ')[1];
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const query = `
            SELECT s.*, a.name as admin_name, a.email as admin_email, sel.store_name, sel.email as seller_email
            FROM auth_sessions s
            LEFT JOIN admins a ON s.user_ref_id = a.admin_id AND s.user_type = 'admin'
            LEFT JOIN sellers sel ON s.user_ref_id = sel.seller_id AND s.user_type = 'seller'
            WHERE s.token_hash = $1 AND s.expires_at > NOW() AND s.is_blacklisted = false
        `;

        const result = await pool.query(query, [tokenHash]);

        if (result.rows.length > 0) {
            const session = result.rows[0];
            req.user = {
                id: session.user_ref_id,
                type: session.user_type,
                email: session.admin_email || session.seller_email,
                name: session.admin_name || session.store_name
            };
        }

        next();
    } catch (error) {
        console.error("AUTH MIDDLEWARE ERROR:", error.message);
        next();
    }
};
