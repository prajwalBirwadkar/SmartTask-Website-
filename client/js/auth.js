// Authentication Logic

// Show error message
const showError = (message) => {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    errorDiv.style.display = 'block';
};

// Hide error message
const hideError = () => {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.classList.remove('show');
    errorDiv.style.display = 'none';
};

// Login Form Handler
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            showError('Please enter both username and password');
            return;
        }

        try {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';

            const response = await authAPI.login(username, password);

            // Save token and user info
            setToken(response.token);
            setUser(response.user);

            // Redirect to dashboard
            window.location.href = '/dashboard';
        } catch (error) {
            showError(error.message || 'Login failed. Please try again.');
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    });
}

// Register Form Handler
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();

        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        if (!username || !email || !password || !confirmPassword) {
            showError('All fields are required');
            return;
        }

        if (password.length < 6) {
            showError('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        try {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating account...';

            const response = await authAPI.register(username, email, password);

            // Save token and user info
            setToken(response.token);
            setUser(response.user);

            // Redirect to dashboard
            window.location.href = '/dashboard';
        } catch (error) {
            showError(error.message || 'Registration failed. Please try again.');
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Register';
        }
    });
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    
    // If on auth pages and already authenticated, redirect to dashboard
    if ((currentPath === '/' || currentPath === '/register') && isAuthenticated()) {
        window.location.href = '/dashboard';
    }
    
    // If on dashboard and not authenticated, redirect to login
    if (currentPath === '/dashboard' && !isAuthenticated()) {
        window.location.href = '/';
    }
});
