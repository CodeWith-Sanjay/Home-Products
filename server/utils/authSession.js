import { pool } from '../configs/db.js';
import crypto from 'crypto';

/**
 * Creates a new authentication session in the database
 * @param {string} userId - UUID of the customer or seller
 * @param {string} userType - 'customer' or 'seller'
 * @param {string} ip - IP address of the user
 * @param {object} device - Device information (parsed from user-agent)
 * @returns {object} - { sessionId, token }
 */
export const createAuthSession = async (userId, userType, ip, device = {}) => {
  try {
    // 1. Generate a random session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    
    // 2. Hash the token for secure storage
    const tokenHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
    
    // 3. Set expiration (default 30 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // 4. Insert into auth_sessions table
    const query = `
      INSERT INTO auth_sessions (
        session_id, user_ref_id, user_type, token_hash, 
        ip_address, device_info, expires_at
      ) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
      RETURNING session_id;
    `;

    const values = [
      userId, 
      userType, 
      tokenHash, 
      ip || '127.0.0.1', 
      JSON.stringify(device || {}), 
      expiresAt
    ];
    
    const result = await pool.query(query, values);
    
    return {
      sessionId: result.rows[0].session_id,
      token: sessionToken
    };
  } catch (error) {
    console.error("CREATE SESSION ERROR:", error.message);
    throw new Error("Could not create authentication session");
  }
};

/**
 * Invalidates a specific session (Logout)
 */
export const invalidateSession = async (sessionId) => {
  await pool.query(
    "UPDATE auth_sessions SET is_blacklisted = true WHERE session_id = $1",
    [sessionId]
  );
};

/**
 * Invalidates all sessions for a user (Security Reset)
 */
export const invalidateAllUserSessions = async (userId) => {
  await pool.query(
    "UPDATE auth_sessions SET is_blacklisted = true WHERE user_ref_id = $1",
    [userId]
  );
};
