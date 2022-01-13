const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? {
          required: true,
          rejectUnauthorized: false,
        }
      : false,
});

module.exports = pool;
