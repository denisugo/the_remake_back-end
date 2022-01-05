const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  sqlPort: process.env.SQL_PORT,
  sqlHost: process.env.SQL_HOST,
  database: process.env.SQL_DATABASE,
});

module.exports = pool;
