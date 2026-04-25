import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DB_URL
});

async function populate() {
    try {
        console.log("Populating variant names from parent products...");
        // Update product_variants name with parent product name where it's null
        const res = await pool.query(`
            UPDATE product_variants pv
            SET name = p.name
            FROM products p
            WHERE pv.product_id = p.product_id AND pv.name IS NULL;
        `);
        console.log(`Updated ${res.rowCount} variant names.`);
        process.exit(0);
    } catch (err) {
        console.error("Population failed:", err);
        process.exit(1);
    }
}

populate();
