const pool = require('../config/db');
const { logActivity } = require('./activityController');

// Get all tasks
const getAllTasks = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                t.*,
                u1.username as created_by_username,
                u2.username as assigned_to_username
            FROM tasks t
            LEFT JOIN users u1 ON t.created_by_id = u1.user_id
            LEFT JOIN users u2 ON t.assigned_to_id = u2.user_id
            ORDER BY t.created_at DESC
        `);

        res.json({ tasks: result.rows });
    } catch (error) {
        console.error('Get all tasks error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get task by ID
const getTaskById = async (req, res) => {
    const { id } = req.params;

    try {
        const taskResult = await pool.query(`
            SELECT 
                t.*,
                u1.username as created_by_username,
                u2.username as assigned_to_username
            FROM tasks t
            LEFT JOIN users u1 ON t.created_by_id = u1.user_id
            LEFT JOIN users u2 ON t.assigned_to_id = u2.user_id
            WHERE t.task_id = $1
        `, [id]);

        if (taskResult.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Get comments for this task
        const commentsResult = await pool.query(`
            SELECT 
                c.*,
                u.username
            FROM comments c
            JOIN users u ON c.user_id = u.user_id
            WHERE c.task_id = $1
            ORDER BY c.created_at DESC
        `, [id]);

        const task = {
            ...taskResult.rows[0],
            comments: commentsResult.rows
        };

        res.json({ task });
    } catch (error) {
        console.error('Get task by ID error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create new task
const createTask = async (req, res) => {
    const { title, description, status, priority, due_date, assigned_to_id } = req.body;
    const created_by_id = req.user.user_id;

    try {
        // Validate input
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const result = await pool.query(`
            INSERT INTO tasks (title, description, status, priority, due_date, created_by_id, assigned_to_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [
            title,
            description || null,
            status || 'To Do',
            priority || 'Medium',
            due_date || null,
            created_by_id,
            assigned_to_id || null
        ]);

        // Fetch the complete task with user information
        const taskResult = await pool.query(`
            SELECT 
                t.*,
                u1.username as created_by_username,
                u2.username as assigned_to_username
            FROM tasks t
            LEFT JOIN users u1 ON t.created_by_id = u1.user_id
            LEFT JOIN users u2 ON t.assigned_to_id = u2.user_id
            WHERE t.task_id = $1
        `, [result.rows[0].task_id]);

        // Log activity
        await logActivity(
            created_by_id,
            'CREATE',
            'task',
            result.rows[0].task_id,
            `Created task "${title}"`
        );

        res.status(201).json({
            message: 'Task created successfully',
            task: taskResult.rows[0]
        });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update task
const updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, status, priority, due_date, assigned_to_id } = req.body;

    try {
        // Check if task exists
        const taskCheck = await pool.query('SELECT * FROM tasks WHERE task_id = $1', [id]);
        
        if (taskCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Check permissions (user can only update tasks they created or are assigned to, unless admin)
        const task = taskCheck.rows[0];
        const isOwner = task.created_by_id === req.user.user_id;
        const isAssigned = task.assigned_to_id === req.user.user_id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAssigned && !isAdmin) {
            return res.status(403).json({ error: 'Access denied. You can only update your own tasks.' });
        }

        // Update task
        const result = await pool.query(`
            UPDATE tasks 
            SET 
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                status = COALESCE($3, status),
                priority = COALESCE($4, priority),
                due_date = COALESCE($5, due_date),
                assigned_to_id = COALESCE($6, assigned_to_id),
                updated_at = CURRENT_TIMESTAMP
            WHERE task_id = $7
            RETURNING *
        `, [title, description, status, priority, due_date, assigned_to_id, id]);

        // Fetch the complete task with user information
        const taskResult = await pool.query(`
            SELECT 
                t.*,
                u1.username as created_by_username,
                u2.username as assigned_to_username
            FROM tasks t
            LEFT JOIN users u1 ON t.created_by_id = u1.user_id
            LEFT JOIN users u2 ON t.assigned_to_id = u2.user_id
            WHERE t.task_id = $1
        `, [id]);

        // Log activity
        await logActivity(
            req.user.user_id,
            'UPDATE',
            'task',
            parseInt(id),
            `Updated task "${taskResult.rows[0].title}"`
        );

        res.json({
            message: 'Task updated successfully',
            task: taskResult.rows[0]
        });
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete task
const deleteTask = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if task exists
        const taskCheck = await pool.query('SELECT * FROM tasks WHERE task_id = $1', [id]);
        
        if (taskCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Check permissions (only creator or admin can delete)
        const task = taskCheck.rows[0];
        const isOwner = task.created_by_id === req.user.user_id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'Access denied. Only task creator or admin can delete tasks.' });
        }

        // Log activity before deleting
        await logActivity(
            req.user.user_id,
            'DELETE',
            'task',
            parseInt(id),
            `Deleted task "${task.title}"`
        );

        // Delete task
        await pool.query('DELETE FROM tasks WHERE task_id = $1', [id]);

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Add comment to task
const addComment = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const user_id = req.user.user_id;

    try {
        // Validate input
        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Comment content is required' });
        }

        // Check if task exists
        const taskCheck = await pool.query('SELECT * FROM tasks WHERE task_id = $1', [id]);
        
        if (taskCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Insert comment
        const result = await pool.query(`
            INSERT INTO comments (task_id, user_id, content)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [id, user_id, content]);

        // Fetch comment with username
        const commentResult = await pool.query(`
            SELECT 
                c.*,
                u.username
            FROM comments c
            JOIN users u ON c.user_id = u.user_id
            WHERE c.comment_id = $1
        `, [result.rows[0].comment_id]);

        res.status(201).json({
            message: 'Comment added successfully',
            comment: commentResult.rows[0]
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    addComment
};
