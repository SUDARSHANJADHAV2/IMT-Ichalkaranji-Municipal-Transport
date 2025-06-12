// DOM Elements
const routesTableBody = document.getElementById('routes-table-body');
const routeFormModal = document.getElementById('route-form-modal');
const closeRouteModalBtn = document.getElementById('close-route-modal');
const routeModalTitle = document.getElementById('route-modal-title');
const routeForm = document.getElementById('route-form');
const routeModalError = document.getElementById('route-modal-error');
const addNewRouteBtn = document.getElementById('addNewRouteBtn');
const noRoutesMessage = document.getElementById('no-routes-message');

// Form Fields
const routeIdInput = document.getElementById('routeId');
const routeNameInput = document.getElementById('routeName');
const routeStopsSelect = document.getElementById('routeStops'); // Multi-select
const routeDistanceInput = document.getElementById('routeDistance');
const routeEstDurationInput = document.getElementById('routeEstDuration');
const routeIsActiveCheckbox = document.getElementById('routeIsActive');
const operationalStartTimeInput = document.getElementById('operationalStartTime'); // Added
const operationalEndTimeInput = document.getElementById('operationalEndTime');   // Added

const loadingIndicatorRoutes = document.getElementById('loadingIndicatorRoutes');
const statusMessageRoutes = document.getElementById('statusMessageRoutes');

let editingRouteId = null; // To store ID of route being edited

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Admin auth check can be called from admin-common.js or handled by inline script
    // checkAdminAuth();
    fetchRoutesAndRenderTable();
    fetchStopsForMultiSelect();

    if (addNewRouteBtn) {
        addNewRouteBtn.addEventListener('click', () => openRouteFormModal(null));
    }
    if (closeRouteModalBtn) {
        closeRouteModalBtn.addEventListener('click', () => {
            routeFormModal.style.display = 'none';
            routeModalError.style.display = 'none';
        });
    }
    if (routeForm) {
        routeForm.addEventListener('submit', handleRouteFormSubmit);
    }
    window.addEventListener('click', (event) => { // Close modal if clicked outside
        if (event.target === routeFormModal) routeFormModal.style.display = 'none';
    });
});

// --- Data Fetching and Rendering ---
async function fetchRoutesAndRenderTable() {
    showAdminLoading('loadingIndicatorRoutes', true, 'Loading routes...');
    displayAdminMessage('statusMessageRoutes', '', 'clear');
    if(noRoutesMessage) noRoutesMessage.style.display = 'none';

    try {
        const response = await localAdminFetchWithAuth('/api/routes');
        const result = await response.json();

        if (!response.ok) throw new Error(result.message || 'Failed to fetch routes.');

        if (result.success && result.data) {
            renderRoutesTable(result.data);
        } else {
            displayAdminMessage('statusMessageRoutes', result.message || 'No routes found or error in response.', 'info');
        }
    } catch (error) {
        console.error('Error fetching routes:', error);
        displayAdminMessage('statusMessageRoutes', `Error: ${error.message}`, 'error');
    } finally {
        showAdminLoading('loadingIndicatorRoutes', false);
    }
}

function renderRoutesTable(routes) {
    if (!routesTableBody) return;
    routesTableBody.innerHTML = '';

    if (routes.length === 0) {
        if(noRoutesMessage) noRoutesMessage.style.display = 'block';
        return;
    }

    routes.forEach(route => {
        const row = routesTableBody.insertRow();
        row.insertCell().textContent = route.name;

        const stopsText = route.stops && route.stops.length > 0
            ? `${route.stops.length} stops (${route.stops.map(s => s.name).slice(0,3).join(', ')}${route.stops.length > 3 ? '...' : ''})`
            : 'N/A';
        row.insertCell().textContent = stopsText;

        row.insertCell().textContent = route.distance !== undefined ? `${route.distance} km` : 'N/A';
        row.insertCell().textContent = route.estimatedDuration !== undefined ? `${route.estimatedDuration} min` : 'N/A';
        row.insertCell().innerHTML = route.isActive ? '<span style="color: green;">Yes</span>' : '<span style="color: red;">No</span>';

        const actionsCell = row.insertCell();
        actionsCell.className = 'actions-cell';
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editBtn.className = 'btn btn-sm btn-warning';
        editBtn.addEventListener('click', () => openRouteFormModal(route._id));
        actionsCell.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteBtn.className = 'btn btn-sm btn-danger';
        deleteBtn.addEventListener('click', () => handleDeleteRoute(route._id, route.name));
        actionsCell.appendChild(deleteBtn);
    });
}

async function fetchStopsForMultiSelect() {
    if (!routeStopsSelect) return;
    try {
        const response = await localAdminFetchWithAuth('/api/stops');
        const result = await response.json();
        if (result.success && result.data) {
            routeStopsSelect.innerHTML = ''; // Clear loading/default
            result.data.forEach(stop => {
                const option = document.createElement('option');
                option.value = stop._id;
                option.textContent = stop.name;
                routeStopsSelect.appendChild(option);
            });
        } else {
            console.error('Failed to fetch stops for dropdown:', result.message);
            routeStopsSelect.innerHTML = '<option value="">Could not load stops</option>';
        }
    } catch (error) {
        console.error('Error fetching stops:', error);
        routeStopsSelect.innerHTML = '<option value="">Error loading stops</option>';
    }
}

