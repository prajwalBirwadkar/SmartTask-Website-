// Dashboard Logic

let allTasks = [];
let allUsers = [];
let currentUser = null;
let currentTaskId = null;
let draggedElement = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    if (!isAuthenticated()) {
        window.location.href = '/';
        return;
    }

    // Get current user
    currentUser = getUser();
    displayUserInfo();

    // Load users and tasks
    await loadUsers();
    await loadTasks();

    // Setup event listeners
    setupEventListeners();
    setupDragAndDrop();
});

// Display user info in navbar
const displayUserInfo = () => {
    const userInfoEl = document.getElementById('userInfo');
    if (currentUser) {
        const roleLabel = currentUser.role === 'admin' ? '👑 Admin' : '👤 User';
        userInfoEl.textContent = `${currentUser.username} (${roleLabel})`;
    }
};

// Load all users
const loadUsers = async () => {
    try {
        const response = await authAPI.getAllUsers();
        allUsers = response.users;
        populateUserDropdown();
    } catch (error) {
        console.error('Failed to load users:', error);
    }
};

// Populate user dropdown in task form
const populateUserDropdown = () => {
    const assigneeSelect = document.getElementById('taskAssignee');
    assigneeSelect.innerHTML = '<option value="">Unassigned</option>';
    
    allUsers.forEach(user => {
        const option = document.createElement('option');
        option.value = user.user_id;
        option.textContent = user.username;
        assigneeSelect.appendChild(option);
    });
};

// Load all tasks
const loadTasks = async () => {
    try {
        const response = await tasksAPI.getAll();
        allTasks = response.tasks;
        renderTasks();
    } catch (error) {
        console.error('Failed to load tasks:', error);
        showNotification('Failed to load tasks', 'error');
    }
};

// Render tasks in Kanban board
const renderTasks = () => {
    // Clear all task lists
    document.getElementById('todoList').innerHTML = '';
    document.getElementById('inProgressList').innerHTML = '';
    document.getElementById('doneList').innerHTML = '';

    // Count tasks by status
    const counts = {
        'To Do': 0,
        'In Progress': 0,
        'Done': 0
    };

    // Render each task
    allTasks.forEach(task => {
        const taskCard = createTaskCard(task);
        const listId = getListIdByStatus(task.status);
        document.getElementById(listId).appendChild(taskCard);
        counts[task.status]++;
    });

    // Update counts
    document.getElementById('todoCount').textContent = counts['To Do'];
    document.getElementById('inProgressCount').textContent = counts['In Progress'];
    document.getElementById('doneCount').textContent = counts['Done'];

    // Show empty state if no tasks
    Object.keys(counts).forEach(status => {
        if (counts[status] === 0) {
            const listId = getListIdByStatus(status);
            const list = document.getElementById(listId);
            if (list.children.length === 0) {
                list.innerHTML = '<div class="empty-state"><p>No tasks</p></div>';
            }
        }
    });
};

// Get list ID by status
const getListIdByStatus = (status) => {
    const mapping = {
        'To Do': 'todoList',
        'In Progress': 'inProgressList',
        'Done': 'doneList'
    };
    return mapping[status] || 'todoList';
};

// Create task card element
const createTaskCard = (task) => {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.draggable = true;
    card.dataset.taskId = task.task_id;

    const priorityClass = `priority-${task.priority.toLowerCase()}`;
    const description = task.description ? 
        `<p class="task-description">${task.description}</p>` : '';
    
    const assignee = task.assigned_to_username || 'Unassigned';
    const dueDate = task.due_date ? formatDate(task.due_date) : 'No due date';
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Done';

    card.innerHTML = `
        <div class="task-card-header">
            <h4 class="task-title">${escapeHtml(task.title)}</h4>
            <span class="task-priority ${priorityClass}">${task.priority}</span>
        </div>
        ${description}
        <div class="task-meta">
            <div class="task-assignee">
                <span>👤</span>
                <span>${escapeHtml(assignee)}</span>
            </div>
            <div class="task-due-date ${isOverdue ? 'overdue' : ''}">
                <span>📅</span>
                <span>${dueDate}</span>
            </div>
        </div>
    `;

    // Click to view details
    card.addEventListener('click', () => showTaskDetail(task.task_id));

    // Drag events
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);

    return card;
};

