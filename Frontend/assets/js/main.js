// main.js - Common functionality for all pages of IBBPS

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle functionality
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Mobile menu dropdown handling (alternative version for dashboard)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Hide mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideMenu = navMenu && navMenu.contains(event.target);
        const isClickOnHamburger = hamburger && hamburger.contains(event.target);
        
        if (navMenu && navMenu.classList.contains('active') && !isClickInsideMenu && !isClickOnHamburger) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
        
        // For alternative menu
        const isClickInsideLinks = navLinks && navLinks.contains(event.target);
        const isClickOnMobileBtn = mobileMenuBtn && mobileMenuBtn.contains(event.target);
        
        if (navLinks && navLinks.classList.contains('active') && !isClickInsideLinks && !isClickOnMobileBtn) {
            navLinks.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        }
    });

    // Password toggle functionality
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    
    togglePasswordBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });

    // Current year for footer copyright
    const yearSpan = document.querySelector('.footer-bottom p');
    if (yearSpan) {
        const currentYear = new Date().getFullYear();
        yearSpan.innerHTML = yearSpan.innerHTML.replace('2025', currentYear);
    }

    // Highlight current page in navigation
    highlightCurrentPage();

    // Initialize tooltips if any
    initTooltips();
    
    // Check authentication status
    checkAuthStatus();
});

// Function to highlight current page in navigation
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop();
    
    const navLinks = document.querySelectorAll('.nav-menu a, .nav-links a');
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || 
            (currentPage === '' && linkHref === 'index.html') ||
            (linkHref === currentPage.substring(0, linkHref.length))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Function to initialize tooltips
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[title]');
    
    tooltipElements.forEach(el => {
        el.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.classList.add('tooltip');
            tooltip.textContent = this.getAttribute('title');
            
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            tooltip.style.top = (rect.top - tooltipRect.height - 10) + 'px';
            tooltip.style.left = (rect.left + (rect.width / 2) - (tooltipRect.width / 2)) + 'px';
            
            this.addEventListener('mouseleave', function() {
                tooltip.remove();
            }, { once: true });
        });
    });
}

// Function to check authentication status using localStorage
function checkAuthStatus() {
    const user = localStorage.getItem('ibbps_user');
    const authButtons = document.querySelector('.auth-buttons');
    const loginLinks = document.querySelectorAll('a[href="login.html"]');
    
    if (user && authButtons) {
        // If on dashboard, update user info
        const userData = JSON.parse(user);
        const usernameElement = document.getElementById('username');
        const userFullnameElement = document.getElementById('user-fullname');
        const sidebarUsernameElement = document.getElementById('sidebar-username');
        const userEmailElement = document.getElementById('user-email');
        const userMobileElement = document.getElementById('user-mobile');
        
        if (usernameElement) {
            usernameElement.textContent = userData.firstName || 'My Account';
        }
        
        if (userFullnameElement) {
            userFullnameElement.textContent = `${userData.firstName} ${userData.lastName}`;
        }
        
        if (sidebarUsernameElement) {
            sidebarUsernameElement.textContent = `${userData.firstName} ${userData.lastName}`;
        }
        
        if (userEmailElement) {
            userEmailElement.textContent = userData.email;
        }
        
        if (userMobileElement) {
            userMobileElement.textContent = userData.phone;
        }
        
        // Set up logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                localStorage.removeItem('ibbps_user');
                window.location.href = 'index.html';
            });
        }
    } else if (!user) {
        // If not authenticated and on protected page, redirect to login
        const protectedPages = ['dashboard.html', 'booking.html', 'pass-application.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'login.html';
        }
    }
    
    // Update login/register links if user is logged in
    if (user && loginLinks.length > 0) {
        loginLinks.forEach(link => {
            if (link.classList.contains('btn')) {
                link.href = 'dashboard.html';
                link.textContent = 'My Account';
            }
        });
    }
}

// Show notification message function
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add show class after a small delay to trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto close after 5 seconds
    const timeout = setTimeout(() => {
        closeNotification(notification);
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        clearTimeout(timeout);
        closeNotification(notification);
    });
}

// Close notification function
function closeNotification(notification) {
    notification.classList.remove('show');
    
    // Remove element after animation completes
    setTimeout(() => {
        if (notification.parentElement) {
            notification.parentElement.removeChild(notification);
        }
    }, 300);
}

// Function to format date as DD MMM YYYY
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
}

// Function to format time as HH:MM AM/PM
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// Format currency as Indian Rupees
function formatCurrency(amount) {
    return '₹' + parseFloat(amount).toFixed(2);
}

// Function to get URL parameters (for search and booking pages)
function getUrlParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const pairs = queryString.split('&');
    
    for (const pair of pairs) {
        const [key, value] = pair.split('=');
        if (key && value) {
            params[decodeURIComponent(key)] = decodeURIComponent(value);
        }
    }
    
    return params;
}