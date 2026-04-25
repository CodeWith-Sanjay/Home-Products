import { pool } from '../configs/db.js';

// Get earnings summary for a seller
export const getSellerEarningsSummary = async (req, res) => {
    const { sellerId } = req.params;
    try {
        const result = await pool.query(`
            SELECT 
                COALESCE(SUM(CASE WHEN LOWER(status) = 'pending' THEN seller_earnings ELSE 0 END), 0) as pending_earnings,
                COALESCE(SUM(CASE WHEN LOWER(status) = 'paid' THEN seller_earnings ELSE 0 END), 0) as paid_earnings,
                COALESCE(SUM(CASE WHEN LOWER(status) = 'paid' THEN seller_earnings ELSE 0 END), 0) as total_earnings
            FROM seller_commissions
            WHERE seller_id = $1
        `, [sellerId]);

        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching earnings summary", error: error.message });
    }
};

// Get payout history for a seller
export const getSellerPayoutHistory = async (req, res) => {
    const { sellerId } = req.params;
    try {
        const result = await pool.query(
            "SELECT * FROM seller_payouts WHERE seller_id = $1 ORDER BY created_at DESC",
            [sellerId]
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching payout history", error: error.message });
    }
};

// Get all pending commissions for a seller (eligible for payout)
export const getPendingCommissions = async (req, res) => {
    const { sellerId } = req.params;
    try {
        const result = await pool.query(
            "SELECT * FROM seller_commissions WHERE seller_id = $1 AND LOWER(status) = 'pending' ORDER BY created_at ASC",
            [sellerId]
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching pending commissions", error: error.message });
    }
};

// Admin: Initiate a payout for a seller
export const initiatePayout = async (req, res) => {
    const { seller_id, admin_id, amount, payment_method, transaction_ref, notes, payout_period_start, payout_period_end } = req.body;
    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Create the payout record
        const payoutRes = await client.query(`
            INSERT INTO seller_payouts (
                seller_id, initiated_by_admin_id, amount, payment_method, transaction_ref, 
                payout_period_start, payout_period_end, status, notes, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending', $8, NOW())
            RETURNING payout_id
        `, [seller_id, admin_id, amount, payment_method, transaction_ref, payout_period_start, payout_period_end, notes]);

        const payoutId = payoutRes.rows[0].payout_id;

        // 2. Update the commissions to 'paid' status for that period (or specific IDs if provided)
        // For simplicity, we'll update all pending commissions for this seller within the period
        await client.query(`
            UPDATE seller_commissions 
            SET status = 'Paid' 
            WHERE seller_id = $1 
            AND LOWER(status) = 'pending' 
            AND created_at >= $2 
            AND created_at <= $3
        `, [seller_id, payout_period_start, payout_period_end]);

        // 3. Log the finance transaction
        await client.query(`
            INSERT INTO finance_transactions (
                seller_payout_id, transaction_type, amount, created_at
            ) VALUES ($1, 'payout', $2, NOW())
        `, [payoutId, amount]);

        await client.query('COMMIT');
        res.status(200).json({ success: true, message: "Payout initiated successfully", payout_id: payoutId });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: "Failed to initiate payout", error: error.message });
    } finally {
        client.release();
    }
};
