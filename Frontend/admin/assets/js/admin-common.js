// Admin Common Utility Functions

/**
 * Makes an authenticated fetch request.
 * @param {string} url The URL to fetch.
 * @param {object} options Fetch options (method, body, etc.).
 * @param {boolean} isFormData If true, Content-Type is not set (browser handles it for FormData).
 * @returns {Promise<Response>} The fetch Response object.
 */
async function localAdminFetchWithAuth(url, options = {}, isFormData = false) {
    const token = localStorage.getItem('authToken'); // Assuming token is stored here
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

/**
 * Shows or hides a loading indicator.
 * @param {string} elementId The ID of the loading indicator element.
 * @param {boolean} isLoading True to show, false to hide.
 * @param {string} message Optional message to display when loading.
 */
function showAdminLoading(elementId, isLoading, message = 'Processing...') {
    const indicator = document.getElementById(elementId);
    if (indicator) {
        indicator.textContent = message;
        indicator.style.display = isLoading ? 'block' : 'none';
    }
}

/**
 * Displays a status or error message.
 * @param {string} elementId The ID of the message area element.
 * @param {string} message The message to display.
 * @param {'info' | 'success' | 'error' | 'clear'} type The type of message.
 */
function displayAdminMessage(elementId, message, type = 'info') {
    const messageArea = document.getElementById(elementId);
    if (messageArea) {
        if (type === 'clear') {
            messageArea.textContent = '';
            messageArea.style.display = 'none';
            messageArea.className = 'status-message'; // Reset class
            return;
        }
        messageArea.textContent = message;
        // Assumes CSS classes 'status-message', 'success', 'error', 'info' are defined
        messageArea.className = `status-message ${type}`;
        messageArea.style.display = 'block';
    }
}

// Basic admin auth check - to be called on DOMContentLoaded in each admin JS file.
// Primary redirection is handled by inline script in HTML for immediate effect.
function checkAdminAuth() {
    const user = JSON.parse(localStorage.getItem('userData'));
    const token = localStorage.getItem('authToken');

    if (!token || !user || user.role !== 'admin') {
        console.warn("User is not admin or not logged in. Redirection should be handled by page's inline script if this message appears after page load.");
        // Fallback redirect if main HTML script fails or if this is called very early.
        // However, generally, the HTML inline script is more effective for immediate redirection.
        // Consider if this JS check should also force redirect or just log.
        // For now, just logging as HTML handles primary redirection.
    }
}
