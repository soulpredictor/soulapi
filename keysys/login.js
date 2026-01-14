
document.addEventListener('DOMContentLoaded', function() {
    // Demo credentials - in a real app, these would be handled securely on the server
    const validCredentials = {
        username: '1',
        password: '1'
    };

    const loginBtn = document.getElementById('login-btn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    
    // Function to show notifications
    function showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const notificationMessage = document.getElementById('notification-message');
        const icon = notification.querySelector('i');
        
        // Set message
        notificationMessage.textContent = message;
        
        // Set icon based on type
        if (type === 'success') {
            icon.className = 'fas fa-check-circle';
            icon.style.color = '#38a169';
        } else if (type === 'error') {
            icon.className = 'fas fa-exclamation-circle';
            icon.style.color = '#e53e3e';
        } else if (type === 'warning') {
            icon.className = 'fas fa-exclamation-triangle';
            icon.style.color = '#e9b949';
        } else {
            icon.className = 'fas fa-info-circle';
            icon.style.color = '#8B5CF6';
        }
        
        // Show notification
        notification.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Add animation to login button
    loginBtn.addEventListener('mousedown', function() {
        this.style.transform = 'scale(0.95)';
    });
    
    loginBtn.addEventListener('mouseup', function() {
        this.style.transform = 'scale(1)';
    });
    
    // Handle login form submission
    loginBtn.addEventListener('click', function() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        // Validate inputs
        if (!username || !password) {
            loginError.textContent = 'Please enter both username and password';
            return;
        }
        
        // Check credentials (demo only)
        if (username === validCredentials.username && password === validCredentials.password) {
            loginError.textContent = '';
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            
            // Store username in session storage
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('isLoggedIn', 'true');
            
            // Show success notification
            showNotification('Login successful! Redirecting...', 'success');
            
            // Simulate loading
            setTimeout(() => {
                // Add exit animation
                document.querySelector('.login-container').style.animation = 'fadeOut 0.5s forwards';
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 500);
            }, 1000);
        } else {
            loginError.textContent = 'Invalid username or password';
            // Add shake animation
            loginBtn.classList.add('shake');
            setTimeout(() => {
                loginBtn.classList.remove('shake');
            }, 500);
            
            // Show error notification
            showNotification('Login failed. Please check your credentials.', 'error');
        }
    });
    
    // Allow login with Enter key
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });
    
    // Check if user is already logged in
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'dashboard.html';
    }
    
    // Add animations to inputs
    [usernameInput, passwordInput].forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-3px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
    
    // Focus username input on page load
    setTimeout(() => {
        usernameInput.focus();
    }, 500);
    
    // Add fade-in animation to login container
    document.querySelector('.login-container').style.opacity = '0';
    setTimeout(() => {
        document.querySelector('.login-container').style.opacity = '1';
    }, 100);
});

// Define fadeOut animation
document.head.insertAdjacentHTML('beforeend', `
    <style>
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-20px); }
        }
    </style>
`);
