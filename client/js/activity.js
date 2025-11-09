// Activity Log Page Logic

let currentUser = null;
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    if (!isAuthenticated()) {
        window.location.href = '/';
        return;
    }

    currentUser = getUser();
    displayUserInfo();
    
    setupEventListeners();
    await loadActivities();
});

// Display user info
const displayUserInfo = () => {
    const userInfoEl = document.getElementById('userInfo');
    if (currentUser) {
        const roleLabel = currentUser.role === 'admin' ? '👑 Admin' : '👤 User';
        userInfoEl.textContent = `${currentUser.username} (${roleLabel})`;
    }
};

// Setup event listeners
const setupEventListeners = () => {
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('filterAll').addEventListener('click', () => filterActivities('all'));
    document.getElementById('filterMine').addEventListener('click', () => filterActivities('mine'));
};

// Filter activities
const filterActivities = async (type) => {
    currentFilter = type;
    
    // Update active button
    document.getElementById('filterAll').classList.toggle('active', type === 'all');
    document.getElementById('filterAll').classList.toggle('btn-primary', type === 'all');
    document.getElementById('filterAll').classList.toggle('btn-secondary', type !== 'all');
    
    document.getElementById('filterMine').classList.toggle('active', type === 'mine');
    document.getElementById('filterMine').classList.toggle('btn-primary', type === 'mine');
    document.getElementById('filterMine').classList.toggle('btn-secondary', type !== 'mine');
    
    await loadActivities();
};

// Load activities
const loadActivities = async () => {
    try {
        const endpoint = currentFilter === 'mine' ? '/api/activities/user' : '/api/activities';
        
        const response = await fetch(endpoint, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        const data = await response.json();
        renderActivities(data.activities);
    } catch (error) {
        console.error('Failed to load activities:', error);
    }
};

// Render activities
const renderActivities = (activities) => {
    const timeline = document.getElementById('activityTimeline');
    
    if (activities.length === 0) {
        timeline.innerHTML = '<div class="empty-state"><p>No activity to display</p></div>';
        return;
    }
    
    // Group activities by date
    const groupedActivities = groupByDate(activities);
    
    timeline.innerHTML = '';
    
    Object.keys(groupedActivities).forEach(date => {
        const dateGroup = document.createElement('div');
        dateGroup.className = 'activity-date-group';
        
        const dateHeader = document.createElement('div');
        dateHeader.className = 'activity-date-header';
        dateHeader.textContent = formatDateHeader(date);
        dateGroup.appendChild(dateHeader);
        
        groupedActivities[date].forEach(activity => {
            const item = createActivityItem(activity);
            dateGroup.appendChild(item);
        });
        
        timeline.appendChild(dateGroup);
    });
};

// Group activities by date
const groupByDate = (activities) => {
    const grouped = {};
    
    activities.forEach(activity => {
        const date = new Date(activity.created_at).toDateString();
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(activity);
    });
    
    return grouped;
};

// Create activity item
const createActivityItem = (activity) => {
    const item = document.createElement('div');
    item.className = 'activity-item';
    
    const icon = getActionIcon(activity.action);
    const color = getActionColor(activity.action);
    
    item.innerHTML = `
        <div class="activity-icon" style="background-color: ${color}">
            ${icon}
        </div>
        <div class="activity-content">
            <div class="activity-header">
                <strong>${escapeHtml(activity.username)}</strong>
                <span class="activity-action">${activity.action.toLowerCase()}</span>
                <span class="activity-entity">${activity.entity_type}</span>
            </div>
            <div class="activity-description">
                ${escapeHtml(activity.description)}
            </div>
            <div class="activity-time">
                ${formatTime(activity.created_at)}
            </div>
        </div>
    `;
    
    return item;
};

// Get action icon
const getActionIcon = (action) => {
    const icons = {
        'CREATE': '➕',
        'UPDATE': '✏️',
        'DELETE': '🗑️',
        'COMMENT': '💬'
    };
    return icons[action] || '📝';
};

// Get action color
const getActionColor = (action) => {
    const colors = {
        'CREATE': '#10b981',
        'UPDATE': '#3b82f6',
        'DELETE': '#ef4444',
        'COMMENT': '#8b5cf6'
    };
    return colors[action] || '#6b7280';
};

// Format date header
const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
};

// Format time
const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
    });
};

// Escape HTML
const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};