// Setup event listeners
const setupEventListeners = () => {
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Create task button
    document.getElementById('createTaskBtn').addEventListener('click', openCreateTaskModal);

    // Task modal
    document.getElementById('closeModalBtn').addEventListener('click', closeTaskModal);
    document.getElementById('cancelBtn').addEventListener('click', closeTaskModal);
    document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);

    // Task detail modal
    document.getElementById('closeDetailModalBtn').addEventListener('click', closeTaskDetailModal);
    document.getElementById('editTaskBtn').addEventListener('click', handleEditTask);
    document.getElementById('deleteTaskBtn').addEventListener('click', handleDeleteTask);
    document.getElementById('commentForm').addEventListener('submit', handleAddComment);

    // Close modals on outside click
    document.getElementById('taskModal').addEventListener('click', (e) => {
        if (e.target.id === 'taskModal') closeTaskModal();
    });
    document.getElementById('taskDetailModal').addEventListener('click', (e) => {
        if (e.target.id === 'taskDetailModal') closeTaskDetailModal();
    });
};

// Setup drag and drop
const setupDragAndDrop = () => {
    const taskLists = document.querySelectorAll('.task-list');
    
    taskLists.forEach(list => {
        list.addEventListener('dragover', handleDragOver);
        list.addEventListener('drop', handleDrop);
        list.addEventListener('dragenter', handleDragEnter);
        list.addEventListener('dragleave', handleDragLeave);
    });
};

// Drag and drop handlers
const handleDragStart = (e) => {
    draggedElement = e.currentTarget;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
};

const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    draggedElement = null;
};

const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
};

const handleDragEnter = (e) => {
    if (e.target.classList.contains('task-list')) {
        e.target.style.background = '#f0f9ff';
    }
};

const handleDragLeave = (e) => {
    if (e.target.classList.contains('task-list')) {
        e.target.style.background = '';
    }
};

const handleDrop = async (e) => {
    e.preventDefault();
    
    if (!draggedElement) return;
    
    const targetList = e.target.closest('.task-list');
    if (!targetList) return;
    
    targetList.style.background = '';
    
    const newStatus = targetList.dataset.status;
    const taskId = draggedElement.dataset.taskId;
    
    try {
        await tasksAPI.update(taskId, { status: newStatus });
        await loadTasks();
        showNotification('Task status updated', 'success');
    } catch (error) {
        console.error('Failed to update task:', error);
        showNotification('Failed to update task', 'error');
    }
};

// Open create task modal
const openCreateTaskModal = () => {
    document.getElementById('modalTitle').textContent = 'Create New Task';
    document.getElementById('taskForm').reset();
    document.getElementById('taskId').value = '';
    currentTaskId = null;
    document.getElementById('taskModal').classList.add('show');
};

// Close task modal
const closeTaskModal = () => {
    document.getElementById('taskModal').classList.remove('show');
    document.getElementById('taskForm').reset();
};

// Handle task form submit
const handleTaskSubmit = async (e) => {
    e.preventDefault();

    const taskData = {
        title: document.getElementById('taskTitle').value.trim(),
        description: document.getElementById('taskDescription').value.trim(),
        status: document.getElementById('taskStatus').value,
        priority: document.getElementById('taskPriority').value,
        due_date: document.getElementById('taskDueDate').value || null,
        assigned_to_id: document.getElementById('taskAssignee').value || null
    };

    try {
        if (currentTaskId) {
            await tasksAPI.update(currentTaskId, taskData);
            showNotification('Task updated successfully', 'success');
        } else {
            await tasksAPI.create(taskData);
            showNotification('Task created successfully', 'success');
        }

        closeTaskModal();
        await loadTasks();
    } catch (error) {
        console.error('Failed to save task:', error);
        showNotification(error.message || 'Failed to save task', 'error');
    }
};

