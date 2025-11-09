const express = require('express');
const router = express.Router();
const { getAllActivities, getUserActivities } = require('../controllers/activityController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Activity routes
router.get('/', getAllActivities);
router.get('/user', getUserActivities);

module.exports = router;
