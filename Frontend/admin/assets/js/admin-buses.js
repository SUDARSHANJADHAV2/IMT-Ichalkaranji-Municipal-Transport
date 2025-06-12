// DOM Elements
const busesTableBody = document.getElementById('buses-table-body');
const busFormModal = document.getElementById('bus-form-modal');
const closeBusModalBtn = document.getElementById('close-bus-modal');
const busModalTitle = document.getElementById('bus-modal-title');
const busForm = document.getElementById('bus-form');
const busModalError = document.getElementById('bus-modal-error');
const addNewBusBtn = document.getElementById('addNewBusBtn');
const noBusesMessage = document.getElementById('no-buses-message');

// Form Fields
const busIdInput = document.getElementById('busId');
const busNumberInput = document.getElementById('busNumber');
const busTypeSelect = document.getElementById('busType');
const capacityInput = document.getElementById('capacity');
const routeIdSelect = document.getElementById('routeId');
const fareInput = document.getElementById('fare');
const featuresTextarea = document.getElementById('features');
const isActiveCheckbox = document.getElementById('isActive');

const loadingIndicatorBuses = document.getElementById('loadingIndicatorBuses');
const statusMessageBuses = document.getElementById('statusMessageBuses');

let editingBusId = null; // To store ID of bus being edited

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Admin auth check can be called from admin-common.js or handled by inline script
    // checkAdminAuth();
    fetchBusesAndRenderTable();
    fetchRoutesForDropdown();

    if (addNewBusBtn) {
        addNewBusBtn.addEventListener('click', () => openBusFormModal(null));
    }
    if (closeBusModalBtn) {
        closeBusModalBtn.addEventListener('click', ()_ => {
            busFormModal.style.display = 'none';
            busModalError.style.display = 'none';
        });
    }
    if (busForm) {
        busForm.addEventListener('submit', handleBusFormSubmit);
    }
    window.addEventListener('click', (event) => { // Close modal if clicked outside
        if (event.target === busFormModal) busFormModal.style.display = 'none';
    });
});

// --- Data Fetching and Rendering ---
async function fetchBusesAndRenderTable() {
    showAdminLoading('loadingIndicatorBuses', true, 'Loading buses...');
    displayAdminMessage('statusMessageBuses', '', 'clear');
    if(noBusesMessage) noBusesMessage.style.display = 'none';

    try {
        const response = await localAdminFetchWithAuth('/api/buses');
        const result = await response.json();

        if (!response.ok) throw new Error(result.message || 'Failed to fetch buses.');

        if (result.success && result.data) {
            renderBusesTable(result.data);
        } else {
            displayAdminMessage('statusMessageBuses', result.message || 'No buses found or error in response.', 'info');
        }
    } catch (error) {
        console.error('Error fetching buses:', error);
        displayAdminMessage('statusMessageBuses', `Error: ${error.message}`, 'error');
    } finally {
        showAdminLoading('loadingIndicatorBuses', false);
    }
}

function renderBusesTable(buses) {
    if (!busesTableBody) return;
    busesTableBody.innerHTML = '';

    if (buses.length === 0) {
        if(noBusesMessage) noBusesMessage.style.display = 'block';
        return;
    }

    buses.forEach(bus => {
        const row = busesTableBody.insertRow();
        row.insertCell().textContent = bus.busNumber;
        row.insertCell().textContent = bus.busType;
        row.insertCell().textContent = bus.capacity;
        row.insertCell().textContent = bus.route ? bus.route.name : 'N/A';
        row.insertCell().textContent = bus.fare !== undefined ? `₹${bus.fare.toFixed(2)}` : 'N/A';
        row.insertCell().innerHTML = bus.isActive ? '<span style="color: green;">Yes</span>' : '<span style="color: red;">No</span>';

        const actionsCell = row.insertCell();
        actionsCell.className = 'actions-cell';
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editBtn.className = 'btn btn-sm btn-warning';
        editBtn.addEventListener('click', () => openBusFormModal(bus._id));
        actionsCell.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteBtn.className = 'btn btn-sm btn-danger';
        deleteBtn.addEventListener('click', () => handleDeleteBus(bus._id, bus.busNumber));
        actionsCell.appendChild(deleteBtn);
    });
}

async function fetchRoutesForDropdown() {
    try {
        const response = await localAdminFetchWithAuth('/api/routes');
        const result = await response.json();
        if (result.success && result.data) {
            populateRoutesDropdown(result.data);
        } else {
            console.error('Failed to fetch routes for dropdown:', result.message);
            if (routeIdSelect) routeIdSelect.innerHTML = '<option value="">Could not load routes</option>';
        }
    } catch (error) {
        console.error('Error fetching routes:', error);
        if (routeIdSelect) routeIdSelect.innerHTML = '<option value="">Error loading routes</option>';
    }
}

function populateRoutesDropdown(routes) {
    if (!routeIdSelect) return;
    routeIdSelect.innerHTML = '<option value="">Select a Route</option>'; // Default option
    routes.forEach(route => {
        const option = document.createElement('option');
        option.value = route._id;
        option.textContent = route.name; // Assuming route object has _id and name
        routeIdSelect.appendChild(option);
    });
}

