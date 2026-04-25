import { pool } from '../configs/db.js';

export const getAdminSettings = async (req, res) => {
    const { adminId } = req.params;
    try {
        const result = await pool.query(
            "SELECT key, value FROM admin_settings WHERE admin_id = $1 OR admin_id IS NULL",
            [adminId]
        );
        
        // Merge settings: admin-specific overrides global (if any global settings are added later)
        const settings = {};
        result.rows.forEach(row => {
            settings[row.key] = row.value;
        });
        
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching settings", error: error.message });
    }
};

export const updateAdminSettings = async (req, res) => {
    const { adminId } = req.params;
    const { settings } = req.body; // Expecting an object like { "new_orders": true, "cod_enabled": false }
    
    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            for (const [key, value] of Object.entries(settings)) {
                await client.query(
                    `INSERT INTO admin_settings (admin_id, key, value, updated_at)
                     VALUES ($1, $2, $3, NOW())
                     ON CONFLICT (admin_id, key) 
                     DO UPDATE SET value = $3, updated_at = NOW()`,
                    [adminId, key, JSON.stringify(value)]
                );
            }
            
            await client.query('COMMIT');
            res.status(200).json({ success: true, message: "Settings updated successfully" });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating settings", error: error.message });
    }
};

export const getAdminNotifications = async (req, res) => {
    const { adminId } = req.params;
    try {
        const result = await pool.query(
            "SELECT * FROM notifications WHERE admin_id = $1 OR admin_id IS NULL ORDER BY created_at DESC LIMIT 50",
            [adminId]
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching notifications", error: error.message });
    }
};
