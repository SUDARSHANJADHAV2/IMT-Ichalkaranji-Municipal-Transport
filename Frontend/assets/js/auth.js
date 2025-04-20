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
            
            // Send login request to backend (simulated)
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
            
            // Send registration request to backend (simulated)
            registerUser(firstName, lastName, email, phone, password);
        });
    }
    
    // Social login buttons
    const googleLoginButtons = document.querySelectorAll('.btn-google');
    googleLoginButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Simulate Google login
            showNotification('Google login functionality will be integrated with backend', 'info');
        });
    });
    
    const facebookLoginButtons = document.querySelectorAll('.btn-facebook');
    facebookLoginButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Simulate Facebook login
            showNotification('Facebook login functionality will be integrated with backend', 'info');
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
        
        // Send password reset request (simulated)
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

// API simulation functions
function loginUser(email, password, rememberMe) {
    // Simulate API call with timeout
    setTimeout(() => {
        // For demo purposes, accept any login
        const user = {
            id: 'user123',
            firstName: 'Test',
            lastName: 'User',
            email: email,
            phone: '1234567890'
        };
        
        // Store user in local storage
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Set auth token (in real app, this would come from the server)
        localStorage.setItem('authToken', 'dummy-auth-token-' + Math.random().toString(36).substring(2));
        
        // Show success message
        showNotification('Login successful', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    }, 1500);
}

function registerUser(firstName, lastName, email, phone, password) {
    // Simulate API call with timeout
    setTimeout(() => {
        // For demo purposes, accept any registration
        const user = {
            id: 'user' + Math.floor(Math.random() * 1000),
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone
        };
        
        // Store user in local storage
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Set auth token (in real app, this would come from the server)
        localStorage.setItem('authToken', 'dummy-auth-token-' + Math.random().toString(36).substring(2));
        
        // Show success message
        showNotification('Registration successful', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    }, 1500);
}

function sendPasswordResetEmail(email) {
    // Simulate API call
    setTimeout(() => {
        showNotification(`Password reset link sent to ${email}`, 'success');
    }, 1500);
}