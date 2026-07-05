const mysql2 = require("mysql2/promise");
require("dotenv").config();

const pool = mysql2.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

pool
  .getConnection()
  .then((conn) => {
    console.log("Database terhubung!");
    conn.release();
  })
  .catch((err) => {
    console.error("Koneksi database gagal:", err.message);
  });

module.exports = pool;
