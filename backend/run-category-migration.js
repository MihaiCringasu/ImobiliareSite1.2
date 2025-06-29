const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function runCategoryMigration() {
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

    // Check if category column exists
    const [categoryColumns] = await connection.query(
      `SHOW COLUMNS FROM properties LIKE 'category'`,
    );

    if (categoryColumns.length === 0) {
      console.log("Adding category column...");
      await connection.query(`
        ALTER TABLE properties 
        ADD COLUMN category ENUM('vanzare', 'inchiriere') NOT NULL DEFAULT 'vanzare'
      `);
    }

    // Check if map_url column exists
    const [mapUrlColumns] = await connection.query(
      `SHOW COLUMNS FROM properties LIKE 'map_url'`,
    );

    if (mapUrlColumns.length === 0) {
      console.log("Adding map_url column...");
      await connection.query(`
        ALTER TABLE properties 
        ADD COLUMN map_url VARCHAR(1024) DEFAULT NULL
      `);
    }

    // Check if map_embed_url column exists
    const [mapEmbedColumns] = await connection.query(
      `SHOW COLUMNS FROM properties LIKE 'map_embed_url'`,
    );

    if (mapEmbedColumns.length === 0) {
      console.log("Adding map_embed_url column...");
      await connection.query(`
        ALTER TABLE properties 
        ADD COLUMN map_embed_url VARCHAR(1024) DEFAULT NULL
      `);
    }

    // Update existing properties to have vanzare category
    await connection.query(`
      UPDATE properties 
      SET category = 'vanzare' 
      WHERE category IS NULL OR category = ''
    `);

    // Add indexes for better performance
    try {
      await connection.query(`
        ALTER TABLE properties 
        ADD INDEX idx_category (category),
        ADD INDEX idx_type_category (type, category)
      `);
      console.log("Added performance indexes");
    } catch (error) {
      if (!error.message.includes("Duplicate key name")) {
        console.warn("Could not add indexes:", error.message);
      }
    }

    console.log("Category and map migration completed successfully");
  } catch (error) {
    console.error("Category and map migration failed:", error);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed");
    }
  }
}

runCategoryMigration();
