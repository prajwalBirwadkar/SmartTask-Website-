// Analytics Page Logic

let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    if (!isAuthenticated()) {
        window.location.href = '/';
        return;
    }

    currentUser = getUser();
    displayUserInfo();
    
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    await loadAnalytics();
});

// Display user info
const displayUserInfo = () => {
    const userInfoEl = document.getElementById('userInfo');
    if (currentUser) {
        const roleLabel = currentUser.role === 'admin' ? '👑 Admin' : '👤 User';
        userInfoEl.textContent = `${currentUser.username} (${roleLabel})`;
    }
};

// Load analytics data
const loadAnalytics = async () => {
    try {
        const response = await fetch('/api/analytics', {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        const data = await response.json();
        
        renderStatCards(data);
        renderStatusChart(data.statusStats);
        renderPriorityChart(data.priorityStats);
        renderTimeChart(data.tasksOverTime);
        renderUserChart(data.userStats);
        renderCompletionRate(data.completionRate);
    } catch (error) {
        console.error('Failed to load analytics:', error);
    }
};

// Render stat cards
const renderStatCards = (data) => {
    const statusCounts = {
        'To Do': 0,
        'In Progress': 0,
        'Done': 0
    };
    
    data.statusStats.forEach(stat => {
        statusCounts[stat.status] = parseInt(stat.count);
    });
    
    const total = statusCounts['To Do'] + statusCounts['In Progress'] + statusCounts['Done'];
    
    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = statusCounts['Done'];
    document.getElementById('inProgressTasks').textContent = statusCounts['In Progress'];
    document.getElementById('overdueTasks').textContent = data.overdueCount;
};

// Render status chart
const renderStatusChart = (statusStats) => {
    const container = document.getElementById('statusChart');
    container.innerHTML = '';
    
    const total = statusStats.reduce((sum, stat) => sum + parseInt(stat.count), 0);
    
    if (total === 0) {
        container.innerHTML = '<p class="empty-state">No tasks yet</p>';
        return;
    }
    
    const colors = {
        'To Do': '#3b82f6',
        'In Progress': '#f59e0b',
        'Done': '#10b981'
    };
    
    statusStats.forEach(stat => {
        const percentage = (parseInt(stat.count) / total * 100).toFixed(1);
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.innerHTML = `
            <div class="bar-label">${stat.status}</div>
            <div class="bar-container">
                <div class="bar-fill" style="width: ${percentage}%; background-color: ${colors[stat.status]}"></div>
            </div>
            <div class="bar-value">${stat.count} (${percentage}%)</div>
        `;
        container.appendChild(bar);
    });
};

// Render priority chart
const renderPriorityChart = (priorityStats) => {
    const container = document.getElementById('priorityChart');
    container.innerHTML = '';
    
    const total = priorityStats.reduce((sum, stat) => sum + parseInt(stat.count), 0);
    
    if (total === 0) {
        container.innerHTML = '<p class="empty-state">No tasks yet</p>';
        return;
    }
    
    const colors = {
        'Low': '#3b82f6',
        'Medium': '#f59e0b',
        'High': '#ef4444'
    };
    
    priorityStats.forEach(stat => {
        const percentage = (parseInt(stat.count) / total * 100).toFixed(1);
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.innerHTML = `
            <div class="bar-label">${stat.priority}</div>
            <div class="bar-container">
                <div class="bar-fill" style="width: ${percentage}%; background-color: ${colors[stat.priority]}"></div>
            </div>
            <div class="bar-value">${stat.count} (${percentage}%)</div>
        `;
        container.appendChild(bar);
    });
};

// Render time chart
const renderTimeChart = (tasksOverTime) => {
    const container = document.getElementById('timeChart');
    container.innerHTML = '';
    
    if (tasksOverTime.length === 0) {
        container.innerHTML = '<p class="empty-state">No data for last 7 days</p>';
        return;
    }
    
    const maxCount = Math.max(...tasksOverTime.map(item => parseInt(item.count)));
    
    tasksOverTime.forEach(item => {
        const date = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const height = maxCount > 0 ? (parseInt(item.count) / maxCount * 100) : 0;
        
        const bar = document.createElement('div');
        bar.className = 'time-chart-bar';
        bar.innerHTML = `
            <div class="time-bar-container">
                <div class="time-bar-fill" style="height: ${height}%; background-color: #3b82f6"></div>
            </div>
            <div class="time-bar-label">${date}</div>
            <div class="time-bar-value">${item.count}</div>
        `;
        container.appendChild(bar);
    });
};

// Render user chart
const renderUserChart = (userStats) => {
    const container = document.getElementById('userChart');
    container.innerHTML = '';
    
    if (userStats.length === 0) {
        container.innerHTML = '<p class="empty-state">No user data</p>';
        return;
    }
    
    const maxCount = Math.max(...userStats.map(user => parseInt(user.task_count)));
    
    userStats.forEach(user => {
        const width = maxCount > 0 ? (parseInt(user.task_count) / maxCount * 100) : 0;
        
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.innerHTML = `
            <div class="bar-label">${user.username}</div>
            <div class="bar-container">
                <div class="bar-fill" style="width: ${width}%; background-color: #8b5cf6"></div>
            </div>
            <div class="bar-value">${user.task_count} tasks</div>
        `;
        container.appendChild(bar);
    });
};

// Render completion rate
const renderCompletionRate = (rate) => {
    const rateEl = document.getElementById('completionRate');
    rateEl.textContent = `${Math.round(rate)}%`;
};
