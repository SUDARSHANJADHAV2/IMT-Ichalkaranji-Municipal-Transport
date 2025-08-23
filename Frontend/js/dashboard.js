// Dashboard JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initDashboard();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Setup dashboard tab navigation
    setupTabNavigation();
    
    // Setup profile picture editor
    setupProfilePictureEditor();
    
    // Setup form submissions
    setupFormSubmissions();

    // Setup pagination functionality
    setupPagination();
    
    // Setup route deletion
    setupRouteActions();
    
    // Setup booking actions
    setupBookingActions();
});

/**
 * Initialize dashboard with user data
 * In a real application, this would fetch data from the backend
 */
function initDashboard() {
    // This would normally fetch user data from an API
    // For now, we'll use mock data
    const userData = {
        fullName: "Rahul Patil",
        email: "rahul.p@gmail.com",
        mobile: "+91 9876543210",
        avatar: "assets/images/user-avatar.png"
    };
    
    // Update user information throughout the page
    document.getElementById('username').textContent = userData.fullName.split(' ')[0];
    document.getElementById('user-fullname').textContent = userData.fullName;
    document.getElementById('sidebar-username').textContent = userData.fullName;
    document.getElementById('user-email').textContent = userData.email;
    document.getElementById('user-mobile').textContent = userData.mobile;
    
    // Pre-fill settings form
    if (document.getElementById('settings-fullname')) {
        document.getElementById('settings-fullname').value = userData.fullName;
    }
    
    if (document.getElementById('settings-email')) {
        document.getElementById('settings-email').value = userData.email;
    }
    
    if (document.getElementById('settings-mobile')) {
        document.getElementById('settings-mobile').value = userData.mobile.replace('+91 ', '');
    }
    
    // Check if there are no active passes or bookings and show appropriate message
    checkEmptyStates();
}

/**
 * Initialize mobile menu toggle functionality
 */
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            menuBtn.classList.toggle('active');
            
            // Toggle icon between bars and X
            const icon = menuBtn.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (navLinks && navLinks.classList.contains('active') && 
            !event.target.closest('.nav-links') && 
            !event.target.closest('.mobile-menu-btn')) {
            navLinks.classList.remove('active');
            
            if (menuBtn) {
                menuBtn.classList.remove('active');
                const icon = menuBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        }
    });
}

/**
 * Setup dashboard tab navigation
 */
function setupTabNavigation() {
    const navLinks = document.querySelectorAll('.dashboard-nav ul li a');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    // Add click event to each navigation link
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the target panel id from href
            const targetId = this.getAttribute('href').substring(1);
            const targetPanelId = targetId + '-panel';
            
            // Remove active class from all links and add to clicked link's parent
            navLinks.forEach(link => link.parentElement.classList.remove('active'));
            this.parentElement.classList.add('active');
            
            // Hide all panels and show target panel
            tabPanels.forEach(panel => panel.classList.remove('active'));
            document.getElementById(targetPanelId).classList.add('active');
            
            // Update URL hash without scrolling
            history.pushState(null, null, '#' + targetId);
        });
    });
    
    // Check if URL has a hash on page load
    const hash = window.location.hash;
    if (hash) {
        const targetLink = document.querySelector(`.dashboard-nav ul li a[href="${hash}"]`);
        if (targetLink) {
            targetLink.click();
        }
    }
}

/**
 * Setup profile picture editor
 */
function setupProfilePictureEditor() {
    const editBtn = document.querySelector('.edit-profile-pic');
    
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            // Create a file input element
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            
            // Trigger click event to open file dialog
            fileInput.click();
            
            // Handle file selection
            fileInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        // Update profile picture with selected image
                        const profilePics = document.querySelectorAll('.profile-picture img');
                        profilePics.forEach(pic => {
                            pic.src = e.target.result;
                        });
                        
                        // In a real app, you would upload the image to a server here
                        console.log('Profile picture updated. In a real app, this would be uploaded to the server.');
                        
                        // Show notification
                        showNotification('Profile picture updated successfully!', 'success');
                    };
                    
                    reader.readAsDataURL(this.files[0]);
                }
            });
        });
    }
}

/**
 * Setup form submissions
 */
function setupFormSubmissions() {
    const profileForm = document.getElementById('profile-settings-form');
    
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            if (validateProfileForm()) {
                // In a real app, you would send form data to the server here
                console.log('Profile settings updated. In a real app, this would be saved to the server.');
                
                // Show notification
                showNotification('Profile settings updated successfully!', 'success');
            }
        });
    }
}