// Show task detail modal
const showTaskDetail = async (taskId) => {
    try {
        const response = await tasksAPI.getById(taskId);
        const task = response.task;
        
        currentTaskId = task.task_id;
        
        // Populate task details
        document.getElementById('detailTaskTitle').textContent = task.title;
        document.getElementById('detailDescription').textContent = task.description || 'No description';
        
        // Status badge
        const statusEl = document.getElementById('detailStatus');
        statusEl.textContent = task.status;
        statusEl.className = `badge status-${task.status.toLowerCase().replace(' ', '')}`;
        
        // Priority badge
        const priorityEl = document.getElementById('detailPriority');
        priorityEl.textContent = task.priority;
        priorityEl.className = `badge priority-${task.priority.toLowerCase()}`;
        
        document.getElementById('detailDueDate').textContent = task.due_date ? formatDate(task.due_date) : 'No due date';
        document.getElementById('detailAssignee').textContent = task.assigned_to_username || 'Unassigned';
        document.getElementById('detailCreatedBy').textContent = task.created_by_username || 'Unknown';
        
        // Show/hide action buttons based on permissions
        const canEdit = task.created_by_id === currentUser.user_id || 
                       task.assigned_to_id === currentUser.user_id || 
                       currentUser.role === 'admin';
        const canDelete = task.created_by_id === currentUser.user_id || 
                         currentUser.role === 'admin';
        
        document.getElementById('editTaskBtn').style.display = canEdit ? 'block' : 'none';
        document.getElementById('deleteTaskBtn').style.display = canDelete ? 'block' : 'none';
        
        // Render comments
        renderComments(task.comments || []);
        
        // Show modal
        document.getElementById('taskDetailModal').classList.add('show');
    } catch (error) {
        console.error('Failed to load task details:', error);
        showNotification('Failed to load task details', 'error');
    }
};

// Close task detail modal
const closeTaskDetailModal = () => {
    document.getElementById('taskDetailModal').classList.remove('show');
    currentTaskId = null;
};

// Render comments
const renderComments = (comments) => {
    const commentsList = document.getElementById('commentsList');
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p class="empty-state">No comments yet</p>';
        return;
    }
    
    commentsList.innerHTML = comments.map(comment => `
        <div class="comment">
            <div class="comment-header">
                <span class="comment-author">${escapeHtml(comment.username)}</span>
                <span class="comment-date">${formatDateTime(comment.created_at)}</span>
            </div>
            <p class="comment-content">${escapeHtml(comment.content)}</p>
        </div>
    `).join('');
};

// Handle add comment
const handleAddComment = async (e) => {
    e.preventDefault();
    
    const content = document.getElementById('commentContent').value.trim();
    
    if (!content) return;
    
    try {
        await tasksAPI.addComment(currentTaskId, content);
        document.getElementById('commentContent').value = '';
        
        // Reload task details
        await showTaskDetail(currentTaskId);
        showNotification('Comment added', 'success');
    } catch (error) {
        console.error('Failed to add comment:', error);
        showNotification('Failed to add comment', 'error');
    }
};

// Handle edit task
const handleEditTask = async () => {
    const response = await tasksAPI.getById(currentTaskId);
    const task = response.task;
    
    // Populate form with task data
    document.getElementById('modalTitle').textContent = 'Edit Task';
    document.getElementById('taskId').value = task.task_id;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskStatus').value = task.status;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskDueDate').value = task.due_date || '';
    document.getElementById('taskAssignee').value = task.assigned_to_id || '';
    
    // Close detail modal and open edit modal
    closeTaskDetailModal();
    document.getElementById('taskModal').classList.add('show');
};

// Handle delete task
const handleDeleteTask = async () => {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        await tasksAPI.delete(currentTaskId);
        closeTaskDetailModal();
        await loadTasks();
        showNotification('Task deleted successfully', 'success');
    } catch (error) {
        console.error('Failed to delete task:', error);
        showNotification(error.message || 'Failed to delete task', 'error');
    }
};

// Utility functions
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
};

const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
};

const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

// Show notification (simple implementation)
const showNotification = (message, type = 'info') => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'error' ? '#ef4444' : '#10b981'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
