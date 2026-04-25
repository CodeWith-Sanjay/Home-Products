import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DB_URL
});

async function check() {
    try {
        const res = await pool.query("SELECT payment_method, payment_status, order_status FROM orders ORDER BY placed_at DESC LIMIT 10");
        console.log(JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
