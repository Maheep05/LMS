import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               process.env.DB_PORT     || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'LibraryDB',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  dateStrings:        true,
  // Required for CREATE PROCEDURE / TRIGGER / VIEW on MySQL 8+
  multipleStatements: false,
});

// For regular SELECT / INSERT / UPDATE / DELETE — uses prepared statements
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

// For DDL statements (CREATE TABLE / VIEW / PROCEDURE / TRIGGER / DROP)
// pool.query() sends raw text, not prepared statements
export async function ddl(sql) {
  const [rows] = await pool.query(sql);
  return rows;
}

export async function transaction(fn) {
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  try {
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export default pool;