// --- Modal and Form Handling ---
async function openBusFormModal(busId) {
    if (!busFormModal || !busModalTitle || !busForm) return;
    busForm.reset(); // Clear form fields
    if(busModalError) busModalError.style.display = 'none'; // Clear previous errors

    if (busId) { // Editing existing bus
        editingBusId = busId;
        busModalTitle.textContent = 'Edit Bus';
        showAdminLoading('loadingIndicatorBuses', true, 'Fetching bus details...');
        try {
            const response = await localAdminFetchWithAuth(`/api/buses/${busId}`);
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Failed to fetch bus details.');

            const bus = result.data;
            if(busIdInput) busIdInput.value = bus._id;
            if(busNumberInput) busNumberInput.value = bus.busNumber;
            if(busTypeSelect) busTypeSelect.value = bus.busType;
            if(capacityInput) capacityInput.value = bus.capacity;
            if(routeIdSelect) routeIdSelect.value = bus.route?._id || '';
            if(fareInput) fareInput.value = bus.fare;
            if(featuresTextarea) featuresTextarea.value = Array.isArray(bus.features) ? bus.features.join(', ') : '';
            if(isActiveCheckbox) isActiveCheckbox.checked = bus.isActive;

        } catch (error) {
            console.error('Error fetching bus for edit:', error);
            displayAdminMessage('busModalError', `Error: ${error.message}`, 'error');
            showAdminLoading('loadingIndicatorBuses', false);
            return;
        } finally {
            showAdminLoading('loadingIndicatorBuses', false);
        }
    } else { // Adding new bus
        editingBusId = null;
        busModalTitle.textContent = 'Add New Bus';
        if(busIdInput) busIdInput.value = ''; // Ensure hidden ID field is clear
        if(isActiveCheckbox) isActiveCheckbox.checked = true; // Default to active
    }
    busFormModal.style.display = 'block';
}

async function handleBusFormSubmit(event) {
    event.preventDefault();
    if (!busForm) return;

    const formData = new FormData(busForm);
    const busData = {};
    formData.forEach((value, key) => {
        if (key === 'features') {
            busData[key] = value.split(',').map(feature => feature.trim()).filter(f => f);
        } else if (key === 'isActive') {
            busData[key] = isActiveCheckbox.checked;
        } else if (key === 'capacity' || key === 'fare') {
            busData[key] = parseFloat(value);
        }
         else if (key !== 'busId') { // Don't include busId hidden field directly in payload unless needed for specific backend update logic
            busData[key] = value;
        }
    });
     if (!busData.route) { // Ensure route is not empty string if no selection
        displayBusMessage('Route is required.', 'error', true);
        return;
    }


    const url = editingBusId ? `/api/buses/${editingBusId}` : '/api/buses';
    const method = editingBusId ? 'PUT' : 'POST';

    showAdminLoading('loadingIndicatorBuses', true, editingBusId ? 'Updating bus...' : 'Adding bus...');
    displayAdminMessage('busModalError', '', 'clear'); // Clear modal error before submit

    try {
        const response = await localAdminFetchWithAuth(url, {
            method: method,
            body: JSON.stringify(busData)
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || (editingBusId ? 'Failed to update bus.' : 'Failed to add bus.'));
        }

        displayAdminMessage('statusMessageBuses', editingBusId ? 'Bus updated successfully!' : 'Bus added successfully!', 'success');
        if(busFormModal) busFormModal.style.display = 'none';
        fetchBusesAndRenderTable();
    } catch (error) {
        console.error('Bus form submission error:', error);
        displayAdminMessage('busModalError', `Error: ${error.message}`, 'error');
    } finally {
        showAdminLoading('loadingIndicatorBuses', false);
    }
}

async function handleDeleteBus(busId, busNumber) {
    if (!confirm(`Are you sure you want to delete Bus "${busNumber}" (ID: ${busId})? This action cannot be undone.`)) {
        return;
    }

    showAdminLoading('loadingIndicatorBuses', true, 'Deleting bus...');
    try {
        const response = await localAdminFetchWithAuth(`/api/buses/${busId}`, { method: 'DELETE' });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to delete bus.');
        }
        displayAdminMessage('statusMessageBuses', 'Bus deleted successfully!', 'success');
        fetchBusesAndRenderTable();
    } catch (error) {
        console.error('Error deleting bus:', error);
        displayAdminMessage('statusMessageBuses', `Error: ${error.message}`, 'error');
    } finally {
        showAdminLoading('loadingIndicatorBuses', false);
    }
}

// --- UI Helper Functions ---
// Replaced with generic versions from admin-common.js:
// showBusLoading -> showAdminLoading('loadingIndicatorBuses', ...)
// displayBusMessage -> displayAdminMessage('statusMessageBuses' or 'busModalError', ...)
// localAdminFetchWithAuth -> uses global from admin-common.js
