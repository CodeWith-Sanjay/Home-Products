import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DB_URL
});

async function check() {
    try {
        const res = await pool.query("SELECT column_name, column_default FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_method'");
        console.log(JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
