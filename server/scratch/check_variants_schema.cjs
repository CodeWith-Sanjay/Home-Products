require('dotenv').config({ path: './server/.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DB_URL
});

async function check() {
  try {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'product_variants'");
    console.log('VARIANTS SCHEMA:', JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Check failed:', err);
  } finally {
    await pool.end();
  }
}

check();
