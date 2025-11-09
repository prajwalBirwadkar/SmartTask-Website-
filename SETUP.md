# SmartTask Setup Guide

Follow these steps to set up and run the SmartTask application on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
- **npm** (comes with Node.js)

## Step-by-Step Setup

### 1. Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will install all required Node.js packages.

### 2. Setup PostgreSQL Database

#### Option A: Using psql command line

1. Open PostgreSQL command line (psql)
2. Create a new database:

```sql
CREATE DATABASE smarttask;
```

3. Exit psql (type `\q`)

#### Option B: Using pgAdmin

1. Open pgAdmin
2. Right-click on "Databases" → "Create" → "Database"
3. Enter database name: `smarttask`
4. Click "Save"

### 3. Configure Environment Variables

1. Copy the example environment file:

```bash
copy .env.example .env
```

2. Open `.env` file and update the following values:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smarttask
DB_USER=postgres
DB_PASSWORD=your_actual_password_here

# JWT Configuration
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
```

**Important**: 
- Replace `your_actual_password_here` with your PostgreSQL password
- Replace the `JWT_SECRET` with a long, random string for security

### 4. Run Database Migration

This will create all necessary tables:

```bash
npm run db:migrate
```

You should see a success message: ✅ Database migration completed successfully!

### 5. Start the Application

#### Development Mode (with auto-reload):

```bash
npm run dev
```

#### Production Mode:

```bash
npm start
```

### 6. Access the Application

Open your web browser and navigate to:

```
http://localhost:3000
```

## Default Setup

The application will start with an empty database. You need to:

1. **Register** your first user account
2. Start creating tasks!

## Common Issues & Solutions

### Issue: "Database connection failed"

**Solution**: 
- Verify PostgreSQL is running
- Check your database credentials in `.env`
- Ensure the database `smarttask` exists

### Issue: "Port 3000 is already in use"

**Solution**: 
- Change the PORT in `.env` to a different number (e.g., 3001)
- Or stop the application using port 3000

### Issue: "Cannot find module"

**Solution**: 
- Delete `node_modules` folder
- Run `npm install` again

### Issue: "Migration failed"

**Solution**: 
- Drop the existing database and create a new one
- Run the migration again

## Project Structure

```
smarttask/
├── client/              # Frontend files
│   ├── index.html      # Login page
│   ├── register.html   # Registration page
│   ├── dashboard.html  # Main Kanban board
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── auth.js
│       ├── dashboard.js
│       └── api.js
├── server/              # Backend files
│   ├── index.js        # Express server
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── tasks.js
│   └── controllers/
│       ├── authController.js
│       └── taskController.js
├── db/                  # Database files
│   ├── schema.sql
│   └── migrate.js
├── package.json
├── .env.example
└── README.md
```

## Features Overview

### Authentication
- User registration with password hashing (bcrypt)
- Login with JWT token
- Protected routes

### Task Management
- Create, read, update, delete tasks
- Assign tasks to users
- Set priority (Low, Medium, High)
- Set due dates
- Add comments to tasks

### Kanban Board
- Three columns: To Do, In Progress, Done
- Drag and drop tasks between columns
- Visual priority indicators
- Task counts per column

### Role-Based Access
- **Users**: Can create, edit, and delete their own tasks
- **Admins**: Can manage all tasks

## Testing the Application

### Test User Registration
1. Go to http://localhost:3000/register
2. Create a new account
3. You'll be automatically logged in

### Test Task Creation
1. Click "New Task" button
2. Fill in task details
3. Assign to yourself or another user
4. Click "Save Task"

### Test Drag and Drop
1. Create multiple tasks
2. Drag a task from one column to another
3. Task status updates automatically

### Test Comments
1. Click on any task card
2. Scroll to comments section
3. Add a comment
4. Comment appears immediately

## API Endpoints

All API endpoints are documented in the main README.md file.

## Development Tips

- Use `npm run dev` for development (auto-reloads on file changes)
- Check browser console for any frontend errors
- Check terminal for backend errors
- Use browser DevTools Network tab to debug API calls

## Security Notes

- Never commit `.env` file to version control
- Always use strong passwords
- Change the JWT_SECRET in production
- Use HTTPS in production environments

## Need Help?

If you encounter any issues:

1. Check the error message in terminal
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Ensure PostgreSQL is running
5. Make sure all dependencies are installed

## Next Steps

After successful setup:

1. Create your first user account
2. Invite team members to register
3. Start creating and organizing tasks
4. Explore drag-and-drop functionality
5. Try adding comments to tasks

Enjoy using SmartTask! 🚀
