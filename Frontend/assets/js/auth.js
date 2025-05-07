// auth.js - Handles authentication functionality for login and registration

document.addEventListener('DOMContentLoaded', function() {
    // Toggle password visibility
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            
            // Toggle the password visibility
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            } else {
                passwordInput.type = 'password';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            }
        });
    });
    
    // Handle login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember')?.checked || false;
            
            // Form validation
            if (!email || !password) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            // Email validation
            if (!validateEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Send login request to backend
            loginUser(email, password, rememberMe);
        });
    }
    
    // Handle registration form submission
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const firstName = document.getElementById('first-name').value;
            const lastName = document.getElementById('last-name').value;
            const email = document.getElementById('register-email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const termsAgreed = document.getElementById('terms')?.checked || false;
            
            // Form validation
            if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            // Email validation
            if (!validateEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Phone number validation
            if (phone.length !== 10 || !/^\d+$/.test(phone)) {
                showNotification('Please enter a valid 10-digit phone number', 'error');
                return;
            }
            
            // Password validation
            if (password.length < 8) {
                showNotification('Password must be at least 8 characters long', 'error');
                return;
            }
            
            // Confirm password validation
            if (password !== confirmPassword) {
                showNotification('Passwords do not match', 'error');
                return;
            }
            
            // Terms and conditions validation
            if (!termsAgreed) {
                showNotification('You must agree to the Terms and Conditions', 'error');
                return;
            }
            
            // Send registration request to backend
            registerUser(firstName, lastName, email, phone, password);
        });
    }
    
    // Social login buttons
    const googleLoginButtons = document.querySelectorAll('.btn-google');
    googleLoginButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Google login - this would typically redirect to Google OAuth
            window.location.href = '/api/auth/google';
            // If your backend doesn't support direct redirect, use a notification
            // showNotification('Google login functionality will be integrated with backend', 'info');
        });
    });
    
    const facebookLoginButtons = document.querySelectorAll('.btn-facebook');
    facebookLoginButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Facebook login - this would typically redirect to Facebook OAuth
            window.location.href = '/api/auth/facebook';
            // If your backend doesn't support direct redirect, use a notification
            // showNotification('Facebook login functionality will be integrated with backend', 'info');
        });
    });
    
    // Forgot password link
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Display forgot password modal
            showForgotPasswordModal();
        });
    }

    // Check if user is already logged in
    checkAuthStatus();
});

// Helper functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Append to body
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function showForgotPasswordModal() {
    // Create modal element
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    modalContent.innerHTML = `
        <h3>Forgot Password</h3>
        <p>Enter your email address and we'll send you a link to reset your password.</p>
        <form id="forgot-password-form">
            <div class="form-group">
                <label for="forgot-email">Email</label>
                <input type="email" id="forgot-email" placeholder="Enter your email" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary close-modal">Cancel</button>
                <button type="submit" class="btn btn-primary">Send Reset Link</button>
            </div>
        </form>
    `;
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // Show modal
    setTimeout(() => {
        modalOverlay.classList.add('show');
    }, 10);
    
    // Handle form submission
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    forgotPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('forgot-email').value;
        
        // Email validation
        if (!validateEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Send password reset request
        sendPasswordResetEmail(email);
        
        // Close modal
        closeModal(modalOverlay);
    });
    
    // Handle cancel button
    const closeButton = modalContent.querySelector('.close-modal');
    closeButton.addEventListener('click', function() {
        closeModal(modalOverlay);
    });
    
    // Close modal when clicking outside
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal(modalOverlay);
        }
    });
}

function closeModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => {
        document.body.removeChild(modal);
    }, 300);
}

// API functions connecting to backend
const API_BASE_URL = 'http://localhost:5000/api'; // Update this to your backend URL

// Check if user is already logged in (using stored token)
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    
    if (token) {
        fetch(`${API_BASE_URL}/auth/verify`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Token expired or invalid');
            }
            return response.json();
        })
        .then(data => {
            // If we're on the login page but already logged in, redirect to dashboard
            if (window.location.pathname.includes('login.html') || 
                window.location.pathname.includes('register.html') ||
                window.location.pathname === '/') {
                window.location.href = 'dashboard.html';
            }
        })
        .catch(error => {
            console.error('Auth verification error:', error);
            // Clear invalid token
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
        });
    } else {
        // If we're on a protected page without being logged in, redirect to login
        const protectedPages = ['dashboard.html', 'booking.html', 'pass-application.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'login.html';
        }
    }
}

function loginUser(email, password, rememberMe) {
    // Show loading state
    showNotification('Logging in...', 'info');
    
    fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || 'Login failed');
            });
        }
        return response.json();
    })
    .then(data => {
        // Store user data
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        localStorage.setItem('authToken', data.token);
        
        // Store remember me preference
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        } else {
            localStorage.removeItem('rememberMe');
        }
        
        // Show success message
        showNotification('Login successful', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    })
    .catch(error => {
        console.error('Login error:', error);
        showNotification(error.message || 'Login failed', 'error');
    });
}

function registerUser(firstName, lastName, email, phone, password) {
    // Show loading state
    showNotification('Creating your account...', 'info');
    
    fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            firstName,
            lastName,
            email,
            phone,
            password
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || 'Registration failed');
            });
        }
        return response.json();
    })
    .then(data => {
        // Store user data
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        localStorage.setItem('authToken', data.token);
        
        // Show success message
        showNotification('Registration successful', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    })
    .catch(error => {
        console.error('Registration error:', error);
        showNotification(error.message || 'Registration failed', 'error');
    });
}

function sendPasswordResetEmail(email) {
    // Show loading state
    showNotification('Sending reset link...', 'info');
    
    fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || 'Failed to send reset link');
            });
        }
        return response.json();
    })
    .then(data => {
        showNotification(data.message || `Password reset link sent to ${email}`, 'success');
    })
    .catch(error => {
        console.error('Password reset error:', error);
        showNotification(error.message || 'Failed to send reset link', 'error');
    });
}

// Function to logout user
function logoutUser() {
    const token = localStorage.getItem('authToken');
    
    if (token) {
        fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .finally(() => {
            // Always clear local storage regardless of server response
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            
            // Redirect to login page
            window.location.href = 'login.html';
        });
    } else {
        // If no token exists, just redirect
        window.location.href = 'login.html';
    }
}

// Expose logout function globally so it can be called from any page
window.logoutUser = logoutUser;