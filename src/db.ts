import mysql, { Connection, PoolConnection } from "mysql";
import dotenv from "dotenv";

dotenv.config();

// const connection = mysql.createConnection({
//   host: process.env.MYSQL_URL,
//   user: process.env.MYSQL_ID,
//   password: process.env.MYSQL_PW,
//   database: process.env.MYSQL_DB_NAME,
//   port: parseInt(process.env.MYSQL_PORT),
// });

const pool = mysql.createPool({
  host: process.env.MYSQL_URL,
  user: process.env.MYSQL_ID,
  password: process.env.MYSQL_PW,
  database: process.env.MYSQL_DB_NAME,
  port: parseInt(process.env.MYSQL_PORT),
  connectionLimit: 30,
});

export const getConnection = (
  callback: (connection: PoolConnection) => void
) => {
  pool.getConnection((error, connection) => {
    if (!error) {
      callback(connection);
    }
  });
};

export default pool;