// --- Modal and Form Handling ---
async function openRouteFormModal(routeIdToEdit) {
    if (!routeFormModal || !routeModalTitle || !routeForm) return;
    routeForm.reset();
    if (routeStopsSelect) { // Reset multi-select values
        Array.from(routeStopsSelect.options).forEach(option => option.selected = false);
    }
    if(routeModalError) routeModalError.style.display = 'none';

    if (routeIdToEdit) {
        editingRouteId = routeIdToEdit;
        routeModalTitle.textContent = 'Edit Route';
        showAdminLoading('loadingIndicatorRoutes', true, 'Fetching route details...');
        try {
            const response = await localAdminFetchWithAuth(`/api/routes/${routeIdToEdit}`);
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Failed to fetch route details.');

            const route = result.data;
            if(routeIdInput) routeIdInput.value = route._id;
            if(routeNameInput) routeNameInput.value = route.name;
            if(routeDistanceInput) routeDistanceInput.value = route.distance || '';
            if(routeEstDurationInput) routeEstDurationInput.value = route.estimatedDuration || '';
            if(operationalStartTimeInput) operationalStartTimeInput.value = route.operationalStartTime || '';
            if(operationalEndTimeInput) operationalEndTimeInput.value = route.operationalEndTime || '';
            if(routeIsActiveCheckbox) routeIsActiveCheckbox.checked = route.isActive;

            if (routeStopsSelect && route.stops) {
                route.stops.forEach(stop => {
                    const option = Array.from(routeStopsSelect.options).find(opt => opt.value === (stop._id || stop));
                    if (option) option.selected = true;
                });
            }
        } catch (error) {
            console.error('Error fetching route for edit:', error);
            displayAdminMessage('routeModalError', `Error: ${error.message}`, 'error');
            showAdminLoading('loadingIndicatorRoutes', false);
            return;
        } finally {
            showAdminLoading('loadingIndicatorRoutes', false);
        }
    } else {
        editingRouteId = null;
        routeModalTitle.textContent = 'Add New Route';
        if(routeIdInput) routeIdInput.value = '';
        if(routeIsActiveCheckbox) routeIsActiveCheckbox.checked = true;
    }
    routeFormModal.style.display = 'block';
}

async function handleRouteFormSubmit(event) {
    event.preventDefault();
    if (!routeForm) return;

    const selectedStopOptions = routeStopsSelect ? Array.from(routeStopsSelect.selectedOptions).map(option => option.value) : [];

    if (selectedStopOptions.length < 2) {
        displayRouteMessage('A route must have at least two stops selected.', 'error', true);
        return;
    }

    const routeData = {
        name: routeNameInput.value,
        stops: selectedStopOptions,
        distance: routeDistanceInput.value ? parseFloat(routeDistanceInput.value) : undefined,
        estimatedDuration: routeEstDurationInput.value ? parseInt(routeEstDurationInput.value, 10) : undefined,
        operationalStartTime: operationalStartTimeInput.value.trim(), // Added
        operationalEndTime: operationalEndTimeInput.value.trim(),   // Added
        isActive: routeIsActiveCheckbox.checked
    };

    // Validate operational times (basic check for presence, backend has regex)
    if (!routeData.operationalStartTime || !routeData.operationalEndTime) {
        displayRouteMessage('Operational Start and End Times are required.', 'error', true);
        return;
    }

    // Remove undefined fields so they don't overwrite with null in backend if not provided
    Object.keys(routeData).forEach(key => routeData[key] === undefined && delete routeData[key]);


    const url = editingRouteId ? `/api/routes/${editingRouteId}` : '/api/routes';
    const method = editingRouteId ? 'PUT' : 'POST';

    showAdminLoading('loadingIndicatorRoutes', true, editingRouteId ? 'Updating route...' : 'Adding route...');
    displayAdminMessage('routeModalError', '', 'clear');

    try {
        const response = await localAdminFetchWithAuth(url, {
            method: method,
            body: JSON.stringify(routeData)
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || (editingRouteId ? 'Failed to update route.' : 'Failed to add route.'));
        }

        displayAdminMessage('statusMessageRoutes', editingRouteId ? 'Route updated successfully!' : 'Route added successfully!', 'success');
        if(routeFormModal) routeFormModal.style.display = 'none';
        fetchRoutesAndRenderTable();
    } catch (error) {
        console.error('Route form submission error:', error);
        displayAdminMessage('routeModalError', `Error: ${error.message}`, 'error');
    } finally {
        showAdminLoading('loadingIndicatorRoutes', false);
    }
}

async function handleDeleteRoute(routeId, routeName) {
    if (!confirm(`Are you sure you want to delete Route "${routeName}" (ID: ${routeId})? This may affect buses assigned to this route.`)) {
        return;
    }

    showAdminLoading('loadingIndicatorRoutes', true, 'Deleting route...');
    try {
        const response = await localAdminFetchWithAuth(`/api/routes/${routeId}`, { method: 'DELETE' });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to delete route.');
        }
        displayAdminMessage('statusMessageRoutes', 'Route deleted successfully!', 'success');
        fetchRoutesAndRenderTable();
    } catch (error) {
        console.error('Error deleting route:', error);
        displayAdminMessage('statusMessageRoutes', `Error: ${error.message}`, 'error');
    } finally {
        showAdminLoading('loadingIndicatorRoutes', false);
    }
}

// --- UI Helper Functions ---
// Replaced with generic versions from admin-common.js:
// showRouteLoading -> showAdminLoading('loadingIndicatorRoutes', ...)
// displayRouteMessage -> displayAdminMessage('statusMessageRoutes' or 'routeModalError', ...)
// localAdminFetchWithAuth -> uses global from admin-common.js
