import mysql from "mysql";
import dotenv from "dotenv";

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.MYSQL_DB_NAME,
  user: process.env.MYSQL_ID,
  password: process.env.MYSQL_PW,
  database: "starlight",
  port: parseInt(process.env.MYSQL_PORT),
});

export default connection;
