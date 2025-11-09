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

async function testLogin() {
    try {
        const username = 'admin';
        const password = 'admin123';
        
        console.log('🔍 Testing login for:', username);
        console.log('');
        
        // Find user
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );
        
        if (result.rows.length === 0) {
            console.log('❌ User not found!');
        } else {
            const user = result.rows[0];
            console.log('✅ User found in database');
            console.log('   Username:', user.username);
            console.log('   Email:', user.email);
            console.log('   Role:', user.role);
            console.log('');
            
            // Test password
            const isValid = await bcrypt.compare(password, user.password_hash);
            
            if (isValid) {
                console.log('✅ Password is CORRECT!');
                console.log('');
                console.log('The credentials should work:');
                console.log('   Username: admin');
                console.log('   Password: admin123');
            } else {
                console.log('❌ Password is INCORRECT!');
                console.log('Let me recreate the account...');
            }
        }
        
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
        process.exit(1);
    }
}

testLogin();
