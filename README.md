# SmartTask - Collaborative Task Manager

A full-stack web application for collaborative task management with a Kanban board interface.

## Features

- 🔐 User Authentication (Register/Login with JWT)
- 📋 Kanban Board (To Do, In Progress, Done)
- 🎯 Task Management (Create, Update, Delete, Assign)
- 👥 Multi-user Collaboration
- 🔄 Drag-and-drop task status updates
- 💬 Task comments
- 🔒 Role-based Access Control (User/Admin)
- 📱 Responsive Design

## Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT, bcrypt

## Project Structure

```
smarttask/
├── client/              # Frontend files
│   ├── index.html      # Login page
│   ├── register.html   # Registration page
│   ├── dashboard.html  # Main Kanban board
│   ├── css/
│   │   └── styles.css  # All styles
│   └── js/
│       ├── auth.js     # Authentication logic
│       ├── dashboard.js # Dashboard & Kanban logic
│       └── api.js      # API client
├── server/              # Backend files
│   ├── index.js        # Express server entry
│   ├── config/
│   │   └── db.js       # Database connection
│   ├── middleware/
│   │   └── auth.js     # JWT verification
│   ├── routes/
│   │   ├── auth.js     # Auth endpoints
│   │   └── tasks.js    # Task CRUD endpoints
│   └── controllers/
│       ├── authController.js
│       └── taskController.js
└── db/                  # Database files
    ├── schema.sql      # Database schema
    └── migrate.js      # Migration script
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

### 3. Setup Database

Create a PostgreSQL database named `smarttask`:

```bash
createdb smarttask
```

Run the database migration:

```bash
npm run db:migrate
```

### 4. Start the Server

Development mode (with auto-reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

### 5. Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/comments` - Add comment to task

### Users
- `GET /api/users` - Get all users (for assignment)

## Database Schema

### users
- `user_id` (Primary Key)
- `username` (Unique)
- `email` (Unique)
- `password_hash`
- `role` (user/admin)
- `created_at`

### tasks
- `task_id` (Primary Key)
- `title`
- `description`
- `status` (To Do, In Progress, Done)
- `priority` (Low, Medium, High)
- `due_date`
- `created_at`
- `updated_at`
- `created_by_id` (Foreign Key → users)
- `assigned_to_id` (Foreign Key → users)

### comments
- `comment_id` (Primary Key)
- `task_id` (Foreign Key → tasks)
- `user_id` (Foreign Key → users)
- `content`
- `created_at`

## Default Credentials

After running the migration, you can create a user through the registration page.

## License

ISC
