const fs = require('fs');

let envContent = `# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smarttask
DB_USER=postgres
DB_PASSWORD=Prajwal123@

# JWT Configuration
JWT_SECRET=SmartTask_Secret_Key_2024_Secure_Random_String
JWT_EXPIRES_IN=7d
`;

fs.writeFileSync('.env', envContent);
console.log('✅ .env file updated successfully!');
