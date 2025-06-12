// DOM Elements
const applicationsTableBody = document.getElementById('applications-table-body');
const aadhaarModal = document.getElementById('aadhaar-modal');
const aadhaarModalContent = document.getElementById('aadhaar-modal-content');
const closeAadhaarModalBtn = document.getElementById('close-aadhaar-modal');
const rejectionModal = document.getElementById('rejection-modal');
const rejectionAppIdSpan = document.getElementById('rejection-app-id');
const rejectionReasonText = document.getElementById('rejection-reason-text');
const submitRejectionButton = document.getElementById('submit-rejection-button');
const closeRejectionModalBtn = document.getElementById('close-rejection-modal');
const rejectionModalError = document.getElementById('rejection-modal-error');
const loadingIndicatorApps = document.getElementById('loadingIndicatorApps');
const statusMessageApps = document.getElementById('statusMessageApps');
const noPendingAppsMessage = document.getElementById('no-pending-apps');


let currentApplicationIdForModal = null; // To store app ID for rejection

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // checkAdminAuth(); // Now called from admin-common.js or HTML inline script primarily
    fetchPendingApplications();

    // Modal close listeners
    if (closeAadhaarModalBtn) {
        closeAadhaarModalBtn.addEventListener('click', () => aadhaarModal.style.display = 'none');
    }
    if (closeRejectionModalBtn) {
        closeRejectionModalBtn.addEventListener('click', () => rejectionModal.style.display = 'none');
    }
    // Close modals if clicked outside content
    window.addEventListener('click', (event) => {
        if (event.target === aadhaarModal) aadhaarModal.style.display = 'none';
        if (event.target === rejectionModal) rejectionModal.style.display = 'none';
    });

    if (submitRejectionButton) {
        submitRejectionButton.addEventListener('click', handleRejectSubmit);
    }
});

// --- Authentication & Authorization ---
// checkAdminAuth(); // This can be called from admin-common.js if made global or directly in HTML.
// For now, primary auth check is inline in HTML.

// --- API Calls & Rendering ---
async function fetchPendingApplications() {
    // Using generic helpers from admin-common.js
    showAdminLoading('loadingIndicatorApps', true, 'Fetching pending applications...');
    displayAdminMessage('statusMessageApps', '', 'clear');
    if(noPendingAppsMessage) noPendingAppsMessage.style.display = 'none';


    try {
        const response = await localAdminFetchWithAuth('/api/pass-applications/pending');
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch pending applications.');
        }

        if (result.success && result.data) {
            renderApplicationsTable(result.data);
        } else {
            displayAdminMessage(result.message || 'No pending applications found or error in response.', 'info');
        }
    } catch (error) {
        console.error('Error fetching pending applications:', error);
        displayAdminMessage(`Error: ${error.message}`, 'error');
    } finally {
        showAdminLoading(false);
    }
}

function renderApplicationsTable(applications) {
    if (!applicationsTableBody) return;
    applicationsTableBody.innerHTML = ''; // Clear existing rows

    if (applications.length === 0) {
        if(noPendingAppsMessage) noPendingAppsMessage.style.display = 'block';
        return;
    }

    applications.forEach(app => {
        const row = applicationsTableBody.insertRow();
        const user = app.user || {};
        row.insertCell().textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A';
        row.insertCell().textContent = user.email || 'N/A';
        row.insertCell().textContent = user.phone || 'N/A';
        row.insertCell().textContent = app.passType;
        row.insertCell().textContent = app.duration;
        row.insertCell().textContent = new Date(app.createdAt || app.appliedOn).toLocaleDateString();

        // Aadhaar Cell
        const aadhaarCell = row.insertCell();
        const viewAadhaarBtn = document.createElement('button');
        viewAadhaarBtn.textContent = 'View Aadhaar';
        viewAadhaarBtn.className = 'btn btn-sm btn-info';
        viewAadhaarBtn.dataset.aadhaarUrl = app.aadhaarCardUrl;
        viewAadhaarBtn.addEventListener('click', () => openAadhaarModal(app.aadhaarCardUrl));
        aadhaarCell.appendChild(viewAadhaarBtn);

        // Actions Cell
        const actionsCell = row.insertCell();
        actionsCell.className = 'actions-cell';
        const approveBtn = document.createElement('button');
        approveBtn.textContent = 'Approve';
        approveBtn.className = 'btn btn-sm btn-success';
        approveBtn.dataset.applicationId = app._id;
        approveBtn.addEventListener('click', () => approveApplication(app._id));
        actionsCell.appendChild(approveBtn);

        const rejectBtn = document.createElement('button');
        rejectBtn.textContent = 'Reject';
        rejectBtn.className = 'btn btn-sm btn-danger';
        rejectBtn.dataset.applicationId = app._id;
        rejectBtn.addEventListener('click', () => openRejectionModal(app._id));
        actionsCell.appendChild(rejectBtn);
    });
}

