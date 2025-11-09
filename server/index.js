const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const analyticsRoutes = require('./routes/analytics');
const activityRoutes = require('./routes/activities');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/activities', activityRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'SmartTask API is running' });
});

// Serve frontend routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/register.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dashboard.html'));
});

app.get('/analytics', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/analytics.html'));
});

app.get('/my-tasks', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/my-tasks.html'));
});

app.get('/team', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/team.html'));
});

app.get('/activity', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/activity.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   🚀 SmartTask Server Running          ║
║   📍 http://localhost:${PORT}           ║
║   🌐 Environment: ${process.env.NODE_ENV || 'development'}        ║
╚════════════════════════════════════════╝
    `);
});

module.exports = app;
