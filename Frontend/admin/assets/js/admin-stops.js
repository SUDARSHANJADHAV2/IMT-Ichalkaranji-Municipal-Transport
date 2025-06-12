// DOM Elements
const stopsTableBody = document.getElementById('stops-table-body');
const stopFormModal = document.getElementById('stop-form-modal');
const closeStopModalBtn = document.getElementById('close-stop-modal');
const stopModalTitle = document.getElementById('stop-modal-title');
const stopForm = document.getElementById('stop-form');
const stopModalError = document.getElementById('stop-modal-error');
const addNewStopBtn = document.getElementById('addNewStopBtn');
const noStopsMessage = document.getElementById('no-stops-message');

// Form Fields
const stopIdInput = document.getElementById('stopId');
const stopNameInput = document.getElementById('stopName');
const stopAddressTextarea = document.getElementById('stopAddress');
const stopLongitudeInput = document.getElementById('stopLongitude');
const stopLatitudeInput = document.getElementById('stopLatitude');

const loadingIndicatorStops = document.getElementById('loadingIndicatorStops');
const statusMessageStops = document.getElementById('statusMessageStops');

let editingStopId = null; // To store ID of stop being edited

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Admin auth check can be called from admin-common.js or handled by inline script
    // checkAdminAuth();
    fetchStopsAndRenderTable();

    if (addNewStopBtn) {
        addNewStopBtn.addEventListener('click', () => openStopFormModal(null));
    }
    if (closeStopModalBtn) {
        closeStopModalBtn.addEventListener('click', ()_ => {
            stopFormModal.style.display = 'none';
            if(stopModalError) stopModalError.style.display = 'none';
        });
    }
    if (stopForm) {
        stopForm.addEventListener('submit', handleStopFormSubmit);
    }
    window.addEventListener('click', (event) => { // Close modal if clicked outside
        if (event.target === stopFormModal) stopFormModal.style.display = 'none';
    });
});

// --- Data Fetching and Rendering ---
async function fetchStopsAndRenderTable() {
    showAdminLoading('loadingIndicatorStops', true, 'Loading stops...');
    displayAdminMessage('statusMessageStops', '', 'clear');
    if(noStopsMessage) noStopsMessage.style.display = 'none';

    try {
        const response = await localAdminFetchWithAuth('/api/stops');
        const result = await response.json();

        if (!response.ok) throw new Error(result.message || 'Failed to fetch stops.');

        if (result.success && result.data) {
            renderStopsTable(result.data);
        } else {
            displayAdminMessage('statusMessageStops', result.message || 'No stops found or error in response.', 'info');
        }
    } catch (error) {
        console.error('Error fetching stops:', error);
        displayAdminMessage('statusMessageStops', `Error: ${error.message}`, 'error');
    } finally {
        showAdminLoading('loadingIndicatorStops', false);
    }
}

function renderStopsTable(stops) {
    if (!stopsTableBody) return;
    stopsTableBody.innerHTML = '';

    if (stops.length === 0) {
        if(noStopsMessage) noStopsMessage.style.display = 'block';
        return;
    }

    stops.forEach(stop => {
        const row = stopsTableBody.insertRow();
        row.insertCell().textContent = stop.name;
        row.insertCell().textContent = stop.address || 'N/A';

        let coordinatesText = 'N/A';
        if (stop.location && stop.location.coordinates && stop.location.coordinates.length === 2) {
            coordinatesText = `${stop.location.coordinates[0].toFixed(5)}, ${stop.location.coordinates[1].toFixed(5)}`;
        }
        row.insertCell().textContent = coordinatesText;

        const actionsCell = row.insertCell();
        actionsCell.className = 'actions-cell';
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editBtn.className = 'btn btn-sm btn-warning';
        editBtn.addEventListener('click', () => openStopFormModal(stop._id));
        actionsCell.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteBtn.className = 'btn btn-sm btn-danger';
        deleteBtn.addEventListener('click', () => handleDeleteStop(stop._id, stop.name));
        actionsCell.appendChild(deleteBtn);
    });
}

