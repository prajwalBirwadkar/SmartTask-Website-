const pool = require('../config/db');

// Log activity
const logActivity = async (userId, action, entityType, entityId, description) => {
    try {
        await pool.query(
            'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES ($1, $2, $3, $4, $5)',
            [userId, action, entityType, entityId, description]
        );
    } catch (error) {
        console.error('Log activity error:', error);
    }
};

// Get all activities
const getAllActivities = async (req, res) => {
    try {
        const limit = req.query.limit || 50;
        
        const result = await pool.query(`
            SELECT 
                a.*,
                u.username
            FROM activity_logs a
            JOIN users u ON a.user_id = u.user_id
            ORDER BY a.created_at DESC
            LIMIT $1
        `, [limit]);

        res.json({ activities: result.rows });
    } catch (error) {
        console.error('Get activities error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get user activities
const getUserActivities = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const limit = req.query.limit || 50;
        
        const result = await pool.query(`
            SELECT 
                a.*,
                u.username
            FROM activity_logs a
            JOIN users u ON a.user_id = u.user_id
            WHERE a.user_id = $1
            ORDER BY a.created_at DESC
            LIMIT $2
        `, [userId, limit]);

        res.json({ activities: result.rows });
    } catch (error) {
        console.error('Get user activities error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { logActivity, getAllActivities, getUserActivities };
