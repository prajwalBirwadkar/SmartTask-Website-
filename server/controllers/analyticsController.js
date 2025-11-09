const pool = require('../config/db');

// Get analytics data
const getAnalytics = async (req, res) => {
    try {
        // Total tasks by status
        const statusStats = await pool.query(`
            SELECT 
                status,
                COUNT(*) as count
            FROM tasks
            GROUP BY status
        `);

        // Total tasks by priority
        const priorityStats = await pool.query(`
            SELECT 
                priority,
                COUNT(*) as count
            FROM tasks
            GROUP BY priority
        `);

        // Tasks created over time (last 7 days)
        const tasksOverTime = await pool.query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count
            FROM tasks
            WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY DATE(created_at)
            ORDER BY date
        `);

        // User task distribution
        const userStats = await pool.query(`
            SELECT 
                u.username,
                COUNT(t.task_id) as task_count
            FROM users u
            LEFT JOIN tasks t ON u.user_id = t.assigned_to_id
            GROUP BY u.user_id, u.username
            ORDER BY task_count DESC
        `);

        // Overdue tasks
        const overdueTasks = await pool.query(`
            SELECT COUNT(*) as count
            FROM tasks
            WHERE due_date < CURRENT_DATE AND status != 'Done'
        `);

        // Completion rate
        const completionRate = await pool.query(`
            SELECT 
                COUNT(CASE WHEN status = 'Done' THEN 1 END)::float / NULLIF(COUNT(*)::float, 0) * 100 as rate
            FROM tasks
        `);

        res.json({
            statusStats: statusStats.rows,
            priorityStats: priorityStats.rows,
            tasksOverTime: tasksOverTime.rows,
            userStats: userStats.rows,
            overdueCount: overdueTasks.rows[0].count,
            completionRate: completionRate.rows[0].rate || 0
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getAnalytics };
