const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkUsers() {
    try {
        const result = await pool.query('SELECT user_id, username, email, role, created_at FROM users');
        
        if (result.rows.length === 0) {
            console.log('❌ No users found in database!');
            console.log('📝 You need to REGISTER first:');
            console.log('   1. Go to http://localhost:3000');
            console.log('   2. Click "Register here"');
            console.log('   3. Create your account');
        } else {
            console.log('✅ Users in database:');
            console.log('─'.repeat(60));
            result.rows.forEach(user => {
                console.log(`Username: ${user.username}`);
                console.log(`Email: ${user.email}`);
                console.log(`Role: ${user.role}`);
                console.log(`Created: ${user.created_at}`);
                console.log('─'.repeat(60));
            });
        }
        
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
        process.exit(1);
    }
}

checkUsers();
