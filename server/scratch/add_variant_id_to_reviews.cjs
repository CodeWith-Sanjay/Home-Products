require('dotenv').config({ path: './server/.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DB_URL
});

async function migrate() {
  try {
    await pool.query('ALTER TABLE reviews ADD COLUMN variant_id UUID REFERENCES product_variants(variant_id)');
    console.log('Column variant_id added successfully to reviews table');
  } catch (err) {
    if (err.code === '42701') {
      console.log('Column variant_id already exists');
    } else {
      console.error('Migration failed:', err);
    }
  } finally {
    await pool.end();
  }
}

migrate();