// --- Modal and Form Handling ---
async function openStopFormModal(stopIdToEdit) {
    if (!stopFormModal || !stopModalTitle || !stopForm) return;
    stopForm.reset();
    if(stopModalError) stopModalError.style.display = 'none';

    if (stopIdToEdit) {
        editingStopId = stopIdToEdit;
        stopModalTitle.textContent = 'Edit Stop';
        showAdminLoading('loadingIndicatorStops', true, 'Fetching stop details...');
        try {
            const response = await localAdminFetchWithAuth(`/api/stops/${stopIdToEdit}`);
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Failed to fetch stop details.');

            const stop = result.data;
            if(stopIdInput) stopIdInput.value = stop._id;
            if(stopNameInput) stopNameInput.value = stop.name;
            if(stopAddressTextarea) stopAddressTextarea.value = stop.address || '';
            if (stop.location && stop.location.coordinates && stop.location.coordinates.length === 2) {
                if(stopLongitudeInput) stopLongitudeInput.value = stop.location.coordinates[0];
                if(stopLatitudeInput) stopLatitudeInput.value = stop.location.coordinates[1];
            } else {
                if(stopLongitudeInput) stopLongitudeInput.value = '';
                if(stopLatitudeInput) stopLatitudeInput.value = '';
            }
        } catch (error) {
            console.error('Error fetching stop for edit:', error);
            displayAdminMessage('stopModalError', `Error: ${error.message}`, 'error');
            showAdminLoading('loadingIndicatorStops', false);
            return;
        } finally {
            showAdminLoading('loadingIndicatorStops', false);
        }
    } else {
        editingStopId = null;
        stopModalTitle.textContent = 'Add New Stop';
        if(stopIdInput) stopIdInput.value = '';
    }
    stopFormModal.style.display = 'block';
}

async function handleStopFormSubmit(event) {
    event.preventDefault();
    if (!stopForm) return;

    const name = stopNameInput.value.trim();
    const address = stopAddressTextarea.value.trim();
    const longitudeStr = stopLongitudeInput.value.trim();
    const latitudeStr = stopLatitudeInput.value.trim();

    if (!name) {
        displayAdminMessage('stopModalError', 'Stop Name is required.', 'error');
        return;
    }

    const stopDataPayload = { name };
    if (address) stopDataPayload.address = address;

    if (longitudeStr && latitudeStr) {
        const longitude = parseFloat(longitudeStr);
        const latitude = parseFloat(latitudeStr);
        if (isNaN(longitude) || isNaN(latitude)) {
            displayAdminMessage('stopModalError', 'Longitude and Latitude must be valid numbers.', 'error');
            return;
        }
        stopDataPayload.longitude = longitude;
        stopDataPayload.latitude = latitude;
    } else if (longitudeStr || latitudeStr) {
        displayAdminMessage('stopModalError', 'Both Longitude and Latitude must be provided if location is set.', 'error');
        return;
    }

    const url = editingStopId ? `/api/stops/${editingStopId}` : '/api/stops';
    const method = editingStopId ? 'PUT' : 'POST';

    showAdminLoading('loadingIndicatorStops', true, editingStopId ? 'Updating stop...' : 'Adding stop...');
    displayAdminMessage('stopModalError', '', 'clear');

    try {
        const response = await localAdminFetchWithAuth(url, {
            method: method,
            body: JSON.stringify(stopDataPayload)
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || (editingStopId ? 'Failed to update stop.' : 'Failed to add stop.'));
        }

        displayAdminMessage('statusMessageStops', editingStopId ? 'Stop updated successfully!' : 'Stop added successfully!', 'success');
        if(stopFormModal) stopFormModal.style.display = 'none';
        fetchStopsAndRenderTable();
    } catch (error) {
        console.error('Stop form submission error:', error);
        displayAdminMessage('stopModalError', `Error: ${error.message}`, 'error');
    } finally {
        showAdminLoading('loadingIndicatorStops', false);
    }
}

async function handleDeleteStop(stopId, stopName) {
    if (!confirm(`Are you sure you want to delete Stop "${stopName}" (ID: ${stopId})? This may affect routes using this stop.`)) {
        return;
    }

    showAdminLoading('loadingIndicatorStops', true, 'Deleting stop...');
    try {
        const response = await localAdminFetchWithAuth(`/api/stops/${stopId}`, { method: 'DELETE' });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to delete stop.');
        }
        displayAdminMessage('statusMessageStops', 'Stop deleted successfully!', 'success');
        fetchStopsAndRenderTable();
    } catch (error) {
        console.error('Error deleting stop:', error);
        displayAdminMessage('statusMessageStops', `Error: ${error.message}`, 'error');
    } finally {
        showAdminLoading('loadingIndicatorStops', false);
    }
}

// --- UI Helper Functions ---
// Replaced with generic versions from admin-common.js:
// showStopLoading -> showAdminLoading('loadingIndicatorStops', ...)
// displayStopMessage -> displayAdminMessage('statusMessageStops' or 'stopModalError', ...)
// localAdminFetchWithAuth -> uses global from admin-common.js
