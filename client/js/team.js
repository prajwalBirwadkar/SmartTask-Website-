// Team Page Logic

let allUsers = [];
let allTasks = [];
let currentUser = null;
let selectedUserId = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    if (!isAuthenticated()) {
        window.location.href = '/';
        return;
    }

    currentUser = getUser();
    displayUserInfo();
    
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('closeDetailModalBtn').addEventListener('click', closeUserModal);
    
    await loadData();
});

// Display user info
const displayUserInfo = () => {
    const userInfoEl = document.getElementById('userInfo');
    if (currentUser) {
        const roleLabel = currentUser.role === 'admin' ? '👑 Admin' : '👤 User';
        userInfoEl.textContent = `${currentUser.username} (${roleLabel})`;
    }
};

// Load data
const loadData = async () => {
    try {
        const [usersResponse, tasksResponse] = await Promise.all([
            authAPI.getAllUsers(),
            tasksAPI.getAll()
        ]);
        
        allUsers = usersResponse.users;
        allTasks = tasksResponse.tasks;
        
        renderTeamGrid();
    } catch (error) {
        console.error('Failed to load data:', error);
    }
};

// Render team grid
const renderTeamGrid = () => {
    const grid = document.getElementById('teamGrid');
    grid.innerHTML = '';
    
    allUsers.forEach(user => {
        const userTasks = allTasks.filter(task => task.assigned_to_id === user.user_id);
        const completedTasks = userTasks.filter(task => task.status === 'Done').length;
        
        const card = document.createElement('div');
        card.className = 'team-card';
        card.onclick = () => showUserDetail(user.user_id);
        
        const roleIcon = user.role === 'admin' ? '👑' : '👤';
        const roleBadge = user.role === 'admin' ? 
            '<span class="badge badge-admin">Admin</span>' : 
            '<span class="badge badge-user">User</span>';
        
        card.innerHTML = `
            <div class="team-card-header">
                <div class="team-avatar">${roleIcon}</div>
                <div class="team-info">
                    <h3>${escapeHtml(user.username)}</h3>
                    <p>${escapeHtml(user.email)}</p>
                </div>
            </div>
            <div class="team-card-body">
                ${roleBadge}
                <div class="team-stats">
                    <div class="team-stat">
                        <span class="stat-value">${userTasks.length}</span>
                        <span class="stat-label">Total Tasks</span>
                    </div>
                    <div class="team-stat">
                        <span class="stat-value">${completedTasks}</span>
                        <span class="stat-label">Completed</span>
                    </div>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
};

// Show user detail
const showUserDetail = async (userId) => {
    selectedUserId = userId;
    const user = allUsers.find(u => u.user_id === userId);
    
    if (!user) return;
    
    // Populate user info
    document.getElementById('detailUserName').textContent = user.username;
    document.getElementById('detailEmail').textContent = user.email;
    
    const roleEl = document.getElementById('detailRole');
    roleEl.textContent = user.role;
    roleEl.className = `badge badge-${user.role}`;
    
    document.getElementById('detailJoined').textContent = formatDate(user.created_at);
    
    // Calculate stats
    const userTasks = allTasks.filter(task => task.assigned_to_id === userId);
    const completedTasks = userTasks.filter(task => task.status === 'Done');
    const inProgressTasks = userTasks.filter(task => task.status === 'In Progress');
    const pendingTasks = userTasks.filter(task => task.status === 'To Do');
    
    document.getElementById('userTotalTasks').textContent = userTasks.length;
    document.getElementById('userCompletedTasks').textContent = completedTasks.length;
    document.getElementById('userInProgressTasks').textContent = inProgressTasks.length;
    document.getElementById('userPendingTasks').textContent = pendingTasks.length;
    
    // Render recent tasks
    renderUserTasks(userTasks.slice(0, 5));
    
    // Show modal
    document.getElementById('userDetailModal').classList.add('show');
};

// Render user tasks
const renderUserTasks = (tasks) => {
    const container = document.getElementById('userTasksList');
    
    if (tasks.length === 0) {
        container.innerHTML = '<p class="empty-state">No tasks assigned</p>';
        return;
    }
    
    container.innerHTML = tasks.map(task => {
        const statusClass = `status-${task.status.toLowerCase().replace(' ', '')}`;
        const priorityClass = `priority-${task.priority.toLowerCase()}`;
        
        return `
            <div class="user-task-item">
                <div class="task-item-header">
                    <strong>${escapeHtml(task.title)}</strong>
                    <span class="badge ${statusClass}">${task.status}</span>
                </div>
                <div class="task-item-meta">
                    <span class="task-priority ${priorityClass}">${task.priority}</span>
                    ${task.due_date ? `<span>📅 ${formatDate(task.due_date)}</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
};

// Close user modal
const closeUserModal = () => {
    document.getElementById('userDetailModal').classList.remove('show');
    selectedUserId = null;
};

// Close modal on outside click
document.addEventListener('click', (e) => {
    if (e.target.id === 'userDetailModal') {
        closeUserModal();
    }
});

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