/**
 * Validate profile form
 * @returns {boolean} Whether the form is valid
 */
function validateProfileForm() {
    const fullName = document.getElementById('settings-fullname');
    const email = document.getElementById('settings-email');
    const mobile = document.getElementById('settings-mobile');
    const currentPassword = document.getElementById('current-password');
    const newPassword = document.getElementById('new-password');
    const confirmPassword = document.getElementById('confirm-password');
    
    let isValid = true;
    
    // Reset previous error states
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => group.classList.remove('error'));
    
    // Validate fullname
    if (fullName && !fullName.value.trim()) {
        fullName.parentElement.classList.add('error');
        isValid = false;
    }
    
    // Validate email
    if (email && (!email.value.trim() || !isValidEmail(email.value))) {
        email.parentElement.classList.add('error');
        isValid = false;
    }
    
    // Validate mobile
    if (mobile && (!mobile.value.trim() || !isValidMobile(mobile.value))) {
        mobile.parentElement.classList.add('error');
        isValid = false;
    }
    
    // Validate password change (only if the user is trying to change password)
    if (currentPassword && currentPassword.value.trim()) {
        // Check if new password is provided
        if (!newPassword || !newPassword.value.trim()) {
            newPassword.parentElement.classList.add('error');
            isValid = false;
        }
        
        // Check if confirm password is provided and matches new password
        if (!confirmPassword || !confirmPassword.value.trim() || 
            newPassword.value !== confirmPassword.value) {
            confirmPassword.parentElement.classList.add('error');
            isValid = false;
        }
    }
    
    return isValid;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether the email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate mobile number format
 * @param {string} mobile - Mobile number to validate
 * @returns {boolean} Whether the mobile number is valid
 */
function isValidMobile(mobile) {
    const mobileRegex = /^\d{10}$/;
    return mobileRegex.test(mobile);
}

/**
 * Setup pagination functionality
 */
function setupPagination() {
    const paginationNumbers = document.querySelectorAll('.pagination-numbers button');
    const prevBtn = document.querySelector('.pagination-btn.prev');
    const nextBtn = document.querySelector('.pagination-btn.next');
    
    if (paginationNumbers.length > 0) {
        // Add click event to pagination numbers
        paginationNumbers.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                paginationNumbers.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Enable/disable prev/next buttons
                updatePaginationButtons();
                
                // In a real app, you would fetch and display data for the selected page here
                console.log('Page ' + this.textContent + ' selected.');
            });
        });
        
        // Add click event to prev/next buttons
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (!this.classList.contains('disabled')) {
                    const activePage = document.querySelector('.pagination-numbers button.active');
                    const prevPage = activePage.previousElementSibling;
                    
                    if (prevPage) {
                        prevPage.click();
                    }
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                if (!this.classList.contains('disabled')) {
                    const activePage = document.querySelector('.pagination-numbers button.active');
                    const nextPage = activePage.nextElementSibling;
                    
                    if (nextPage) {
                        nextPage.click();
                    }
                }
            });
        }
        
        // Initial button state
        updatePaginationButtons();
    }
}

/**
 * Update pagination buttons state
 */
function updatePaginationButtons() {
    const paginationNumbers = document.querySelectorAll('.pagination-numbers button');
    const prevBtn = document.querySelector('.pagination-btn.prev');
    const nextBtn = document.querySelector('.pagination-btn.next');
    const activePage = document.querySelector('.pagination-numbers button.active');
    
    if (activePage && prevBtn && nextBtn) {
        // Disable prev button if first page is active
        if (activePage === paginationNumbers[0]) {
            prevBtn.classList.add('disabled');
        } else {
            prevBtn.classList.remove('disabled');
        }
        
        // Disable next button if last page is active
        if (activePage === paginationNumbers[paginationNumbers.length - 1]) {
            nextBtn.classList.add('disabled');
        } else {
            nextBtn.classList.remove('disabled');
        }
    }
}

/**
 * Setup route deletion functionality
 */
function setupRouteActions() {
    const deleteButtons = document.querySelectorAll('.saved-route-card .btn-icon');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the parent route card
            const routeCard = this.closest('.saved-route-card');
            
            // Confirm deletion
            if (confirm('Are you sure you want to delete this saved route?')) {
                // Remove the route card with animation
                routeCard.style.opacity = '0';
                setTimeout(() => {
                    routeCard.remove();
                    
                    // Check if there are no routes left
                    const routeCards = document.querySelectorAll('.saved-route-card');
                    if (routeCards.length === 0) {
                        document.querySelector('.no-saved-routes').style.display = 'block';
                    }
                }, 300);
                
                // Show notification
                showNotification('Route deleted successfully!', 'success');
            }
        });
    });
}

