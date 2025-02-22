// // config/db.js
// const mysql = require("mysql");
// const dotenv = require("dotenv");
// const path = require("path");

// // Load environment variables
// dotenv.config({ path: path.join(__dirname, "./.env") });

// const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
// });


// db.connect((err) => {
//     if (err) {
//       console.error("Detailed database db error:", {
//         code: err.code,
//         errno: err.errno,
//         sqlMessage: err.sqlMessage,
//         sqlState: err.sqlState,
//       });
//       return;
//     }
//     console.log("Successfully connected to the database");
//   });

//   // Handle errors after initial db
// db.on("error", (err) => {
//     console.error("Database error:", err);
//     if (err.code === "PROTOCOL_db_LOST") {
//       console.log("Database db was closed.");
//     } else if (err.code === "ER_CON_COUNT_ERROR") {
//       console.log("Database has too many dbs.");
//     } else if (err.code === "ECONNREFUSED") {
//       console.log("Database db was refused.");
//     }
//   });

// module.exports = db;
// config/db.js
const mysql = require("mysql");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from .env file only in non-production environments
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.join(__dirname, "./.env") });
}

// Create a connection pool to handle multiple connections and reconnections gracefully
const pool = mysql.createPool({
  connectionLimit: 10, // Adjust as needed
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306, // Default MySQL port
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Test the connection when the pool is created
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to the database:", {
      code: err.code,
      errno: err.errno,
      sqlMessage: err.sqlMessage,
      sqlState: err.sqlState,
    });
    // Optionally exit the process if a connection is required
    // process.exit(1);
  } else {
    console.log("Successfully connected to the database");
    connection.release();
  }
});

// Listen for errors on the pool
pool.on("error", (err) => {
  console.error("Database pool error:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.log("Database connection was closed.");
  } else if (err.code === "ER_CON_COUNT_ERROR") {
    console.log("Database has too many connections.");
  } else if (err.code === "ECONNREFUSED") {
    console.log("Database connection was refused.");
  }
});

module.exports = pool;
