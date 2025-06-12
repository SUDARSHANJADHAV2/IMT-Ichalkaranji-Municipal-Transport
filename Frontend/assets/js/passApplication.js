// Global variable to store the current application ID
let currentApplicationId = null;

// DOM Elements
const passApplicationForm = document.getElementById('pass-application-form');
const submitApplicationBtn = document.getElementById('submitApplicationBtn');
const otpSection = document.getElementById('otp-section');
const otpMessageArea = document.getElementById('otpMessageArea');
const otpInput = document.getElementById('otp-input');
const verifyOtpButton = document.getElementById('verify-otp-button');
const statusMessageArea = document.getElementById('statusMessageArea');
const loadingIndicator = document.getElementById('loadingIndicator');

// Form fields (for pre-filling and disabling)
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const ageInput = document.getElementById('age');
const addressInput = document.getElementById('address');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const passTypeSelect = document.getElementById('passType');
const durationSelect = document.getElementById('duration');
const aadhaarCardInput = document.getElementById('aadhaarCard');


document.addEventListener('DOMContentLoaded', () => {
    populateUserDetails();

    if (passApplicationForm) {
        passApplicationForm.addEventListener('submit', handleSubmitApplication);
    }
    if (verifyOtpButton) {
        verifyOtpButton.addEventListener('click', handleVerifyOtp);
    }
});

async function populateUserDetails() {
    const token = localStorage.getItem('authToken');
    // Assuming isUserLoggedIn is available globally from auth.js or similar
    if (!token || (typeof isUserLoggedIn === 'function' && !isUserLoggedIn())) {
        console.log('User not logged in. Please log in to pre-fill details.');
        return;
    }

    try {
        let userData = JSON.parse(localStorage.getItem('userData'));

        if (!userData) { // Fallback to fetch if not in localStorage
            const response = await localFetchWithAuth('/api/auth/me');
            if (!response.ok) {
                const errorResult = await response.json().catch(() => null);
                console.error('Failed to fetch user details for pre-fill:', errorResult ? errorResult.message : response.statusText);
                return;
            }
            const result = await response.json();
            userData = result.data;
            if(userData) localStorage.setItem('userData', JSON.stringify(userData)); // Cache for next time
        }

        if (userData) {
            if (firstNameInput) firstNameInput.value = userData.firstName || userData.name?.split(' ')[0] || '';
            if (lastNameInput) lastNameInput.value = userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '';
            if (emailInput) emailInput.value = userData.email || '';
            if (phoneInput) phoneInput.value = userData.phone || '';
        }
    } catch (error) {
        console.error('Error populating user details:', error);
    }
}

async function handleSubmitApplication(event) {
    event.preventDefault();
    showLoading(true, 'Submitting application...');
    displayMessage('', 'clear');

    const formData = new FormData(passApplicationForm);

    if (!formData.get('passType') || !formData.get('duration') || !formData.get('aadhaarCard') || !formData.get('aadhaarCard').name) {
        displayMessage('Please fill all required fields and upload Aadhaar card.', 'error');
        showLoading(false);
        return;
    }

    try {
        const response = await localFetchWithAuth('/api/pass-applications', {
            method: 'POST',
            body: formData,
        }, true);

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Application submission failed.');
        }

        if (result.success && result.data.applicationId) {
            currentApplicationId = result.data.applicationId;
            displayMessage('Application submitted! OTP sent to your phone: ' + phoneInput.value, 'success');
            if (passApplicationForm) passApplicationForm.style.display = 'none';
            if (otpSection) otpSection.style.display = 'block';
            if (otpMessageArea) otpMessageArea.textContent = `An OTP has been sent to ${phoneInput.value}. Please enter it below.`;
        } else {
            throw new Error(result.message || 'Failed to get application ID.');
        }

    } catch (error) {
        console.error('Application submission error:', error);
        displayMessage(`Error: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

async function handleVerifyOtp(event) {
    event.preventDefault();
    const otp = otpInput.value.trim();

    if (!currentApplicationId) {
        displayMessage('No application ID found. Please submit the application first.', 'error');
        return;
    }
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        displayMessage('Please enter a valid 6-digit OTP.', 'error');
        return;
    }

    showLoading(true, 'Verifying OTP...');
    displayMessage('', 'clear');

    try {
        const response = await localFetchWithAuth('/api/pass-applications/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ applicationId: currentApplicationId, otp }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'OTP verification failed.');
        }

        if (result.success) {
            displayMessage('OTP verified! Your application is now pending approval.', 'success');
            if (otpSection) otpSection.style.display = 'none';
            if (passApplicationForm) {
                Array.from(passApplicationForm.elements).forEach(element => element.disabled = true);
                if(submitApplicationBtn) {
                    submitApplicationBtn.textContent = "Application Submitted";
                    submitApplicationBtn.disabled = true;
                }
            }

        } else {
            throw new Error(result.message || 'Invalid OTP or server error.');
        }

    } catch (error) {
        console.error('OTP verification error:', error);
        displayMessage(`Error: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function showLoading(isLoading, message = 'Processing...') {
    if (loadingIndicator) {
        loadingIndicator.textContent = message;
        loadingIndicator.style.display = isLoading ? 'block' : 'none';
    }
}

function displayMessage(message, type = 'info') {
    if (statusMessageArea) {
        if (type === 'clear') {
            statusMessageArea.textContent = '';
            statusMessageArea.style.display = 'none';
            statusMessageArea.className = 'status-message';
            return;
        }
        statusMessageArea.textContent = message;
        statusMessageArea.className = `status-message ${type}`;
        statusMessageArea.style.display = 'block';
    }
}

async function localFetchWithAuth(url, options = {}, isFormData = false) {
    const token = localStorage.getItem('authToken');
    const headers = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const body = isFormData ? options.body : (options.body ? JSON.stringify(options.body) : null);

    return fetch(url, { ...options, headers, body });
}

// This is a simplified check. Ideally, auth.js provides a robust isUserLoggedIn function.
// For now, this will suffice for the pre-fill logic.
if (typeof isUserLoggedIn !== 'function') {
    function isUserLoggedIn() {
        return !!localStorage.getItem('authToken');
    }
}
