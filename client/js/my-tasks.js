// My Tasks Page Logic

let allTasks = [];
let filteredTasks = [];
let allUsers = [];
let currentUser = null;
let currentTaskId = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    if (!isAuthenticated()) {
        window.location.href = '/';
        return;
    }

    currentUser = getUser();
    displayUserInfo();
    
    await loadUsers();
    await loadTasks();
    
    setupEventListeners();
});

// Display user info
const displayUserInfo = () => {
    const userInfoEl = document.getElementById('userInfo');
    if (currentUser) {
        const roleLabel = currentUser.role === 'admin' ? '👑 Admin' : '👤 User';
        userInfoEl.textContent = `${currentUser.username} (${roleLabel})`;
    }
};

// Load users
const loadUsers = async () => {
    try {
        const response = await authAPI.getAllUsers();
        allUsers = response.users;
        populateUserDropdown();
    } catch (error) {
        console.error('Failed to load users:', error);
    }
};

// Populate user dropdown
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

// Load tasks
const loadTasks = async () => {
    try {
        const response = await tasksAPI.getAll();
        allTasks = response.tasks;
        applyFilters();
    } catch (error) {
        console.error('Failed to load tasks:', error);
    }
};

// Apply filters
const applyFilters = () => {
    const filterType = document.getElementById('filterType').value;
    const filterStatus = document.getElementById('filterStatus').value;
    const filterPriority = document.getElementById('filterPriority').value;
    
    filteredTasks = allTasks.filter(task => {
        // Filter by type (assigned/created/all)
        let typeMatch = false;
        if (filterType === 'assigned') {
            typeMatch = task.assigned_to_id === currentUser.user_id;
        } else if (filterType === 'created') {
            typeMatch = task.created_by_id === currentUser.user_id;
        } else {
            typeMatch = task.assigned_to_id === currentUser.user_id || task.created_by_id === currentUser.user_id;
        }
        
        // Filter by status
        const statusMatch = !filterStatus || task.status === filterStatus;
        
        // Filter by priority
        const priorityMatch = !filterPriority || task.priority === filterPriority;
        
        return typeMatch && statusMatch && priorityMatch;
    });
    
    renderTasks();
};

// Render tasks table
const renderTasks = () => {
    const tbody = document.getElementById('tasksTableBody');
    tbody.innerHTML = '';
    
    if (filteredTasks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No tasks found</td></tr>';
        return;
    }
    
    filteredTasks.forEach(task => {
        const row = document.createElement('tr');
        
        const priorityClass = `priority-${task.priority.toLowerCase()}`;
        const statusClass = `status-${task.status.toLowerCase().replace(' ', '')}`;
        const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Done';
        
        row.innerHTML = `
            <td><strong>${escapeHtml(task.title)}</strong></td>
            <td><span class="badge ${statusClass}">${task.status}</span></td>
            <td><span class="task-priority ${priorityClass}">${task.priority}</span></td>
            <td class="${isOverdue ? 'overdue' : ''}">${task.due_date ? formatDate(task.due_date) : '-'}</td>
            <td>${escapeHtml(task.assigned_to_username || 'Unassigned')}</td>
            <td>${escapeHtml(task.created_by_username || 'Unknown')}</td>
            <td>
                <button class="btn-icon" onclick="editTask(${task.task_id})" title="Edit">✏️</button>
                <button class="btn-icon" onclick="deleteTaskConfirm(${task.task_id})" title="Delete">🗑️</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
};

// Setup event listeners
const setupEventListeners = () => {
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('createTaskBtn').addEventListener('click', openCreateTaskModal);
    document.getElementById('closeModalBtn').addEventListener('click', closeTaskModal);
    document.getElementById('cancelBtn').addEventListener('click', closeTaskModal);
    document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);
    
    // Filter listeners
    document.getElementById('filterType').addEventListener('change', applyFilters);
    document.getElementById('filterStatus').addEventListener('change', applyFilters);
    document.getElementById('filterPriority').addEventListener('change', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    
    // Close modal on outside click
    document.getElementById('taskModal').addEventListener('click', (e) => {
        if (e.target.id === 'taskModal') closeTaskModal();
    });
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
};

// Edit task
window.editTask = async (taskId) => {
    try {
        const response = await tasksAPI.getById(taskId);
        const task = response.task;
        
        document.getElementById('modalTitle').textContent = 'Edit Task';
        document.getElementById('taskId').value = task.task_id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskStatus').value = task.status;
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskDueDate').value = task.due_date || '';
        document.getElementById('taskAssignee').value = task.assigned_to_id || '';
        
        currentTaskId = task.task_id;
        document.getElementById('taskModal').classList.add('show');
    } catch (error) {
        console.error('Failed to load task:', error);
        showNotification('Failed to load task', 'error');
    }
};

// Delete task
window.deleteTaskConfirm = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        await tasksAPI.delete(taskId);
        await loadTasks();
        showNotification('Task deleted successfully', 'success');
    } catch (error) {
        console.error('Failed to delete task:', error);
        showNotification('Failed to delete task', 'error');
    }
};

// Handle task submit
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
        const taskId = document.getElementById('taskId').value;
        
        if (taskId) {
            await tasksAPI.update(taskId, taskData);
            showNotification('Task updated successfully', 'success');
        } else {
            await tasksAPI.create(taskData);
            showNotification('Task created successfully', 'success');
        }
        
        closeTaskModal();
        await loadTasks();
    } catch (error) {
        console.error('Failed to save task:', error);
        showNotification('Failed to save task', 'error');
    }
};

// Clear filters
const clearFilters = () => {
    document.getElementById('filterType').value = 'assigned';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterPriority').value = '';
    applyFilters();
};

// Utility functions
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

const showNotification = (message, type = 'info') => {
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
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};
