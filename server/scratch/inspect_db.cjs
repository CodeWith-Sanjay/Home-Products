require('dotenv').config({ path: './server/.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DB_URL
});

async function inspect() {
  try {
    const res = await pool.query('SELECT review_id, product_id, variant_id, rating FROM reviews');
    console.log('REVIEWS IN DB:', JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Inspection failed:', err);
  } finally {
    await pool.end();
  }
}

inspect();
