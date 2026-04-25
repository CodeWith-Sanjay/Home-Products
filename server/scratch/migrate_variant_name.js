import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DB_URL
});

async function migrate() {
    try {
        console.log("Checking product_variants table...");
        const res = await pool.query(`
            ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS name TEXT;
        `);
        console.log("Column 'name' added successfully (if it didn't exist).");
        
        // Optional: Populate new name column with existing variant_name - variant_value if empty
        // But for now let's just leave it null or as a fallback.
        
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