/**
 * Setup booking actions functionality
 */
function setupBookingActions() {
    // Setup download ticket buttons
    const downloadButtons = document.querySelectorAll('.booking-actions .btn-outline');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get booking ID from the card
            const bookingCard = this.closest('.booking-card');
            const bookingId = bookingCard.querySelector('.meta-item strong').textContent;
            
            // In a real app, this would generate and download a ticket
            console.log('Downloading ticket for booking ' + bookingId);
            
            // Show notification
            showNotification('Ticket downloaded successfully!', 'success');
        });
    });
    
    // Setup cancel booking buttons
    const cancelButtons = document.querySelectorAll('.booking-actions .btn-text.text-danger');
    
    cancelButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the parent booking card
            const bookingCard = this.closest('.booking-card');
            const bookingId = bookingCard.querySelector('.meta-item strong').textContent;
            
            // Confirm cancellation
            if (confirm('Are you sure you want to cancel this booking?')) {
                // In a real app, this would send a cancellation request to the server
                console.log('Cancelling booking ' + bookingId);
                
                // Update booking status to cancelled
                const statusBadge = bookingCard.querySelector('.booking-status .badge');
                statusBadge.textContent = 'Cancelled';
                statusBadge.classList.remove('confirmed');
                statusBadge.classList.add('cancelled');
                
                // Disable cancel button
                this.disabled = true;
                this.textContent = 'Cancelled';
                
                // Show notification
                showNotification('Booking cancelled successfully!', 'warning');
            }
        });
    });
    
    // Setup pass actions
    const downloadPassButton = document.querySelector('.pass-actions .btn-outline');
    if (downloadPassButton) {
        downloadPassButton.addEventListener('click', function() {
            // In a real app, this would generate and download a pass
            console.log('Downloading bus pass');
            
            // Show notification
            showNotification('Bus pass downloaded successfully!', 'success');
        });
    }
    
    const renewPassButton = document.querySelector('.pass-actions .btn-text');
    if (renewPassButton) {
        renewPassButton.addEventListener('click', function() {
            // Redirect to pass application page with renewal flag
            window.location.href = 'pass-application.html?renew=true';
        });
    }
}

/**
 * Check if there are empty states and show appropriate messages
 */
function checkEmptyStates() {
    // Check for active passes
    const activePassCards = document.querySelectorAll('.active-pass-card');
    const noPassesElement = document.querySelector('.no-passes');
    
    if (activePassCards.length === 0 && noPassesElement) {
        noPassesElement.style.display = 'block';
    }
    
    // Check for upcoming bookings
    const bookingCards = document.querySelectorAll('.booking-card');
    const noBookingsElement = document.querySelector('.no-bookings');
    
    if (bookingCards.length === 0 && noBookingsElement) {
        noBookingsElement.style.display = 'block';
    }
    
    // Check for saved routes
    const routeCards = document.querySelectorAll('.saved-route-card');
    const noRoutesElement = document.querySelector('.no-saved-routes');
    
    if (routeCards.length === 0 && noRoutesElement) {
        noRoutesElement.style.display = 'block';
    }
}

/**
 * Show notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // Check if notification container exists, if not, create it
    let notificationContainer = document.querySelector('.notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Add notification icon based on type
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-times-circle';
    if (type === 'warning') iconClass = 'fa-exclamation-triangle';
    
    notification.innerHTML = `
        <i class="fas ${iconClass}"></i>
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Append notification to container
    notificationContainer.appendChild(notification);
    
    // Add animation class after a short delay (for animation effect)
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Setup close button
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // Auto close after 5 seconds
    setTimeout(() => {
        closeNotification(notification);
    }, 5000);
}

/**
 * Close notification with animation
 * @param {HTMLElement} notification - Notification element to close
 */
function closeNotification(notification) {
    notification.classList.remove('show');
    
    // Remove from DOM after animation completes
    setTimeout(() => {
        if (notification.parentElement) {
            notification.parentElement.removeChild(notification);
        }
    }, 300);
}

/**
 * Handle logout functionality
 */
document.getElementById('logout-btn').addEventListener('click', function() {
    // In a real app, this would send a logout request to the server
    console.log('Logging out...');
    
    // Redirect to login page
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 500);
});