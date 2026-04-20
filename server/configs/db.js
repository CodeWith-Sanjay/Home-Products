import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const {Pool} = pg;
 
export const pool = new Pool({
    connectionString: process.env.DB_URL,
})

export const testDB = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("DB Connected");
    // console.log(res.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
  }
};