// --- Modal Management ---
function openAadhaarModal(aadhaarUrl) {
    if (!aadhaarModal || !aadhaarModalContent) return;
    // Assuming backend serves uploads statically at /uploads/...(path stored in DB)
    // The URL might need adjustment based on how files are served.
    // If aadhaarUrl is a full URL from cloud storage, this will work directly.
    // For local, ensure `req.file.path` in controller is stored as a web-accessible path.
    // e.g. if controller stores `uploads/aadhaar/file.pdf`, then src should be `../../uploads/aadhaar/file.pdf` relative to admin page.
    // OR, make it an absolute path from domain root if 'uploads' is served statically from app root.
    // For now, assuming it's a path like 'uploads/aadhaar/filename.pdf' from the backend.
    const displayUrl = `../../${aadhaarUrl}`; // Adjust if your static serving is different

    const fileExtension = aadhaarUrl.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
        aadhaarModalContent.innerHTML = `<img src="${displayUrl}" alt="Aadhaar Card">`;
    } else if (fileExtension === 'pdf') {
        aadhaarModalContent.innerHTML = `<iframe src="${displayUrl}" width="100%" height="500px" title="Aadhaar PDF"></iframe> <p><a href="${displayUrl}" target="_blank">Open PDF in new tab</a></p>`;
    } else {
        aadhaarModalContent.innerHTML = `<p>Cannot preview this file type. <a href="${displayUrl}" target="_blank">Download/View Document</a></p>`;
    }
    aadhaarModal.style.display = 'block';
}

function openRejectionModal(applicationId) {
    if (!rejectionModal || !rejectionAppIdSpan || !rejectionReasonText) return;
    currentApplicationIdForModal = applicationId;
    rejectionAppIdSpan.textContent = applicationId;
    rejectionReasonText.value = ''; // Clear previous reason
    if(rejectionModalError) rejectionModalError.style.display = 'none'; // Clear previous modal errors
    rejectionModal.style.display = 'block';
}

// --- Action Handlers ---
async function approveApplication(applicationId) {
    if (!confirm('Are you sure you want to approve this pass application?')) return;

    // Using generic helpers
    showAdminLoading('loadingIndicatorApps', true, 'Approving application...');
    try {
        const response = await localAdminFetchWithAuth(`/api/pass-applications/${applicationId}/approve`, { method: 'PUT' }); // Uses shared fetch
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to approve application.');
        }
        displayAdminMessage('statusMessageApps', 'Application approved successfully!', 'success');
        fetchPendingApplications(); // Refresh the list
    } catch (error) {
        console.error('Error approving application:', error);
        displayAdminMessage('statusMessageApps', `Error: ${error.message}`, 'error');
    } finally {
        showAdminLoading('loadingIndicatorApps', false);
    }
}

async function handleRejectSubmit() {
    if (!rejectionReasonText || !currentApplicationIdForModal) return;
    const reason = rejectionReasonText.value.trim();
    if (!reason) {
        if(rejectionModalError) {
            rejectionModalError.textContent = 'Rejection reason is required.';
            rejectionModalError.style.display = 'block';
        }
        return;
    }
    if(rejectionModalError) rejectionModalError.style.display = 'none'; // This can remain for modal-specific error

    // Using generic helpers
    showAdminLoading('loadingIndicatorApps', true, 'Rejecting application...');
    if(rejectionModal) rejectionModal.style.display = 'none';

    try {
        const response = await localAdminFetchWithAuth(`/api/pass-applications/${currentApplicationIdForModal}/reject`, { // Uses shared fetch
            method: 'PUT',
            body: JSON.stringify({ rejectionReason: reason }),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to reject application.');
        }
        displayAdminMessage('statusMessageApps', 'Application rejected successfully.', 'success');
        fetchPendingApplications(); // Refresh list
    } catch (error) {
        console.error('Error rejecting application:', error);
        displayAdminMessage('statusMessageApps', `Error: ${error.message}`, 'error');
    } finally {
        showAdminLoading('loadingIndicatorApps', false);
        currentApplicationIdForModal = null; // Reset
    }
}


// --- UI Helper Functions ---
// Removed showAdminLoading and displayAdminMessage as they will use generic versions
// from admin-common.js

// Removed localAdminFetchWithAuth as it will use the one from admin-common.js
