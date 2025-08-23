document.addEventListener('DOMContentLoaded', function() {
    // Check if the user is logged in
    checkLoginStatus();

    // Toggle password visibility
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
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

            if (!email || !password) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }

            if (!validateEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }

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

            if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }

            if (!validateEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }

            if (phone.length !== 10 || !/^\d+$/.test(phone)) {
                showNotification('Please enter a valid 10-digit phone number', 'error');
                return;
            }

            if (password.length < 8) {
                showNotification('Password must be at least 8 characters long', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showNotification('Passwords do not match', 'error');
                return;
            }

            if (!termsAgreed) {
                showNotification('You must agree to the Terms and Conditions', 'error');
                return;
            }

            registerUser(firstName, lastName, email, phone, password);
        });
    }

    // Social login buttons
    const googleLoginButtons = document.querySelectorAll('.btn-google');
    googleLoginButtons.forEach(button => {
        button.addEventListener('click', function() {
            showNotification('Google login functionality will be integrated with backend', 'info');
        });
    });

    // Logout button functionality
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            logoutUser();
        });
    }

});

// Function to check if user is logged in
function checkLoginStatus() {
    const currentUser = localStorage.getItem('currentUser');
    const logoutButton = document.getElementById('logout-button');
    const loginButton = document.getElementById('login-button');

    if (currentUser) {
        // Show logout button, hide login button
        logoutButton.style.display = 'block';
        loginButton.style.display = 'none';
    } else {
        // Show login button, hide logout button
        loginButton.style.display = 'block';
        logoutButton.style.display = 'none';
    }
}

// Logout user and clear session
function logoutUser() {
    // Clear user data from localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    
    // Show notification and redirect to login page
    showNotification('Logout successful', 'success');
    setTimeout(() => {
        window.location.href = 'login.html'; // Redirect to login page
    }, 1000);
}

// New loginUser() function (Real)
async function loginUser(email, password, rememberMe) {
    try {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);

        const res = await fetch("login.php", {
            method: "POST",
            body: formData,
        });

        const result = await res.json();

        if (result.status === "success") {
            showNotification('Login successful', 'success');
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showNotification(result.message || "Login failed", 'error');
        }
    } catch (error) {
        console.error(error);
        showNotification("Something went wrong during login", 'error');
    }
}
// After login is successful
localStorage.setItem('isLoggedIn', 'true');
window.location.href = "index.html"; // Redirect back to home page

// In assets/js/auth.js
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault(); // Stop the normal form submission

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            fetch('login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
            })
            .then(response => response.text())
            .then(data => {
                if (data.includes('success')) { // You can adjust this based on your login.php output
                    localStorage.setItem('isLoggedIn', 'true');
                    window.location.href = 'index.html'; // Redirect to home page
                } else {
                    alert('Login failed: ' + data);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }
});

// New registerUser() function (Real)
async function registerUser(firstName, lastName, email, phone, password) {
    try {
        const formData = new FormData();
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        formData.append("email", email);
        formData.append("phone", phone);
        formData.append("password", password);

        const res = await fetch("connect.php", {
            method: "POST",
            body: formData,
        });

        const result = await res.json();

        if (result.status === "success") {
            showNotification('Registration successful', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        } else {
            showNotification(result.message || "Registration failed", 'error');
        }
    } catch (error) {
        console.error(error);
        showNotification("Something went wrong during registration", 'error');
    }
}

// Helper functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
