const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function createAdmin() {
    try {
        const username = 'admin';
        const password = 'admin123';
        const email = 'admin@smarttask.com';
        
        // Hash the password properly
        const password_hash = await bcrypt.hash(password, 10);
        
        // Delete existing admin if exists
        await pool.query('DELETE FROM users WHERE username = $1', [username]);
        
        // Create new admin with proper password
        await pool.query(
            'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4)',
            [username, email, password_hash, 'admin']
        );
        
        console.log('✅ Admin account created successfully!');
        console.log('═'.repeat(50));
        console.log('📋 Login Credentials:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        console.log('═'.repeat(50));
        console.log('');
        console.log('🚀 You can now login at: http://localhost:3000');
        
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
        process.exit(1);
    }
}

createAdmin();
