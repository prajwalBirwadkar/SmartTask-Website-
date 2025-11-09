const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function migrate() {
    try {
        console.log('🚀 Adding activity_logs table...');
        
        const schemaPath = path.join(__dirname, 'db', 'add-activity-logs.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        await pool.query(schema);
        
        console.log('✅ Activity logs table created successfully!');
        
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        await pool.end();
        process.exit(1);
    }
}

migrate();
