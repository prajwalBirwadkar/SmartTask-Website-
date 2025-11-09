const { Pool } = require('pg');
require('dotenv').config();

// Connect to default postgres database to create smarttask database
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: 'postgres', // Connect to default database
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function createDatabase() {
    try {
        console.log('🔍 Checking if smarttask database exists...');
        
        // Check if database exists
        const checkResult = await pool.query(
            "SELECT 1 FROM pg_database WHERE datname = 'smarttask'"
        );
        
        if (checkResult.rows.length > 0) {
            console.log('✅ Database "smarttask" already exists!');
        } else {
            // Create database
            await pool.query('CREATE DATABASE smarttask');
            console.log('✅ Database "smarttask" created successfully!');
        }
        
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to create database:', error.message);
        await pool.end();
        process.exit(1);
    }
}

createDatabase();
