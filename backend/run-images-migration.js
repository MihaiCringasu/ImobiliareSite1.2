const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function runImagesMigration() {
  let connection;
  try {
    // Create a connection to the database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "casavis2",
    });

    console.log("Connected to the database");

    // Read the migration file
    const migrationPath = path.join(
      __dirname,
      "migrations",
      "002_add_images_support.sql",
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log("Executing:", statement.substring(0, 100) + "...");
        await connection.query(statement);
      }
    }

    console.log("Images migration completed successfully");
  } catch (error) {
    console.error("Images migration failed:", error);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed");
    }
  }
}

runImagesMigration();
